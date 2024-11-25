import { partition } from "../../utils";
import { CloudFolder, CloudItem } from "../../types/cloudDrive";
import { CloudAuthState, CloudProvider } from "../../types/cloudProvider";
import { getCloudFolderSize } from "../cloudFolder";
import { GDriveFile, getFiles } from "./service";

const gdriveFolderMimeType = "application/vnd.google-apps.folder";

function GDriveFileToCloudFolder(
  folder: GDriveFile,
  children: CloudItem[],
): CloudFolder {
  const folderSize = getCloudFolderSize(children);
  return {
    id: folder.id,
    name: folder.name,
    size: folderSize,
    iconLink: folder.iconLink,
    children: children,
  };
}

async function getFilesRecursive(
  token: string,
  folderId: string = "root",
  depth: number = 1000,
): Promise<CloudItem[]> {
  let gDriveFiles: GDriveFile[] = [];
  let pageToken: string | undefined = undefined;
  do {
    const response = await getFiles(token, {
      q: `'${folderId}' in parents`,
      nextPageToken: pageToken,
    });
    gDriveFiles = gDriveFiles.concat(response.data.files);
    pageToken = response.data.nextPageToken;
    if (pageToken) {
      console.log(`pageToken=${pageToken}`);
    }
  } while (pageToken);

  const [folders, files] = partition(
    (file) => file.mimeType === gdriveFolderMimeType,
    gDriveFiles,
  );
  const cloudFoldersPromise = folders.map(async (folder) => {
    if (depth < 0) {
      return GDriveFileToCloudFolder(folder, []);
    }
    const items = await getFilesRecursive(token, folder.id, depth - 1);
    return GDriveFileToCloudFolder(folder, items);
  });
  const cloudFiles = files.map((file) => {
    return {
      id: file.id,
      name: file.name,
      size: file.ownedByMe ? parseInt(file.size || "0") : 0,
      iconLink: file.iconLink,
    };
  });
  const cloudFolders = await Promise.all(cloudFoldersPromise);
  return (cloudFolders as CloudItem[]).concat(cloudFiles);
}

export const GoogleProvider: CloudProvider = {
  id: "google",
  name: "Google Drive",
};

export class GoogleAuthState implements CloudAuthState {
  provider: CloudProvider = GoogleProvider;
  token: string;

  constructor(token: string) {
    this.token = token;
  }

  public async getRootFolder(): Promise<CloudFolder> {
    const files = await getFilesRecursive(this.token);
    const myDriveCloudFolder: CloudFolder = {
      id: "root",
      name: "My Drive",
      size: getCloudFolderSize(files),
      iconLink: "",
      children: files,
    };
    return myDriveCloudFolder;
  }
}
