import { CloudItem } from "../types/cloudDrive";

export function getCloudFolderSize(children: CloudItem[]): number {
  return children.length > 0
    ? children.map((i) => i.size).reduce((a, b) => a + b)
    : 0;
}
