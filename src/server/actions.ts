"use server";

import { and, eq } from "drizzle-orm";
import { files_table } from "./db/schema";
import { db } from "./db";
import { auth } from "@clerk/nextjs/server";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";
import { MUTATIONS } from "./db/queries";

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

export async function createFolder(folderId: number) {
  const session = await auth();
  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  await MUTATIONS.createFolder({
    folder: {
      name: "New Folder",
      parent: folderId,
    },
    userId: session.userId,
  });

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}
