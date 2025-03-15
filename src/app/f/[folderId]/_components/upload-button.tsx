"use client";

import { useRouter } from "next/navigation";
import { useUploadThing } from "~/utils/uploadthing";
import { toast } from "sonner";
import { usePostHog } from "posthog-js/react";
import { Upload } from "lucide-react";
import { useRef } from "react";

import { generateMimeTypes, UploadAbortedError } from "uploadthing/client";

type Input = Parameters<typeof useUploadThing>;

const useUploadThingInputProps = (folderId: number, ...args: Input) => {
  const $ut = useUploadThing(...args);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    const result = await $ut
      .startUpload(selectedFiles, { folderId })
      .catch((e) => {
        if (e instanceof UploadAbortedError) {
          console.log("upload cancelled complete");
          toast.dismiss("upload-begin");
          toast.error("Upload cancelled");
        } else {
          throw e;
        }
      });
    console.log("uploaded files", result);

    return;
  };

  const acceptMimeTypes = $ut.routeConfig
    ? generateMimeTypes($ut.routeConfig)
    : [];

  return {
    inputProps: {
      onChange,
      multiple: ($ut.routeConfig?.blob?.maxFileCount ?? 1) > 1,
      accept: acceptMimeTypes.join(", "),
    },
    isUploading: $ut.isUploading,
  };
};

export function SimpleUploadButton({ folderId }: { folderId: number }) {
  const navigate = useRouter();
  const posthog = usePostHog();
  const acRef = useRef(new AbortController());

  const { inputProps, isUploading } = useUploadThingInputProps(
    folderId,
    "shelfUploader",
    {
      signal: acRef.current.signal,
      onUploadBegin() {
        posthog.capture("upload_begin");
        toast.loading("Uploading...", {
          id: "upload-begin",
          cancel: {
            label: "Cancel",
            onClick: () => {
              acRef.current.abort();
              acRef.current = new AbortController();
              console.log("upload cancelled requested");
            },
          },
        });
      },
      onUploadError(error) {
        posthog.capture("upload_error", { error });
        toast.dismiss("upload-begin");
        toast.error("Upload failed");
      },
      onClientUploadComplete(res) {
        posthog.capture("upload_complete", { fileCount: res.length });
        toast.dismiss("upload-begin");
        toast.success("Upload complete!");
        navigate.refresh();
      },
    },
  );

  return (
    <div className="flex items-center justify-center gap-1 rounded-md">
      <label
        className={`group relative flex h-10 w-36 cursor-pointer items-center justify-center rounded-md bg-blue-600 text-white transition-colors focus-within:ring-2 hover:bg-blue-700 ${
          isUploading ? "pointer-events-none opacity-70" : ""
        }`}
        htmlFor="upload-button"
      >
        <div className="flex items-center">
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? "Uploading..." : "Upload"}
        </div>
      </label>
      <input
        id="upload-button"
        type="file"
        className="sr-only"
        disabled={isUploading}
        {...inputProps}
      />
    </div>
  );
}
