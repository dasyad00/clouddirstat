import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import { useGoogleLogin } from "@react-oauth/google";
import React from "react";
import { useNavigate } from "react-router";
import { useAuthContext } from "../contexts/AuthContext";
import { CloudAuthState, CloudProvider } from "../types/cloudProvider";
import { DropboxProvider } from "../utils/dropbox/provider";
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
        console.log(`DropboxProvider token=${accessToken}`);
        // eslint-disable-next-line no-fallthrough
        return;
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
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Select a Cloud Storage Provider
      </Typography>
      <Grid container spacing={3}>
        {providers.map((provider) => (
          <Grid item xs={12} sm={6} md={4} key={provider.id}>
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
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SelectProviderPage;
