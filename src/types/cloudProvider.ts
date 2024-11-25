import { CloudFolder } from "./cloudDrive";

export interface CloudProvider {
  id: string;
  name: string;
}

export interface CloudAuthState {
  provider: CloudProvider;
  token: string;
  getRootFolder(): Promise<CloudFolder>;
}
