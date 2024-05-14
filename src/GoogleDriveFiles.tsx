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

const SCOPES = ["https://www.googleapis.com/auth/drive.metadata.readonly"];

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

const GoogleDriveFiles: React.FC = () => {
  const [token, setToken] = useState<string>("");
  const [files, setFiles] = useState<GDriveFile[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      console.log("fetchData()");
      if (token === "") return;
      try {
        const response = await getFiles(token);
        console.log(response.data);
        setFiles(response.data.files || []);
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
                  <TableCell align="right">
                    {convertBytes(parseInt(file.size))}
                  </TableCell>
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
