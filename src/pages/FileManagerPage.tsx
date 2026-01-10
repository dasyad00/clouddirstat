import { Navigate, useNavigate, useParams } from "react-router";
import {
  Backdrop,
  Breadcrumbs,
  Button,
  CircularProgress,
  Link,
  Typography,
} from "@mui/material";
import {
  CloudFolder,
  CloudItem,
  instanceOfCloudFolder,
} from "../types/cloudDrive";
import { ListView } from "../components/ListView";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useAuthContext } from "../contexts/AuthContext";
import Layout from "../components/Layout";
import { useQuery } from "@tanstack/react-query";

const FileExplorerPage: React.FC = () => {
  const { authState } = useAuthContext();
  const navigate = useNavigate();
  const params = useParams();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["folder", authState, params["*"]],
    queryFn: async () => {
      if (!authState) return;
      const [rootFolder, folderPath] = await Promise.all([
        authState.getFolder(params["*"]),
        authState.getFolderPath(params["*"] || "root"),
      ]);
      return { rootFolder, folderPath };
    },
  });

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
    if (data?.folderPath && data.folderPath.length > 1) {
      const parentFolder = data.folderPath[data.folderPath.length - 2];
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
        onClick={() => refetch()}
      >
        Reload
      </Button>
      <Breadcrumbs aria-label="breadcrumbs">
        {data?.folderPath?.map((folder) => (
          <Link
            key={folder.id}
            onClick={(event) => onBreadcrumbClick(event, folder)}
          >
            {folder.name}
          </Link>
        ))}
      </Breadcrumbs>
      {data?.folderPath && data.folderPath.length > 1 && <Button onClick={onNavigateUp}>Up</Button>}
      {data?.rootFolder && (
        <ListView
          files={data.rootFolder.children || []}
          onNavigateUp={() => data.folderPath.length > 1 && onNavigateUp()}
          onItemDoubleClick={onItemDoubleClick}
        />
      )}
    </Layout>
  );
};

export default FileExplorerPage;
