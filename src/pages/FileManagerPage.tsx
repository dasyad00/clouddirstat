import { Navigate, useNavigate, useParams } from "react-router";
import {
  Backdrop,
  Breadcrumbs,
  Button,
  CircularProgress,
  Link,
  Typography,
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
import Layout from "../components/Layout";

const FileExplorerPage: React.FC = () => {
  const { authState } = useAuthContext();
  const navigate = useNavigate();
  const params = useParams();

  const [rootFolder, setRootFolder] = useState<CloudFolder>();
  const [folderPath, setFolderPath] = useState<CloudFolder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchData = useCallback(
    async (path?: string) => {
      if (authState === null) return;
      try {
        const currentFolder = await authState.getFolder(path);
        const folderPath = await authState.getFolderPath(currentFolder.id);
        setRootFolder(currentFolder);
        setFolderPath(folderPath);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    },
    [authState],
  );

  useEffect(() => {
    if (authState === null || authState.token === "") return;
    setIsLoading(true);
    fetchData(params["*"]).finally(() => setIsLoading(false));
  }, [fetchData, authState, params]);

  function onBreadcrumbClick(
    _: React.MouseEvent<unknown>,
    cloudFolder: CloudFolder,
  ): void {
    navigate(`/explorer/${cloudFolder.id}`);
  }

  function onItemDoubleClick(
    _: React.MouseEvent<unknown>,
    cloudItem: CloudItem,
  ): void {
    if (instanceOfCloudFolder(cloudItem)) {
      navigate(`/explorer/${cloudItem.id}`);
    }
  }

  function onNavigateUp() {
    if (folderPath.length > 1) {
      const parentFolder = folderPath[folderPath.length - 2];
      navigate(`/explorer/${parentFolder.id}`);
    }
  }

  if (!authState || !authState.provider || !authState.token) {
    console.warn("Invalid FileManagePage state!");
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Typography variant="h4" >{`Connected to ${authState.provider.name}`}</Typography>
      <Button
        sx={{ m: 2 }}
        variant="contained"
        startIcon={<RefreshIcon />}
        onClick={() => fetchData(params["*"])}
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
    </Layout>
  );
};

export default FileExplorerPage;
