import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { CloudAuthState, CloudProvider } from "../types/cloudProvider";
import { GoogleAuthState } from "../utils/google/provider";
import { DropboxAuthState } from "../utils/dropbox/provider";

const authStateKey = "authState";

interface AuthContextProviderProps {
  children: ReactNode;
}

interface AuthContextProps {
  authState: CloudAuthState | null;
  setAuthState: (state: CloudAuthState) => void;
  clearAuthState: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

function getInitialAuthState(): CloudAuthState | null {
  const json = localStorage.getItem(authStateKey);
  if (!json) {
    return null;
  }

  const storedState = JSON.parse(json) as { provider: CloudProvider; token: string };
  switch (storedState.provider.id) {
    case "google":
      return new GoogleAuthState(storedState.token);
    case "dropbox":
      return new DropboxAuthState(storedState.token);
    default:
      return null;
  }
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
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

export function useAuthContext(): AuthContextProps {
  return useContext(AuthContext) as AuthContextProps;
}
