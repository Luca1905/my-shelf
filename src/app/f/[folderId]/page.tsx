import { QUERIES } from "~/server/db/queries";
import DriveContents from "./drive-contents";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function GoogleDriveClone(props: {
  params: Promise<{ folderId: string }>
}) {
  const session = await auth();
  if (!session.userId) {
    return redirect("/sign-in");
  }

  const params = await props.params;

  const parsedFolderId = parseInt(params.folderId);
  if (isNaN(parsedFolderId)) {
    return <div>Invalid folder ID</div>
  }

  const folder = await QUERIES.getFolderById(parsedFolderId);
  if (!folder) {
    return <div>Folder not found</div>
  }

  if (folder.ownerId !== session.userId) {
    return <div>You are not the owner of this folder</div>
  }

  const [files, folders, parents] = await Promise.all([
    QUERIES.getFiles(parsedFolderId),
    QUERIES.getFolders(parsedFolderId),
    QUERIES.getAllParentsForFolder(parsedFolderId),
  ]);

  return (
    <DriveContents
      files={files}
      folders={folders}
      parents={parents}
      currentFolderId={parsedFolderId}
    />
  );
}
