export interface CloudFile {
  id: string;
  name: string;
  size: number;
  iconLink: string;
}

export interface CloudFolder {
  id: string;
  name: string;
  size: number;
  iconLink: string;
  children: CloudItem[];
}

export type CloudItem = CloudFile | CloudFolder;
