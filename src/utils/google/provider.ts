import { partition } from "../../utils";
import { CloudFolder, CloudItem } from "../../types/cloudDrive";
import { CloudAuthState, CloudProvider } from "../../types/cloudProvider";
import { getCloudFolderSize } from "../cloudFolder";
import { GDriveFile, getFile, getFiles } from "./service";

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
  folderId: string,
): Promise<CloudItem[]> {
  let gDriveFiles: GDriveFile[] = [];
  let pageToken: string | undefined = undefined;
  do {
    const response = await getFiles(token, {
      q: `'${folderId}' in parents and trashed = false`,
      nextPageToken: pageToken,
      fields: "nextPageToken, files(id, name, mimeType, size, iconLink, ownedByMe)",
    });
    if (response.data.files) {
      gDriveFiles = gDriveFiles.concat(response.data.files);
    }
    pageToken = response.data.nextPageToken;
  } while (pageToken);

  const [folders, files] = partition(
    (file) => file.mimeType === gdriveFolderMimeType,
    gDriveFiles,
  );

  const cloudFiles = files.map((file) => {
    return {
      id: file.id,
      name: file.name,
      size: file.ownedByMe ? parseInt(file.size || "0") : 0,
      iconLink: file.iconLink,
    };
  });

  const cloudFoldersPromises = folders.map(async (folder) => {
    const children = await getFilesRecursive(token, folder.id);
    const folderSize = getCloudFolderSize(children);
    return {
      id: folder.id,
      name: folder.name,
      size: folderSize,
      iconLink: folder.iconLink,
      children: [], // Return empty children for the list view
    } as CloudFolder;
  });
  const cloudFolders = await Promise.all(cloudFoldersPromises);

  return (cloudFolders as CloudItem[]).concat(cloudFiles);
}

export const GoogleProvider: CloudProvider = {
  id: "google",
  name: "Google Drive",
};

export class GoogleAuthState implements CloudAuthState {
  provider: CloudProvider = GoogleProvider;
  token: string;
  rootFolder: CloudFolder = {
    id: "root",
    name: "My Drive",
    size: 0,
    iconLink: "",
    children: [],
  };


  constructor(token: string) {
    this.token = token;
  }

  public async getFolder(folderId?: string): Promise<CloudFolder> {
    const isRoot = !folderId || folderId === "root";
    const currentFolderId = isRoot ? "root" : folderId;

    const children = await getFilesRecursive(this.token, currentFolderId);
    if (isRoot) {
      return {
        ...this.rootFolder,
        children,
        size: getCloudFolderSize(children),
      };
    }

    const folder = (await getFile(this.token, currentFolderId)).data;
    return GDriveFileToCloudFolder(folder, children);
  }

  public async getFolderPath(folderId: string): Promise<CloudFolder[]> {
    if (folderId === this.rootFolder.id) {
      return [this.rootFolder];
    }

    const folderResponse = await getFile(this.token, folderId);
    const currentFolder: CloudFolder = {
      id: folderResponse.data.id,
      name: folderResponse.data.name,
      size: 0,
      iconLink: "",
      children: [],
    };

    const parentId = folderResponse.data.parents?.[0];
    if (parentId) {
      const parentPath = await this.getFolderPath(parentId);
      return [...parentPath, currentFolder];
    } else {
      const parentPath = await this.getFolderPath(this.rootFolder.id);
      return [...parentPath, currentFolder];
    }
  }
}
