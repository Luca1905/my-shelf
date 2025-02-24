"use client";

import { FileIcon, Trash2Icon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { deleteFile } from "~/server/actions";
import type { files_table } from "~/server/db/schema";

export function FileRow({ file }: { file: typeof files_table.$inferSelect }) {
  return (
    <li
      key={file.id}
      className="hover:bg-gray-750 border-b border-gray-700 px-6 py-4"
    >
      <div className="grid grid-cols-12 items-center gap-4">
        <div className="col-span-6 flex items-center">
          <a
            href={file.url}
            className="flex items-center text-gray-100 hover:text-blue-400"
            target="_blank"
          >
            <FileIcon className="mr-3" size={20} />
            {file.name}
          </a>
        </div>
        <div className="col-span-2 text-gray-400">{"file"}</div>
        <div className="col-span-3 text-gray-400">{file.size}</div>
        <div className="col-span-1 text-gray-400">
          <Button
            variant="ghost"
            onClick={() => deleteFile(file.id)}
            aria-label="Delete file"
          >
            <Trash2Icon className="h-4 w-4 text-red-500" size={20} />
          </Button>
        </div>
      </div>
    </li>
  );
}  
