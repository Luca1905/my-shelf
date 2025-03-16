import { QUERIES } from "~/server/db/queries";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import TrashContents from "./trash-contents";

export default async function TrashPage() {
  const session = await auth();
  if (!session.userId) {
    return redirect("/sign-in");
  }

  const [trashedFiles, trashedFolders] = await Promise.all([
    QUERIES.getTrashedFiles(session.userId),
    QUERIES.getTrashedFolders(session.userId),
  ]);

  const rootFolder = await QUERIES.getRootFolderForUser(session.userId);
  if (!rootFolder) {
    return <div>Root folder not found</div>;
  }

  return (
    <TrashContents
      files={trashedFiles}
      folders={trashedFolders}
      rootFolderId={rootFolder.id}
    />
  );
} 