import { ReactNode, createContext, useContext, useState } from "react";
import { CloudAuthState } from "../types/cloudProvider";

interface AuthContextProviderProps {
  children: ReactNode;
}

interface AuthContextProps {
  authState: CloudAuthState | null;
  setAuthState: (state: CloudAuthState) => void;
  clearAuthState: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [authState, setInternalAuthState] = useState<CloudAuthState | null>(
    null,
  );

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
