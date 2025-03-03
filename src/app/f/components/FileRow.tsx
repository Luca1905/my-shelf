"use client";

import { FileIcon, Trash2Icon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { deleteFile } from "~/server/actions";
import type { files_table } from "~/server/db/schema";
import { useState, useTransition } from "react";
import { LoadingSpinner } from "~/components/ui/loadingSpinner";
import { useToast } from "~/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export function FileRow({ file }: { file: typeof files_table.$inferSelect }) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const deleting = isPending || isDeleting;
  const { toast } = useToast();

  const handleDelete = () => {
    setIsDeleting(true);
    startTransition(async () => {
      await deleteFile(file.id);
      setIsDeleting(false);
      toast({
        title: "File deleted",
        description: `${file.name} has been deleted successfully.`,
        className: "text-red-500",
      });
    });
  };

  return (
    <>
      <li
        key={file.id}
        className={`group border-b border-gray-700 px-6 duration-200 hover:bg-gray-700 ${
          deleting ? "opacity-50" : ""
        }`}
      >
        <div className="grid grid-cols-12 items-center gap-4 py-3">
          <div className="col-span-6 flex items-center">
            <a
              href={deleting ? "" : file.url}
              className="flex items-center text-gray-100 hover:text-blue-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileIcon className="mr-3" size={20} />
              {file.name}
            </a>
          </div>
          <div className="col-span-2 text-gray-400">file</div>
          <div className="col-span-3 text-gray-400">{file.size}</div>
          <div className="col-span-1 text-gray-400">
            <Button
              variant="ghost"
              onClick={() => setIsConfirmOpen(true)}
              disabled={deleting}
              aria-label="Delete file"
            >
              {deleting ? (
                <LoadingSpinner className="text-red-500" />
              ) : (
                <Trash2Icon className="h-4 w-4 text-red-500" size={20} />
              )}
            </Button>
          </div>
        </div>
      </li>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{file.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                handleDelete();
                setIsConfirmOpen(false);
              }}
              disabled={deleting}
            >
              {deleting ? <LoadingSpinner className="mr-2" /> : null}
              Delete
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
