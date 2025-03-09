// app/shelf/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { MUTATIONS, QUERIES } from "~/server/db/queries";

export default async function ShelfPage() {
  const session = await auth();
  if (!session.userId) {
    redirect("/sign-in");
  }

  const rootFolder = await QUERIES.getRootFolderForUser(session.userId);

  if (!rootFolder) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-6 bg-background px-4">
        <h1 className="text-4xl font-bold">Welcome to My Shelf</h1>
        <p className="max-w-xl text-center text-muted-foreground">
          It looks like you don&apos;t have a shelf yet. Click the button below
          to create your new Shelf and start securely storing your files.
        </p>
        <form
          action={async () => {
            "use server";
            const session = await auth();
            if (!session.userId) {
              redirect("/sign-in");
            }

            const rootFolderId = await MUTATIONS.onboardUser(session.userId);
            return redirect(`/f/${rootFolderId}`);
          }}
        >
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Create new Shelf
          </Button>
        </form>
      </div>
    );
  }

  return redirect(`/f/${rootFolder.id}`);
}
