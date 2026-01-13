import { createContext, useContext } from "react";
import { CloudAuthState } from "../types/cloudProvider";

interface AuthContextProps {
  authState: CloudAuthState | null;
  setAuthState: (state: CloudAuthState) => void;
  clearAuthState: () => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function useAuthContext(): AuthContextProps {
  return useContext(AuthContext) as AuthContextProps;
}
