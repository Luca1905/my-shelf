"use client";

import {
  ChevronRight,
  Folder as FolderIcon,
} from "lucide-react";
import { FileRow } from "./_components/FileRow";
import { FolderRow } from "./_components/FolderRow";
import type { files_table, folders_table } from "~/server/db/schema";
import Link from "next/link";
import { SimpleUploadButton } from "./_components/upload-button";
import { useRouter } from "next/navigation";
import { createFolder } from "~/server/actions";
import { toast } from "sonner";
import { NewButton } from "./_components/new-button";

export default function DriveContents(props: {
  files: (typeof files_table.$inferSelect)[];
  folders: (typeof folders_table.$inferSelect)[];
  parents: (typeof folders_table.$inferSelect)[];

  currentFolderId: number;
}) {
  const navigate = useRouter();
  const handleCreateNew = async () => {
    await createFolder(props.currentFolderId, "New Folder");
    navigate.refresh();
    toast("New Folder Created", {
      description: "Succesfully created a new folder",
      duration: 5000,
      icon: <FolderIcon size={20} />,
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href={`/f/${props.parents[0]?.id}`}
              className="mr-2 text-gray-300 hover:text-white"
            >
              My Drive
            </Link>
            {props.parents.slice(1).map((folder, _) => (
              <div key={folder.id} className="flex items-center">
                <ChevronRight className="mx-2 text-gray-500" size={16} />
                <Link
                  href={`/f/${folder.id}`}
                  className="text-gray-300 hover:text-white"
                >
                  {folder.name}
                </Link>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <NewButton handleCreateNew={handleCreateNew} />
            <SimpleUploadButton folderId={props.currentFolderId} />
          </div>
        </div>
        <div className="rounded-lg bg-gray-800 shadow-xl">
          <div className="sticky top-0 z-10 border-b border-gray-700 bg-gray-800 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
              <div className="col-span-6">Name</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-3">Size</div>
              <div className="col-span-1"></div>
            </div>
          </div>
          <ul className="max-h-[calc(100vh-215px)] overflow-y-auto scrollbar scrollbar-thumb-sky-700">
            {props.folders.map((folder) => (
              <FolderRow key={folder.id} folder={folder} />
            ))}
            {props.files.map((file) => (
              <FileRow key={file.id} file={file} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
