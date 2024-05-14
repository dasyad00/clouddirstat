import React, { useEffect, useState } from "react";
import {
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

const SCOPES = ["https://www.googleapis.com/auth/drive.metadata.readonly"];

interface GDriveFile {
  id: string;
  kind: string;
  mimeType: string;
  name: string;
}

interface GDriveFilesListResponse {
  nextPageToken: string;
  kind: string;
  incompleteSearch: boolean;
  files: GDriveFile[];
}

const GoogleDriveFiles: React.FC = () => {
  const [token, setToken] = useState<string>("");
  const [files, setFiles] = useState<GDriveFile[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      console.log("fetchData()");
      if (token === "") return;
      try {
        const response = await axios.get<GDriveFilesListResponse>(
          "https://www.googleapis.com/drive/v3/files",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response.data.files);
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
      <List>
        {files.map((file) => (
          <ListItem key={file.id}>
            <ListItemText primary={file.name} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default GoogleDriveFiles;
