import { PlusIcon } from "lucide-react";

export function NewButton(props: { handleCreateNew: () => void }) {
  return (
    <div
      className="flex items-center justify-center gap-1 rounded-md"
      onClick={props.handleCreateNew}
    >
      <label className="group relative flex h-10 w-36 cursor-pointer items-center justify-center rounded-md bg-white text-gray-600 focus-within:ring-2">
        <div className="flex items-center">
          <PlusIcon className="mr-2 h-4 w-4" />
          New
        </div>
      </label>
    </div>
  );
}
