"use client";

import { FileIcon, Trash2Icon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { deleteFile } from "~/server/actions";
import type { files_table } from "~/server/db/schema";
import { useState } from "react";

export function FileRow({ file }: { file: typeof files_table.$inferSelect }) {
  const [isDeleting, setIsDeleting] = useState(false);

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
            onClick={async () => {
              setIsDeleting(true);
              await deleteFile(file.id);
              setIsDeleting(false);
            }}
            disabled={isDeleting}
            aria-label="Delete file"
          >
            {isDeleting ? (
              <svg
                className="h-4 w-4 animate-spin text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <Trash2Icon className="h-4 w-4 text-red-500" size={20} />
            )}
          </Button>
        </div>
      </div>
    </li>
  );
}  
