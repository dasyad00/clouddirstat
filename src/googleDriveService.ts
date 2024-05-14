import axios from "axios";

export interface GDriveFile {
  id: string;
  kind: string;
  mimeType: string;
  name: string;
  size: string | null;
  iconLink: string;
  parents: string[];
}

export interface GDriveFilesListResponse {
  nextPageToken: string;
  kind: string;
  incompleteSearch: boolean;
  files: GDriveFile[];
}

export function getFiles(token: string) {
  return axios.get<GDriveFilesListResponse>(
    "https://www.googleapis.com/drive/v3/files",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        spaces: "drive",
        q: "'root' in parents",
        fields:
          "nextPageToken, kind, incompleteSearch, files(id, name, size, mimeType, kind, parents, iconLink)",
      },
    }
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
    }
  );
}