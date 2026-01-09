import { useCallback, useEffect } from "react";
import { DropboxAuth } from "dropbox";

const dbxAuth = new DropboxAuth({
  clientId: import.meta.env.VITE_DROPBOX_CLIENT_ID,
});

function getDropboxAuthUrl(redirectUri: string) {
  const state = "";
  const scope = ["files.metadata.read"];
  const authUrl = dbxAuth.getAuthenticationUrl(
    redirectUri,
    state,
    "code",
    "offline",
    scope,
    undefined,
    true
  );
  window.sessionStorage.clear();
  window.sessionStorage.setItem("codeVerifier", dbxAuth.getCodeVerifier());
  return authUrl;
}

type DropboxResponse2 = {
  access_token : string;
  account_id : string;
  expires_in : number;
  refresh_token : string;
  scope : string;
  token_type : string;
  uid : string;
}

// Complete the Dropbox OAuth2 flow by exchanging the code for an access token
async function onDropboxCompleteAuth(
  redirectUri: string,
  code: string
): Promise<string | null> {
  const codeVerifier = window.sessionStorage.getItem("codeVerifier");
  if (codeVerifier === null) return null;
  dbxAuth.setCodeVerifier(codeVerifier);
  const tokenResult = await dbxAuth.getAccessTokenFromCode(redirectUri, code);
  const accessToken = (tokenResult.result as DropboxResponse2).access_token;
  return accessToken;
}

interface DropboxLoginProps {
  onSuccess: (accessToken: string) => void;
  onError?: (error: Error) => void;
  redirectUri: string;
}

function useDropboxLogin(props: DropboxLoginProps) {
  const { onSuccess, onError, redirectUri } = props;

  useEffect(() => {
    const checkAuthCode = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      if (code) {
        try {
          const token = await onDropboxCompleteAuth(redirectUri, code);
          if (token) {
            onSuccess(token);
          }
        } catch (error) {
          console.error("Dropbox authentication failed: ", error);
          if (onError) {
            onError(error as Error);
          }
        }
      }
    };

    checkAuthCode();
  }, [onSuccess, onError, redirectUri]);

  const login = useCallback(async () => {
    const authUrl = await getDropboxAuthUrl(redirectUri);
    window.location.href = authUrl.toString();
  }, [redirectUri]);
  return login;
}

export default useDropboxLogin;
