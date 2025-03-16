import "server-only";

import { db } from "~/server/db";
import {
  files_table as filesSchema,
  folders_table as foldersSchema,
} from "~/server/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export const QUERIES = {
  getAllParentsForFolder: async function (folderId: number) {
    const parents = [];
    let currentId: number | null = folderId;
    while (currentId !== null) {
      const folder = await db
        .selectDistinct()
        .from(foldersSchema)
        .where(eq(foldersSchema.id, currentId));

      if (!folder[0]) {
        throw new Error("Folder not found");
      }

      parents.unshift(folder[0]);
      currentId = folder[0]?.parent;
    }
    return parents;
  },

  getFiles: function (folderId: number) {
    return db
      .select()
      .from(filesSchema)
      .where(and(
        eq(filesSchema.parent, folderId),
        eq(filesSchema.trashed, 0)
      ))
      .orderBy(filesSchema.id);
  },

  getFolders: function (folderId: number) {
    return db
      .select()
      .from(foldersSchema)
      .where(and(
        eq(foldersSchema.parent, folderId),
        eq(foldersSchema.trashed, 0)
      ))
      .orderBy(foldersSchema.id);
  },

  getFolderById: async function (folderId: number) {
    const folder = await db
      .select()
      .from(foldersSchema)
      .where(eq(foldersSchema.id, folderId));
    return folder[0];
  },

  getRootFolderForUser: async function (userId: string) {
    const folder = await db
      .select()
      .from(foldersSchema)
      .where(
        and(eq(foldersSchema.ownerId, userId), isNull(foldersSchema.parent)),
      );
    return folder[0];
  },

  getTrashedFiles: function (userId: string) {
    return db
      .select()
      .from(filesSchema)
      .where(
        and(
          eq(filesSchema.ownerId, userId),
          eq(filesSchema.trashed, 1)
        )
      )
      .orderBy(filesSchema.id);
  },

  getTrashedFolders: function (userId: string) {
    return db
      .select()
      .from(foldersSchema)
      .where(
        and(
          eq(foldersSchema.ownerId, userId),
          eq(foldersSchema.trashed, 1)
        )
      )
      .orderBy(foldersSchema.id);
  },

  getTrashFolderForUser: async function (userId: string) {
    const rootFolder = await QUERIES.getRootFolderForUser(userId);
    if (!rootFolder) return null;
    
    const trashFolder = await db
      .select()
      .from(foldersSchema)
      .where(
        and(
          eq(foldersSchema.ownerId, userId),
          eq(foldersSchema.parent, rootFolder.id),
          eq(foldersSchema.name, "Trash")
        )
      );
    
    return trashFolder[0];
  }
};

export const MUTATIONS = {
  createFile: async function (input: {
    file: {
      name: string;
      size: number;
      url: string;
      parent: number;
    };
    userId: string;
  }) {
    return await db.insert(filesSchema).values({
      ...input.file,
      ownerId: input.userId,
    });
  },

  renameFile: async function (input: {
    fileId: number;
    newName: string;
    userId: string;
  }) {
    return await db
      .update(filesSchema)
      .set({ name: input.newName })
      .where(
        and(
          eq(filesSchema.id, input.fileId),
          eq(filesSchema.ownerId, input.userId),
        ),
      );
  },

  createFolder: async function (input: {
    folder: {
      name: string;
      parent: number;
    };
    userId: string;
  }) {
    return await db.insert(foldersSchema).values({
      ...input.folder,
      ownerId: input.userId,
    });
  },

  renameFolder: async function (input: {
    folderId: number;
    newName: string;
    userId: string;
  }) {
    return await db
      .update(foldersSchema)
      .set({ name: input.newName })
      .where(
        and(
          eq(foldersSchema.id, input.folderId),
          eq(foldersSchema.ownerId, input.userId),
        ),
      );
  },

  moveFileToTrash: async function(input: {
    fileId: number;
    userId: string;
  }) {
    return await db
      .update(filesSchema)
      .set({ trashed: 1 })
      .where(
        and(
          eq(filesSchema.id, input.fileId),
          eq(filesSchema.ownerId, input.userId),
        ),
      );
  },

  moveFolderToTrash: async function(input: {
    folderId: number;
    userId: string;
  }) {
    return await db
      .update(foldersSchema)
      .set({ trashed: 1 })
      .where(
        and(
          eq(foldersSchema.id, input.folderId),
          eq(foldersSchema.ownerId, input.userId),
        ),
      );
  },

  restoreFileFromTrash: async function(input: {
    fileId: number;
    userId: string;
  }) {
    return await db
      .update(filesSchema)
      .set({ trashed: 0 })
      .where(
        and(
          eq(filesSchema.id, input.fileId),
          eq(filesSchema.ownerId, input.userId),
        ),
      );
  },

  restoreFolderFromTrash: async function(input: {
    folderId: number;
    userId: string;
  }) {
    return await db
      .update(foldersSchema)
      .set({ trashed: 0 })
      .where(
        and(
          eq(foldersSchema.id, input.folderId),
          eq(foldersSchema.ownerId, input.userId),
        ),
      );
  },

  onboardUser: async function (userId: string) {
    const rootFolder = await db
      .insert(foldersSchema)
      .values({
        name: "Root",
        ownerId: userId,
        parent: null,
      })
      .$returningId();

    const rootFolderId = rootFolder[0]!.id;

    await db.insert(foldersSchema).values([
      {
        name: "Documents",
        ownerId: userId,
        parent: rootFolderId,
      },
      {
        name: "Trash",
        ownerId: userId,
        parent: rootFolderId,
      },
      {
        name: "Shared",
        ownerId: userId,
        parent: rootFolderId,
      },
    ]);

    return rootFolderId;
  },
};
