import { Dropbox } from "dropbox";
import { CloudFolder } from "../../types/cloudDrive";
import { CloudAuthState, CloudProvider } from "../../types/cloudProvider";
import { getCloudFolderSize } from "../cloudFolder";
import { getFiles } from "./service";

export const DropboxProvider: CloudProvider = {
  id: "dropbox",
  name: "Dropbox",
};

export class DropboxAuthState implements CloudAuthState {
  provider: CloudProvider = DropboxProvider;
  token: string;
  dbx: Dropbox;

  constructor(token: string) {
    this.token = token;
    this.dbx = new Dropbox({ accessToken: token });
  }

  async getRootFolder(): Promise<CloudFolder> {
    const files = await getFiles(this.dbx);
    const rootFolder: CloudFolder = {
      id: "root",
      name: "Dropbox",
      size: getCloudFolderSize(files),
      iconLink: "",
      children: files,
    };
    return rootFolder;
  }
}
