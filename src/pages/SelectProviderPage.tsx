import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { useGoogleLogin } from "@react-oauth/google";
import React from "react";
import { useNavigate } from "react-router";
import { useAuthContext } from "../contexts/AuthContext";
import Layout from "../components/Layout";
import { CloudAuthState, CloudProvider } from "../types/cloudProvider";
import { DropboxAuthState, DropboxProvider } from "../utils/dropbox/provider";
import { GoogleAuthState, GoogleProvider } from "../utils/google/provider";
import useDropboxLogin from "../utils/dropbox/login";

const providers: CloudProvider[] = [GoogleProvider, DropboxProvider];

const GOOGLE_SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

const SelectProviderPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthState } = useAuthContext();

  const onLoginSuccess = (providerId: string, accessToken: string) => {
    console.log(`Received accessToken=${accessToken} for ${providerId}`);
    let state: CloudAuthState;
    switch (providerId) {
      case GoogleProvider.id:
        state = new GoogleAuthState(accessToken);
        break;
      case DropboxProvider.id:
        state = new DropboxAuthState(accessToken);
        break;
      default:
        return;
    }
    setAuthState(state);
    navigate("/explorer");
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onLoginError = (providerId: string, error: any) => {
    console.error(`onLoginError(${providerId}, err)`);
    console.error(error);
    localStorage.removeItem("accessToken");
  };

  const googleLogin = useGoogleLogin({
    onSuccess: (response) => onLoginSuccess("google", response.access_token),
    onError: (error) => onLoginError("google", error),
    scope: GOOGLE_SCOPES.join(" "),
  });

  const dropboxLogin = useDropboxLogin({
    onSuccess: (accessToken) => onLoginSuccess("dropbox", accessToken),
    onError: (error) => onLoginError("dropbox", error),
    redirectUri: window.location.origin + "/select-provider",
  });

  const handleProviderSelect = async (providerId: string) => {
    switch (providerId) {
      case GoogleProvider.id:
        googleLogin();
        return;
      case DropboxProvider.id:
        dropboxLogin();
        return;
      default:
        return;
    }
  };

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Select a Cloud Storage Provider
      </Typography>
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: {
            xs: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
        }}
      >
        {providers.map((provider) => (
          <Box key={provider.id}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h5" gutterBottom>
                  {provider.name}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => handleProviderSelect(provider.id)}
                >
                  Connect
                </Button>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Layout>
  );
};

export default SelectProviderPage;
