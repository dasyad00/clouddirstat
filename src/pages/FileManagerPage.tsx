import { Navigate } from "react-router";
import {
  Backdrop,
  Breadcrumbs,
  Button,
  CircularProgress,
  Link,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import {
  CloudFolder,
  CloudItem,
  instanceOfCloudFolder,
} from "../types/cloudDrive";
import { ListView } from "../components/ListView";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useAuthContext } from "../contexts/AuthContext";

const FileExplorerPage: React.FC = () => {
  const { authState } = useAuthContext();

  const [rootFolder, setRootFolder] = useState<CloudFolder>();
  const [folderPath, setFolderPath] = useState<CloudFolder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    console.log("fetchData()");
    if (authState === null) return;
    try {
      const rootFolder = await authState.getRootFolder();
      setRootFolder(rootFolder);
      setFolderPath([rootFolder]);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }, [authState]);

  useEffect(() => {
    if (authState === null || authState.token === "") return;
    setIsLoading(true);
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData, authState]);

  function onBreadcrumbClick(
    _: React.MouseEvent<unknown>,
    cloudFolder: CloudFolder,
  ): void {
    const folderIndex = folderPath.findIndex(
      (folder) => folder.id === cloudFolder.id,
    );
    if (folderIndex === -1) return;

    const newPath = folderPath.slice(0, folderIndex + 1);
    setRootFolder(cloudFolder);
    setFolderPath(newPath);
  }

  function onItemDoubleClick(
    _: React.MouseEvent<unknown>,
    cloudItem: CloudItem,
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

  if (!authState || !authState.provider || !authState.token) {
    console.warn("Invalid FileManagePage state!");
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <h1>{`Connected to ${authState.provider.name}`}</h1>
      <Button
        sx={{ m: 2 }}
        variant="contained"
        startIcon={<RefreshIcon />}
        onClick={() => fetchData()}
      >
        Reload
      </Button>
      <Breadcrumbs aria-label="breadcrumbs">
        {folderPath.map((folder) => (
          <Link
            key={folder.id}
            onClick={(event) => onBreadcrumbClick(event, folder)}
          >
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

export default FileExplorerPage;
