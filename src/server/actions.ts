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

  // Instead of deleting, move to trash
  const result = await MUTATIONS.moveFileToTrash({
    fileId: fileId,
    userId: session.userId,
  });

  console.log(result);

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
  const foldersToTrash = [];
  const filesToTrash = [];

  while (stk.length > 0) {
    const currentFolderId = stk.pop()!;
    foldersToTrash.push(currentFolderId);

    const [subfolders, files] = await Promise.all([
      QUERIES.getFolders(currentFolderId),
      QUERIES.getFiles(currentFolderId),
    ]);

    const userOwnedSubfolders = subfolders.filter(
      (subfolder) => subfolder.ownerId === session.userId,
    );
    stk.push(...userOwnedSubfolders.map((folder) => folder.id));

    filesToTrash.push(
      ...files
        .filter((file) => file.ownerId === session.userId)
        .map((file) => file.id),
    );
  }

  if (filesToTrash.length > 0) {
    for (const fileId of filesToTrash) {
      await MUTATIONS.moveFileToTrash({
        fileId,
        userId: session.userId,
      });
    }
  }

  for (const folderId of foldersToTrash) {
    await MUTATIONS.moveFolderToTrash({
      folderId,
      userId: session.userId,
    });
  }

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export async function permanentlyDeleteFile(fileId: number) {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }
  
  const [file] = await db
    .select()
    .from(files_table)
    .where(
      and(
        eq(files_table.id, fileId), 
        eq(files_table.ownerId, session.userId),
        eq(files_table.trashed, 1)
      ),
    );
    
  if (!file) {
    return { error: "File not found or not in trash" };
  }

  const utapiResult = await utApi.deleteFiles([
    file.url.replace("https://utfs.io/f/", ""),
  ]);

  console.log(utapiResult);

  const dbDeleteResult = await db
    .delete(files_table)
    .where(
      and(
        eq(files_table.id, fileId), 
        eq(files_table.ownerId, session.userId),
        eq(files_table.trashed, 1)
      ),
    );

  console.log(dbDeleteResult);

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export async function permanentlyDeleteFolder(folderId: number) {
  const session = await auth();
  if (!session.userId) {  
    return { error: "Unauthorized" };
  }

  const folder = await db
    .select()
    .from(folders_table)
    .where(
      and(
        eq(folders_table.id, folderId),
        eq(folders_table.ownerId, session.userId),
        eq(folders_table.trashed, 1)
      ),
    );
    
  if (!folder[0]) {
    return { error: "Folder not found or not in trash"};
  }

  const stk = [folderId];
  const foldersToDelete = [];
  const filesToDelete = [];

  while (stk.length > 0) {
    const currentFolderId = stk.pop()!;
    foldersToDelete.push(currentFolderId);

    // Get all subfolders and files, including trashed ones
    const subfolders = await db
      .select()
      .from(folders_table)
      .where(eq(folders_table.parent, currentFolderId));
      
    const files = await db
      .select()
      .from(files_table)
      .where(eq(files_table.parent, currentFolderId));

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

  // Delete files first
  if (filesToDelete.length > 0) {
    for (const fileId of filesToDelete) {
      const file = await db
        .select()
        .from(files_table)
        .where(eq(files_table.id, fileId));
        
      if (file[0]) {
        await utApi.deleteFiles([
          file[0].url.replace("https://utfs.io/f/", ""),
        ]);
      }
      
      await db
        .delete(files_table)
        .where(
          and(
            eq(files_table.id, fileId),
            eq(files_table.ownerId, session.userId),
          ),
        );
    }
  }

  // Delete folders
  for (const fId of foldersToDelete.reverse()) {
    await db
      .delete(folders_table)
      .where(
        and(
          eq(folders_table.id, fId),
          eq(folders_table.ownerId, session.userId),
        ),
      );
  }

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export async function restoreFileFromTrash(fileId: number) {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  const result = await MUTATIONS.restoreFileFromTrash({
    fileId,
    userId: session.userId,
  });

  console.log(result);

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export async function restoreFolderFromTrash(folderId: number) {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  // Restore this folder
  await MUTATIONS.restoreFolderFromTrash({
    folderId,
    userId: session.userId,
  });

  // Find and restore all sub-items that were moved to trash with this folder
  const stk = [folderId];
  const foldersToRestore = [];
  const filesToRestore = [];

  while (stk.length > 0) {
    const currentFolderId = stk.pop()!;
    
    if (currentFolderId !== folderId) {
      foldersToRestore.push(currentFolderId);
    }

    // Get all trashed subfolders and files
    const subfolders = await db
      .select()
      .from(folders_table)
      .where(
        and(
          eq(folders_table.parent, currentFolderId),
          eq(folders_table.trashed, 1)
        )
      );
      
    const files = await db
      .select()
      .from(files_table)
      .where(
        and(
          eq(files_table.parent, currentFolderId),
          eq(files_table.trashed, 1)
        )
      );

    const userOwnedSubfolders = subfolders.filter(
      (subfolder) => subfolder.ownerId === session.userId,
    );
    stk.push(...userOwnedSubfolders.map((folder) => folder.id));

    filesToRestore.push(
      ...files
        .filter((file) => file.ownerId === session.userId)
        .map((file) => file.id),
    );
  }

  // Restore files
  for (const fileId of filesToRestore) {
    await MUTATIONS.restoreFileFromTrash({
      fileId,
      userId: session.userId,
    });
  }

  // Restore subfolders
  for (const fId of foldersToRestore) {
    await MUTATIONS.restoreFolderFromTrash({
      folderId: fId,
      userId: session.userId,
    });
  }

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export async function emptyTrash() {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  // Get all trashed files and folders
  const [trashedFiles, trashedFolders] = await Promise.all([
    QUERIES.getTrashedFiles(session.userId),
    QUERIES.getTrashedFolders(session.userId),
  ]);

  // Delete all trashed files from storage
  for (const file of trashedFiles) {
    await utApi.deleteFiles([
      file.url.replace("https://utfs.io/f/", ""),
    ]);
  }

  // Delete all trashed files from database
  if (trashedFiles.length > 0) {
    await db
      .delete(files_table)
      .where(
        and(
          eq(files_table.ownerId, session.userId),
          eq(files_table.trashed, 1),
        ),
      );
  }

  // Delete all trashed folders from database
  if (trashedFolders.length > 0) {
    await db
      .delete(folders_table)
      .where(
        and(
          eq(folders_table.ownerId, session.userId),
          eq(folders_table.trashed, 1),
        ),
      );
  }

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}
