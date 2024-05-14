import React, { useEffect, useState } from "react";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useGoogleLogin } from "@react-oauth/google";
import { GDriveFile, getFiles } from "./googleDriveService";
import { partition } from "./utils";
import { CloudItem } from "./cloudDrive";

const SCOPES = ["https://www.googleapis.com/auth/drive.metadata.readonly"];

async function getFilesRecursive(
  token: string,
  folderId: string = "root",
  depth: number = 1000
): Promise<CloudItem[]> {
  const response = await getFiles(token, {
    q: `'${folderId}' in parents`,
  });
  const [folders, files] = partition(
    (file) => file.mimeType === gdriveFolderMimeType,
    response.data.files
  );
  const cloudFoldersPromise = folders.map(async (folder) => {
    if (depth < 0) {
      return {
        id: folder.id,
        name: folder.name,
        size: 0,
        iconLink: folder.iconLink,
        children: [],
      };
    }
    const items = await getFilesRecursive(token, folder.id, depth - 1);
    const folderSize =
      items.length > 0 ? items.map((i) => i.size).reduce((a, b) => a + b) : 0;
    return {
      id: folder.id,
      name: folder.name,
      size: folderSize,
      iconLink: folder.iconLink,
      children: items,
    };
  });
  const cloudFiles = files.map((file) => ({
    id: file.id,
    name: file.name,
    size: parseInt(file.size || "0"),
    iconLink: file.iconLink,
  }));
  const cloudFolders = await Promise.all(cloudFoldersPromise);
  return (cloudFolders as CloudItem[]).concat(cloudFiles);
}

const UNITS = ["B", "KB", "MB", "GB", "TB"];
function convertBytes(size: number): string {
  for (const u of UNITS) {
    if (size < 1024) {
      return `${size.toFixed(2)} ${u}`;
    }
    size /= 1024;
  }
  return `${size.toFixed(2)} ${UNITS[-1]}`;
}

const gdriveFolderMimeType = "application/vnd.google-apps.folder";

const alphabeticalSort = (a: string, b: string) => {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
};

const folderFirstSort = (a: GDriveFile, b: GDriveFile) => {
  if (
    a.mimeType === gdriveFolderMimeType &&
    b.mimeType !== gdriveFolderMimeType
  ) {
    return -1;
  }
  if (
    a.mimeType !== gdriveFolderMimeType &&
    b.mimeType === gdriveFolderMimeType
  ) {
    return 1;
  }
  return alphabeticalSort(a.name, b.name);
};

const GoogleDriveFiles: React.FC = () => {
  const [token, setToken] = useState<string>("");
  const [files, setFiles] = useState<CloudItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      console.log("fetchData()");
      if (token === "") return;
      try {
        const files = await getFilesRecursive(token);
        console.log(files);
        setFiles(files || []);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchData();
  }, [token]);

  const onLoginSuccess = (accessToken: string) => {
    console.log(`Received accessToken=${accessToken}`);
    setToken(accessToken);
  };

  const login = useGoogleLogin({
    onSuccess: (response) => onLoginSuccess(response.access_token),
    onError: (error) => console.error(error),
    scope: SCOPES.join(" "),
  });

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Google Drive Files
      </Typography>
      <Button onClick={() => login()}> Login</Button>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>File name</TableCell>
              <TableCell align="right">Size</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files.map((file) => (
              <TableRow
                key={file.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>
                  <img
                    srcSet={`${file.iconLink}?w=161&fit=crop&auto=format&dpr=2 2x`}
                    src={`${file.iconLink}?w=161&fit=crop&auto=format`}
                    alt={file.iconLink}
                    loading="lazy"
                  />
                </TableCell>
                <TableCell component="th" scope="row">
                  {file.name}
                </TableCell>
                {file.size ? (
                  <TableCell align="right">{convertBytes(file.size)}</TableCell>
                ) : (
                  <TableCell align="right"></TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default GoogleDriveFiles;
