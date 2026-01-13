import { Dropbox, files as dbxFiles } from "dropbox";
import { CloudFile, CloudFolder, CloudItem } from "../../types/cloudDrive";
import { getCloudFolderSize } from "../cloudFolder";

// Get the list of files and folders
export async function getFiles(
  dbx: Dropbox,
  path: string = ""
): Promise<CloudItem[]> {
  try {
    // For root, path is "", for others it's the folder ID
    const listPath = path === "root" ? "" : path;
    let response = await dbx.filesListFolder({ path: listPath });
    let entries = response.result.entries;

    while (response.result.has_more) {
      response = await dbx.filesListFolderContinue({
        cursor: response.result.cursor,
      });
      entries = entries.concat(response.result.entries);
    }

    const itemsPromises = entries.map(async (entry): Promise<CloudItem> => {
      if (entry[".tag"] === "folder") {
        const children = await getFiles(dbx, entry.id);
        const folderSize = getCloudFolderSize(children);
        return {
          id: entry.id,
          name: entry.name,
          size: folderSize,
          iconLink: "",
          children: [], // Return empty children for the list view to keep the payload light
        } as CloudFolder;
      } else if (entry[".tag"] === "file") {
        const file = entry as dbxFiles.FileMetadataReference;
        return {
          id: entry.id,
          name: entry.name,
          size: file.size || 0,
          iconLink: "",
        } as CloudFile;
      } else {
        return {
          id: entry.name,
          name: entry.name,
          size: 0,
          iconLink: "",
        }
      }
    });

    return await Promise.all(itemsPromises);
  } catch (error) {
    const err = (error instanceof Error) ? error.message : error;
    if (err?.error?.error_summary?.includes('path/not_found')) {
      return [];
    }
    console.error(`Error fetching files from Dropbox for path: ${path}`, error);
    throw error;
  }
}

export async function getMetadata(dbx: Dropbox, id: string): Promise<dbxFiles.MetadataReference> {
  const response = await dbx.filesGetMetadata({ path: id });
  return response.result;
}
