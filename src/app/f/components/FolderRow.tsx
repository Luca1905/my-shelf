"use client";

import { useState, useRef, useEffect } from "react";
import {
  Folder as FolderIcon,
  PencilIcon,
  XIcon,
  CheckIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { deleteFolder, renameFolder } from "~/server/actions";
import type { folders_table } from "~/server/db/schema";

export function FolderRow({
  folder,
}: {
  folder: typeof folders_table.$inferSelect;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleRename = async () => {
    setIsEditing(false);
    await renameFolder(folder.id, newName);
  };

  return (
    <li
      key={folder.id}
      className="group border-b border-gray-700 px-6 duration-200 hover:bg-gray-700"
    >
      <div className="grid grid-cols-12 items-center gap-4 py-4">
        <div className="col-span-6 flex items-center">
          <div className="flex h-6 w-full items-center gap-2">
            {isEditing ? (
              <>
                <form
                  className="flex w-full items-center"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await handleRename();
                  }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-transparent text-gray-100 focus:outline-none"
                    onBlur={handleRename}
                  />
                </form>
                <Button variant="ghost" onClick={handleRename}>
                  <CheckIcon className="text-green-500" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  aria-label="Cancel"
                >
                  <XIcon className="text-red-500" size={16} />
                </Button>
              </>
            ) : (
              <>
                <Link
                  href={`/f/${folder.id}`}
                  className="flex items-center text-gray-100 hover:text-blue-400"
                >
                  <FolderIcon className="mr-3" size={20} />
                  {folder.name}
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  aria-label="Edit folder"
                  className="hidden rounded p-2 hover:bg-gray-600 group-hover:block"
                >
                  <PencilIcon className="text-gray-400" size={16} />
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="col-span-2 text-gray-400">{"folder"}</div>
        <div className="col-span-3 text-gray-400"></div>
        <div className="col-span-1 text-gray-400">
          <Button
            variant="ghost"
            onClick={async () => {
              setIsDeleting(true);
              await deleteFolder(folder.id);
              setIsDeleting(false);
            }}
            disabled={isDeleting}
            aria-label="Delete folder"
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

