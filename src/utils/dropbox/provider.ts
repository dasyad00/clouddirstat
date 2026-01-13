import { Dropbox } from "dropbox";
import { CloudFolder } from "../../types/cloudDrive";
import { CloudAuthState, CloudProvider } from "../../types/cloudProvider";
import { getCloudFolderSize } from "../cloudFolder";
import { getFiles, getMetadata, getMetadataId } from "./service";

export const DropboxProvider: CloudProvider = {
  id: "dropbox",
  name: "Dropbox",
};

export class DropboxAuthState implements CloudAuthState {
  provider: CloudProvider = DropboxProvider;
  token: string;
  dbx: Dropbox;
  rootFolder: CloudFolder = {
    id: "root",
    name: "Dropbox",
    size: 0,
    iconLink: "",
    children: [],
  };

  constructor(token: string) {
    this.token = token;
    this.dbx = new Dropbox({ accessToken: token });
  }

  public async getFolder(folderId?: string): Promise<CloudFolder> {
    const isRoot = !folderId || folderId === "root";
    const currentFolderId = isRoot ? "root" : folderId;

    const children = await getFiles(this.dbx, currentFolderId);
    const size = getCloudFolderSize(children);

    if (isRoot) {
      return {
        ...this.rootFolder,
        children,
        size,
      };
    }

    const metadata = await getMetadata(this.dbx, currentFolderId);
    return {
      id: getMetadataId(metadata),
      name: metadata.name,
      size,
      iconLink: "",
      children,
    };
  }

  public async getFolderPath(folderId: string): Promise<CloudFolder[]> {
    if (folderId === "root" || folderId === "") {
      return [this.rootFolder];
    }

    try {
      const metadata = await getMetadata(this.dbx, folderId);
      const path = metadata.path_lower;
      if (!path) {
        return [this.rootFolder];
      }

      const parentPath = path.substring(0, path.lastIndexOf("/"));
      const parentFolderPath = await this.getFolderPath(parentPath);

      const currentFolder: CloudFolder = {
        id: getMetadataId(metadata),
        name: metadata.name,
        size: 0,
        iconLink: "",
        children: [],
      };

      return [...parentFolderPath, currentFolder];
    } catch (error) {
      console.error("Error getting folder path for", folderId, error);
      // If an error occurs (e.g., folder not found), return the root path
      return [this.rootFolder];
    }
  }
}
