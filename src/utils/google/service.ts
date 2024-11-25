import axios from "axios";

export interface GDriveStorageQuota {
  limit: string;
  usageInDrive: string;
  usageInDriveTrash: string;
  usage: string;
}

export interface GDriveUser {
  displayName: string;
  kind: string;
  me: boolean;
  permissionId: string;
  emailAddress: string;
  photoLink: string;
}

export interface GDriveAbout {
  storageQuota: GDriveStorageQuota;
  user: GDriveUser;
}

export function getAbout(token: string) {
  return axios.get<GDriveAbout>("https://www.googleapis.com/drive/v3/about", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      fields: "storageQuota,user",
    },
  });
}

export interface GDriveSharedDrive {
  id: string;
  name: string;
  kind: string;
}

export interface GDriveSharedDriveListResponse {
  nextPageToken: string;
  kind: string;
  drives: GDriveSharedDrive[];
}

export function getSharedDrives(token: string) {
  return axios.get<GDriveSharedDriveListResponse>(
    "https://www.googleapis.com/drive/v3/drives",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export interface GDriveFile {
  id: string;
  kind: string;
  mimeType: string;
  name: string;
  size?: string;
  quotaBytesUsed: string;
  owners: GDriveUser[];
  ownedByMe: boolean;
  iconLink: string;
  parents: string[];
}

export interface GDriveFilesListRequestParameters {
  q?: string;
  driveId?: string;
  nextPageToken?: string;
}

export interface GDriveFilesListResponse {
  nextPageToken: string;
  kind: string;
  incompleteSearch: boolean;
  files: GDriveFile[];
}

export function getFiles(
  token: string,
  params: GDriveFilesListRequestParameters,
) {
  return axios.get<GDriveFilesListResponse>(
    "https://www.googleapis.com/drive/v3/files",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        // spaces: "drive",
        pageSize: 1000,
        q: params.q,
        driveId: params.driveId,
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        fields:
          "nextPageToken, kind, incompleteSearch, files(id, name, size, quotaBytesUsed, owners, ownedByMe, mimeType, kind, parents, iconLink)",
      },
    },
  );
}

export function getFile(token: string, fileId: string) {
  return axios.get<GDriveFilesListResponse>(
    `https://www.googleapis.com/drive/v3/files/${fileId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        spaces: "drive",
      },
    },
  );
}
