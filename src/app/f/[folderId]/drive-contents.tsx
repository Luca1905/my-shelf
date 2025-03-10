"use client";

import {
  ChevronRight,
  Plus as PlusIcon,
  Upload as UploadIcon,
} from "lucide-react";
import { FileRow } from "../../../components/ui/FileRow";
import { FolderRow } from "../../../components/ui/FolderRow";
import type { files_table, folders_table } from "~/server/db/schema";
import Link from "next/link";
import { UploadButton } from "~/utils/uploadthing";
import { useRouter } from "next/navigation";
import { createFolder } from "~/server/actions";
import { useToast } from "~/hooks/use-toast";

export default function DriveContents(props: {
  files: (typeof files_table.$inferSelect)[];
  folders: (typeof folders_table.$inferSelect)[];
  parents: (typeof folders_table.$inferSelect)[];

  currentFolderId: number;
}) {
  const navigate = useRouter();
  const { toast } = useToast();

  const handleCreateNew = async () => {
    await createFolder(props.currentFolderId, "New Folder");
    navigate.refresh();
    toast({
      title: "New Folder created",
      description: "A new folder has been created successfully.",
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
            <div className="flex items-center justify-center gap-1 rounded-md" onClick={handleCreateNew}>
              <label
                className="group relative flex h-10 w-36 cursor-pointer items-center justify-center rounded-md text-gray-600 bg-white focus-within:ring-2"
              >
                <div className="flex items-center">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New
                </div>
              </label>
            </div>
            <UploadButton
              endpoint="shelfUploader"
              appearance={{
                button:
                  "ut-ready:bg-blue-500 ut-uploading:cursor-not-allowed bg-blue-500 text-white h-10 px-4 rounded-md flex items-center",
                container: "flex-row rounded-md",
                allowedContent: "hidden",
              }}
              onClientUploadComplete={(uploadedFileResponse) => {
                uploadedFileResponse.forEach((res) =>
                  toast({
                    title: "File uploaded",
                    description: `${res.name} has been uploaded successfully.`,
                  }),
                );
                navigate.refresh();
              }}
              input={{
                folderId: props.currentFolderId,
              }}
              content={{
                button: () => (
                  <div className="flex items-center">
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Upload
                  </div>
                ),
              }}
            />
          </div>
        </div>
        <div className="rounded-lg bg-gray-800 shadow-xl">
          <div className="border-b border-gray-700 px-6 py-4 sticky top-0 bg-gray-800 z-10">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
              <div className="col-span-6">Name</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-3">Size</div>
              <div className="col-span-1"></div>
            </div>
          </div>
          <ul className="scrollbar scrollbar-thumb-sky-700 max-h-[calc(100vh-215px)] overflow-y-auto">
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
