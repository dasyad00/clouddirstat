import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router";
import { CloudProvider } from "../types/cloudProvider";
import { useGoogleLogin } from "@react-oauth/google";
import { GoogleAuthState, GoogleProvider } from "../utils/google/provider";
import { useAuthContext } from "../contexts/AuthContext";

const providers: CloudProvider[] = [GoogleProvider];

const GOOGLE_SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

const SelectProviderPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthState } = useAuthContext();

  const onLoginSuccess = (providerId: string, accessToken: string) => {
    console.log(`Received accessToken=${accessToken} for ${providerId}`);
    const state = new GoogleAuthState(accessToken);
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

  const handleProviderSelect = async (providerId: string) => {
    switch (providerId) {
      case "google":
        googleLogin();
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
    </Box>
  );
};

export default SelectProviderPage;
