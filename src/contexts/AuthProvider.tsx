import { ReactNode, useEffect, useState } from "react";
import { CloudAuthState, CloudProvider } from "../types/cloudProvider";
import { DropboxAuthState } from "../utils/dropbox/provider";
import { GoogleAuthState } from "../utils/google/provider";
import { AuthContext } from "./AuthContext";

interface AuthContextProviderProps {
  children: ReactNode;
}

const authStateKey = "authState";

function getInitialAuthState(): CloudAuthState | null {
  const json = localStorage.getItem(authStateKey);
  if (!json) {
    return null;
  }

  const storedState = JSON.parse(json) as {
    provider: CloudProvider;
    token: string;
  };
  switch (storedState.provider.id) {
    case "google":
      return new GoogleAuthState(storedState.token);
    case "dropbox":
      return new DropboxAuthState(storedState.token);
    default:
      return null;
  }
}

export const AuthProvider = ({ children }: AuthContextProviderProps) => {
  const [authState, setInternalAuthState] = useState<CloudAuthState | null>(
    getInitialAuthState,
  );

  useEffect(() => {
    if (authState) {
      localStorage.setItem(authStateKey, JSON.stringify(authState));
    } else {
      localStorage.removeItem(authStateKey);
    }
  }, [authState]);

  function setAuthState(state: CloudAuthState) {
    setInternalAuthState(state);
  }

  function clearAuthState() {
    setInternalAuthState(null);
  }

  return (
    <AuthContext.Provider value={{ authState, setAuthState, clearAuthState }}>
      {children}
    </AuthContext.Provider>
  );
};
