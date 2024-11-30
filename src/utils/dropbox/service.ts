import { Dropbox, files as dbxFiles } from "dropbox";
import { CloudFile, CloudFolder, CloudItem } from "../../types/cloudDrive";

// Get the list of files and folders
export async function getFiles(dbx: Dropbox, path: string = ""): Promise<CloudItem[]> {
  try {
    let response = await dbx.filesListFolder({ path });
    let hasMore = response.result.has_more;
    let cursor = response.result.cursor;
    const output = response.result.entries;
    while (hasMore) {
        response = await dbx.filesListFolderContinue({ cursor });
        response.result.entries;
        hasMore = response.result.has_more;
        cursor = response.result.cursor
        const moreOutput = response.result.entries;
        output.concat(moreOutput);
    }

    const folders: dbxFiles.FolderMetadataReference[] = output.filter((metadata) => metadata[".tag"] === "folder");
    const files: dbxFiles.FileMetadataReference[] = output.filter((metadata) => metadata[".tag"] === "file");

    const cloudFolders: CloudFolder[] = folders.map((folder) => {
        // TODO
        // const items = await getFiles(dbx, folder.path_lower);
        return {
            id: folder.id,
            name: folder.name,
            iconLink: folder.preview_url ?? "",
            size: 0,
            children: [],
        };
    });

    const cloudFiles: CloudFile[] = files.map((file) => {
        return {
            id: file.id,
            name: file.name,
            size: file.size,
            iconLink: file.preview_url ?? "",
        };
    });

    return (cloudFolders as CloudItem[]).concat(cloudFiles);
  } catch (error) {
    console.error("Error fetching files from Dropbox:", error);
    throw error;
  }
}
