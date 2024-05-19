import React, { useEffect, useState } from "react";
import { Button, Typography } from "@mui/material";
import { useGoogleLogin } from "@react-oauth/google";
import { GDriveFile, getFiles } from "./googleDriveService";
import { partition } from "./utils";
import { CloudFolder, CloudItem, instanceOfCloudFolder } from "./cloudDrive";
import { ListView } from "./components/ListView";

const SCOPES = ["https://www.googleapis.com/auth/drive.metadata.readonly"];

const gdriveFolderMimeType = "application/vnd.google-apps.folder";

function getCloudFolderSize(children: CloudItem[]): number {
  return children.length > 0 ? children.map((i) => i.size).reduce((a, b) => a + b) : 0;
}

function GDriveFileToCloudFolder(folder: GDriveFile, children: CloudItem[]) : CloudFolder {
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
  const response = await getFiles(token, {
    q: `'${folderId}' in parents`,
  });
  const [folders, files] = partition(
    (file) => file.mimeType === gdriveFolderMimeType,
    response.data.files
  );
  const cloudFoldersPromise = folders.map(async (folder) => {
    if (depth < 0) {
      return GDriveFileToCloudFolder(folder, []);
    }
    const items = await getFilesRecursive(token, folder.id, depth - 1);
    return GDriveFileToCloudFolder(folder,  items);
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

const GoogleDriveFiles: React.FC = () => {
  const [token, setToken] = useState<string>("");
  const [rootFolder, setRootFolder] = useState<CloudFolder>();

  useEffect(() => {
    const fetchData = async () => {
      console.log("fetchData()");
      if (token === "") return;
      try {
        const files = await getFilesRecursive(token);
        const rootFolder: CloudFolder = {
          id: "root",
          name: "My Drive",
          size: getCloudFolderSize(files),
          iconLink: "",
          children: files,
        };
        console.log(files);
        setRootFolder(rootFolder);
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

  function onItemDoubleClick(
    event: React.MouseEvent<unknown>,
    cloudItem: CloudItem
  ): void {
    if (instanceOfCloudFolder(cloudItem)) {
      setRootFolder(cloudItem);
    }
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Google Drive Files
      </Typography>
      <Button onClick={() => login()}> Login</Button>
      <ListView
        files={rootFolder?.children || []}
        onItemDoubleClick={onItemDoubleClick}
      />
    </div>
  );
};

export default GoogleDriveFiles;
