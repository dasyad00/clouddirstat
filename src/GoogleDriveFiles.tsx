import GoogleIcon from "@mui/icons-material/Google";
import RefreshIcon from '@mui/icons-material/Refresh';
import { Breadcrumbs, Button, Link, Typography } from "@mui/material";
import { useGoogleLogin } from "@react-oauth/google";
import React, { useCallback, useEffect, useState } from "react";
import { CloudFolder, CloudItem, instanceOfCloudFolder } from "./cloudDrive";
import { ListView } from "./components/ListView";
import {
  GDriveAbout,
  GDriveFile,
  getAbout,
  getFiles,
} from "./googleDriveService";
import { convertBytes, partition } from "./utils";

const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

const gdriveFolderMimeType = "application/vnd.google-apps.folder";

function getCloudFolderSize(children: CloudItem[]): number {
  return children.length > 0
    ? children.map((i) => i.size).reduce((a, b) => a + b)
    : 0;
}

function GDriveFileToCloudFolder(
  folder: GDriveFile,
  children: CloudItem[]
): CloudFolder {
  const folderSize = getCloudFolderSize(children);
  return {
    id: folder.id,
    name: folder.name,
    size: folderSize,
    iconLink: folder.iconLink,
    children: children,
  };
}

async function getFilesRecursive(
  token: string,
  folderId: string = "root",
  depth: number = 1000
): Promise<CloudItem[]> {
  let gDriveFiles: GDriveFile[] = [];
  let pageToken: string | undefined = undefined;
  do {
    const response = await getFiles(token, {
      q: `'${folderId}' in parents`,
      nextPageToken: pageToken,
    });
    gDriveFiles = gDriveFiles.concat(response.data.files);
    pageToken = response.data.nextPageToken;
    if (pageToken) {
      console.log(`pageToken=${pageToken}`);
    }
  } while (pageToken);

  const [folders, files] = partition(
    (file) => file.mimeType === gdriveFolderMimeType,
    gDriveFiles
  );
  const cloudFoldersPromise = folders.map(async (folder) => {
    if (depth < 0) {
      return GDriveFileToCloudFolder(folder, []);
    }
    const items = await getFilesRecursive(token, folder.id, depth - 1);
    return GDriveFileToCloudFolder(folder, items);
  });
  const cloudFiles = files.map((file) => {
    return {
      id: file.id,
      name: file.name,
      size: parseInt(file.size || "0"),
      iconLink: file.iconLink,
    };
  });
  const cloudFolders = await Promise.all(cloudFoldersPromise);
  return (cloudFolders as CloudItem[]).concat(cloudFiles);
}

const GoogleDriveFiles: React.FC = () => {
  const cachedAccessToken = localStorage.getItem("accessToken");

  const [token, setToken] = useState<string>(cachedAccessToken ?? "");
  const [rootFolder, setRootFolder] = useState<CloudFolder>();
  const [aboutObject, setAboutObject] = useState<GDriveAbout>();
  const [folderPath, setFolderPath] = useState<CloudFolder[]>([]);

  const fetchData = useCallback(async (token: string) => {
    console.log("fetchData()");
    try {
      const files = await getFilesRecursive(token);
      const myDriveCloudFolder: CloudFolder = {
        id: "root",
        name: "My Drive",
        size: getCloudFolderSize(files),
        iconLink: "",
        children: files,
      };

      setRootFolder(myDriveCloudFolder);
      setFolderPath([myDriveCloudFolder]);
      const about = await getAbout(token);
      setAboutObject(about.data);
    } catch (error) {
      console.error("Error fetching files:", error);
      setToken("");
    }
  }, []);

  useEffect(() => {
    if (token === "") return;
    fetchData(token);
  }, [fetchData, token]);

  const onLoginSuccess = (accessToken: string) => {
    console.log(`Received accessToken=${accessToken}`);
    setToken(accessToken);
    // Cache accessToken
    localStorage.setItem("accessToken", accessToken);
  };

  const login = useGoogleLogin({
    onSuccess: (response) => onLoginSuccess(response.access_token),
    onError: (error) => {
      console.error(error);
      localStorage.removeItem("accessToken");
    },
    scope: SCOPES.join(" "),
  });

  function onBreadcrumbClick(
    _: React.MouseEvent<unknown>,
    cloudFolder: CloudFolder
  ): void {
    const folderIndex = folderPath.findIndex(
      (folder) => folder.id === cloudFolder.id
    );
    if (folderIndex === -1) return;

    const newPath = folderPath.slice(0, folderIndex + 1);
    setRootFolder(cloudFolder);
    setFolderPath(newPath);
  }

  function onItemDoubleClick(
    _: React.MouseEvent<unknown>,
    cloudItem: CloudItem
  ): void {
    if (instanceOfCloudFolder(cloudItem)) {
      setRootFolder(cloudItem);
      setFolderPath([...folderPath, cloudItem]);
    }
  }

  function onNavigateUp() {
    if (folderPath.length > 1) {
      const newPath = folderPath.slice(0, -1);
      setRootFolder(newPath[newPath.length - 1]);
      setFolderPath(newPath);
    }
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Google Drive Files
      </Typography>
      {token === "" && (
        <Button
          sx={{ m: 2 }}
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={() => login()}
        >
          Login
        </Button>
      )}
      <Button
        sx={{ m: 2 }}
        variant="contained"
        startIcon={<RefreshIcon />}
        onClick={() => fetchData(token)}
      >
        Reload
      </Button>
      {rootFolder && <h1>Total: {convertBytes(rootFolder.size)}</h1>}
      {aboutObject && (
        <>
          <h1>{convertBytes(parseInt(aboutObject.storageQuota?.limit))}</h1>
          <h1>{convertBytes(parseInt(aboutObject.storageQuota?.usage))}</h1>
          <h1>
            {convertBytes(
              parseInt(aboutObject.storageQuota?.usageInDriveTrash)
            )}
          </h1>
          <h1>
            {convertBytes(parseInt(aboutObject.storageQuota?.usageInDrive))}
          </h1>
        </>
      )}
      <Breadcrumbs aria-label="breadcrumbs">
        {folderPath.map((folder) => (
          <Link onClick={(event) => onBreadcrumbClick(event, folder)}>
            {folder.name}
          </Link>
        ))}
      </Breadcrumbs>
      {folderPath.length > 1 && <Button onClick={onNavigateUp}>Up</Button>}
      {rootFolder && (
        <ListView
          files={rootFolder.children || []}
          onNavigateUp={() => folderPath.length > 1 && onNavigateUp()}
          onItemDoubleClick={onItemDoubleClick}
        />
      )}
    </div>
  );
};

export default GoogleDriveFiles;
