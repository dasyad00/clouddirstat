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

export function instanceOfCloudFolder(object: CloudItem): object is CloudFolder {
  return "children" in object;
}
