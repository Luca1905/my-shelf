"use client";

import { 
  FileIcon, 
  FolderIcon, 
  RefreshCwIcon, 
  Trash2Icon,
} from "lucide-react";
import { 
  emptyTrash, 
  permanentlyDeleteFile, 
  permanentlyDeleteFolder, 
  restoreFileFromTrash, 
  restoreFolderFromTrash 
} from "~/server/actions";
import type { files_table, folders_table } from "~/server/db/schema";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { LoadingSpinner } from "~/components/ui/loadingSpinner";
import { formatFileSize } from "~/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export default function TrashContents(props: {
  files: (typeof files_table.$inferSelect)[];
  folders: (typeof folders_table.$inferSelect)[];
  rootFolderId: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [isEmptyingTrash, setIsEmptyingTrash] = useState(false);
  const [isConfirmEmptyOpen, setIsConfirmEmptyOpen] = useState(false);

  const handleEmptyTrash = () => {
    setIsEmptyingTrash(true);
    startTransition(async () => {
      const myPromise = new Promise<void>((resolve, reject) => {
        emptyTrash()
          .then(() => resolve())
          .catch(reject);
      });

      toast.promise(myPromise, {
        loading: "Emptying trash...",
        success: "Trash has been emptied",
        error: "Error emptying trash",
      });
      setIsEmptyingTrash(false);
      setIsConfirmEmptyOpen(false);
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href={`/f/${props.rootFolderId}`}
              className="mr-2 text-gray-300 hover:text-white"
            >
              My Drive
            </Link>
            <span className="mx-2 text-gray-500">›</span>
            <span className="text-gray-300">Trash</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              onClick={() => setIsConfirmEmptyOpen(true)}
              disabled={isPending || isEmptyingTrash || (props.files.length === 0 && props.folders.length === 0)}
            >
              {isEmptyingTrash ? (
                <LoadingSpinner className="mr-2" />
              ) : (
                <Trash2Icon className="mr-2 h-4 w-4" />
              )}
              Empty Trash
            </Button>
          </div>
        </div>
        
        <div className="rounded-lg bg-gray-800 shadow-xl">
          <div className="sticky top-0 z-10 border-b border-gray-700 bg-gray-800 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
              <div className="col-span-5">Name</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-3">Size</div>
              <div className="col-span-2">Actions</div>
            </div>
          </div>
          
          <div className="max-h-[calc(100vh-215px)] overflow-y-auto scrollbar scrollbar-thumb-sky-700">
            {props.folders.length === 0 && props.files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                <Trash2Icon className="mb-4 h-12 w-12 opacity-50" />
                <h3 className="text-lg font-medium">Trash is empty</h3>
                <p className="mt-2 max-w-md text-sm">
                  Items in trash will be automatically deleted after 30 days
                </p>
              </div>
            ) : (
              <ul>
                {props.folders.map((folder) => (
                  <TrashedFolderRow key={folder.id} folder={folder} />
                ))}
                {props.files.map((file) => (
                  <TrashedFileRow key={file.id} file={file} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isConfirmEmptyOpen} onOpenChange={setIsConfirmEmptyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Empty Trash</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete all items in trash? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="destructive"
              onClick={handleEmptyTrash}
              disabled={isEmptyingTrash}
            >
              {isEmptyingTrash ? <LoadingSpinner className="mr-2" /> : null}
              Empty Trash
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmEmptyOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TrashedFileRow({ file }: { file: typeof files_table.$inferSelect }) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const handlePermanentDelete = () => {
    setIsDeleting(true);
    startTransition(async () => {
      const myPromise = new Promise<{ name: string }>((resolve, reject) => {
        permanentlyDeleteFile(file.id)
          .then(() => resolve({ name: file.name }))
          .catch(reject);
      });

      toast.promise(myPromise, {
        loading: "Deleting...",
        success: (data: { name: string }) => {
          return `${data.name} has been permanently deleted`;
        },
        error: "Error deleting file",
      });
      setIsDeleting(false);
      setIsConfirmDeleteOpen(false);
    });
  };

  const handleRestore = () => {
    setIsRestoring(true);
    startTransition(async () => {
      const myPromise = new Promise<{ name: string }>((resolve, reject) => {
        restoreFileFromTrash(file.id)
          .then(() => resolve({ name: file.name }))
          .catch(reject);
      });

      toast.promise(myPromise, {
        loading: "Restoring...",
        success: (data: { name: string }) => {
          return `${data.name} has been restored`;
        },
        error: "Error restoring file",
      });
      setIsRestoring(false);
    });
  };

  const isDisabled = isPending || isDeleting || isRestoring;

  return (
    <>
      <li key={file.id} className={`group border-b border-gray-700 px-6 hover:bg-gray-700 ${isDisabled ? "opacity-50" : ""}`}>
        <div className="grid grid-cols-12 items-center gap-4 py-3">
          <div className="col-span-5 flex items-center">
            <div className="flex items-center text-gray-100">
              <FileIcon className="mr-3" size={20} />
              {file.name}
            </div>
          </div>
          <div className="col-span-2 text-gray-400">file</div>
          <div className="col-span-3 text-gray-400">
            {formatFileSize(file.size)}
          </div>
          <div className="col-span-2 flex space-x-2 text-gray-400">
            <Button
              variant="ghost"
              onClick={handleRestore}
              disabled={isDisabled}
              aria-label="Restore file"
              className="h-8 w-8 p-0"
            >
              {isRestoring ? (
                <LoadingSpinner className="text-green-500" />
              ) : (
                <RefreshCwIcon className="h-4 w-4 text-green-500" />
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsConfirmDeleteOpen(true)}
              disabled={isDisabled}
              aria-label="Delete file permanently"
              className="h-8 w-8 p-0"
            >
              {isDeleting ? (
                <LoadingSpinner className="text-red-500" />
              ) : (
                <Trash2Icon className="h-4 w-4 text-red-500" />
              )}
            </Button>
          </div>
        </div>
      </li>

      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Permanent Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete &ldquo;{file.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="destructive"
              onClick={handlePermanentDelete}
              disabled={isDisabled}
            >
              {isDeleting ? <LoadingSpinner className="mr-2" /> : null}
              Delete Permanently
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmDeleteOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TrashedFolderRow({ folder }: { folder: typeof folders_table.$inferSelect }) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const handlePermanentDelete = () => {
    setIsDeleting(true);
    startTransition(async () => {
      const myPromise = new Promise<{ name: string }>((resolve, reject) => {
        permanentlyDeleteFolder(folder.id)
          .then(() => resolve({ name: folder.name }))
          .catch(reject);
      });

      toast.promise(myPromise, {
        loading: "Deleting...",
        success: (data: { name: string }) => {
          return `${data.name} has been permanently deleted`;
        },
        error: "Error deleting folder",
      });
      setIsDeleting(false);
      setIsConfirmDeleteOpen(false);
    });
  };

  const handleRestore = () => {
    setIsRestoring(true);
    startTransition(async () => {
      const myPromise = new Promise<{ name: string }>((resolve, reject) => {
        restoreFolderFromTrash(folder.id)
          .then(() => resolve({ name: folder.name }))
          .catch(reject);
      });

      toast.promise(myPromise, {
        loading: "Restoring...",
        success: (data: { name: string }) => {
          return `${data.name} has been restored`;
        },
        error: "Error restoring folder",
      });
      setIsRestoring(false);
    });
  };

  const isDisabled = isPending || isDeleting || isRestoring;

  return (
    <>
      <li key={folder.id} className={`group border-b border-gray-700 px-6 hover:bg-gray-700 ${isDisabled ? "opacity-50" : ""}`}>
        <div className="grid grid-cols-12 items-center gap-4 py-3">
          <div className="col-span-5 flex items-center">
            <div className="flex items-center text-gray-100">
              <FolderIcon className="mr-3" size={20} />
              {folder.name}
            </div>
          </div>
          <div className="col-span-2 text-gray-400">folder</div>
          <div className="col-span-3 text-gray-400"></div>
          <div className="col-span-2 flex space-x-2 text-gray-400">
            <Button
              variant="ghost"
              onClick={handleRestore}
              disabled={isDisabled}
              aria-label="Restore folder"
              className="h-8 w-8 p-0"
            >
              {isRestoring ? (
                <LoadingSpinner className="text-green-500" />
              ) : (
                <RefreshCwIcon className="h-4 w-4 text-green-500" />
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsConfirmDeleteOpen(true)}
              disabled={isDisabled}
              aria-label="Delete folder permanently"
              className="h-8 w-8 p-0"
            >
              {isDeleting ? (
                <LoadingSpinner className="text-red-500" />
              ) : (
                <Trash2Icon className="h-4 w-4 text-red-500" />
              )}
            </Button>
          </div>
        </div>
      </li>

      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Permanent Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete folder &ldquo;{folder.name}&rdquo; and all its contents? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="destructive"
              onClick={handlePermanentDelete}
              disabled={isDisabled}
            >
              {isDeleting ? <LoadingSpinner className="mr-2" /> : null}
              Delete Permanently
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmDeleteOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 