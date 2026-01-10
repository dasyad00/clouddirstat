import { CloudFolder } from "./cloudDrive";

export interface CloudProvider {
  id: string;
  name: string;
}

export interface CloudAuthState {
  provider: CloudProvider;
  token: string;
  getFolder(folderId?: string): Promise<CloudFolder>;
  getFolderPath(folderId: string): Promise<CloudFolder[]>;
}
