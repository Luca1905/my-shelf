import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { QUERIES } from "~/server/db/queries";

export default async function ShelfPage() {
    const session = await auth();
    if (!session.userId) {
        redirect("/sign-in");
    }

    const rootFolder = await QUERIES.getRootFolderForUser(session.userId);

    if (!rootFolder) {
        redirect("/shelf/create");
    }

    return redirect(`/f/${rootFolder.id}`);
}