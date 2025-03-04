"use server";

import { and, eq, inArray } from "drizzle-orm";
import { files_table, folders_table } from "./db/schema";
import { db } from "./db";
import { auth } from "@clerk/nextjs/server";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";
import { MUTATIONS, QUERIES } from "./db/queries";

const utApi = new UTApi();

export async function deleteFile(fileId: number) {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }
  const [file] = await db
    .select()
    .from(files_table)
    .where(
      and(eq(files_table.id, fileId), eq(files_table.ownerId, session.userId)),
    );
  if (!file) {
    return { error: "File not found" };
  }

  const utapiResult = await utApi.deleteFiles([
    file.url.replace("https://utfs.io/f/", ""),
  ]);

  console.log(utapiResult);

  const dbDeleteResult = await db
    .delete(files_table)
    .where(
      and(eq(files_table.id, fileId), eq(files_table.ownerId, session.userId)),
    );

  console.log(dbDeleteResult);

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export async function renameFile(fileId: number, newName: string) {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  const dbRenameResult = await MUTATIONS.renameFile({
    fileId: fileId,
    newName: newName,
    userId: session.userId,
  })

  console.log(dbRenameResult);

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export async function createFolder(parentId: number, folderName: string) {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  await MUTATIONS.createFolder({
    folder: {
      name: folderName,
      parent: parentId,
    },
    userId: session.userId,
  });

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export async function renameFolder(folderId: number, newName: string) {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  await MUTATIONS.renameFolder({
    folderId,
    newName,
    userId: session.userId,
  });

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export async function deleteFolder(folderId: number) {
  const session = await auth();
  if (!session.userId) {  
    return { error: "Unauthorized" };
  }

  const folder = await QUERIES.getFolderById(folderId);
  if (!folder) {
    return { error: "Folder not found"};
  }
  if (folder.ownerId !== session.userId) {
    return { error: "Unauthorized" };
  }

  const stk = [folderId];
  const foldersToDelete = [];
  const filesToDelete = [];

  while (stk.length > 0) {
    const currentFolderId = stk.pop()!;
    foldersToDelete.push(currentFolderId);

    const [subfolders, files] = await Promise.all([
      QUERIES.getFolders(currentFolderId),
      QUERIES.getFiles(currentFolderId),
    ]);

    const userOwnedSubfolders = subfolders.filter(
      (subfolder) => subfolder.ownerId === session.userId,
    );
    stk.push(...userOwnedSubfolders.map((folder) => folder.id));

    filesToDelete.push(
      ...files
        .filter((file) => file.ownerId === session.userId)
        .map((file) => file.id),
    );
  }

  if (filesToDelete.length > 0) {
    await db
      .delete(files_table)
      .where(
        and(
          inArray(files_table.id, filesToDelete),
          eq(files_table.ownerId, session.userId),
        ),
      );
  }

  for (const folderId of foldersToDelete.reverse()) {
    await db
      .delete(folders_table)
      .where(
        and(
          eq(folders_table.id, folderId),
          eq(folders_table.ownerId, session.userId),
        ),
      );
  }

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}
