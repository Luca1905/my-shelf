import { auth } from "@clerk/nextjs/server";
import { ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";

export default function Home() {
  return (
    <>
      <div className="space-y-8">
        <h1 className="overflow-visible bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-7xl font-extrabold tracking-tight text-transparent sm:text-8xl md:text-9xl">
          My Shelf
        </h1>
        <p className="mx-auto max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          Securely store, access, and share your files from anywhere. My Shelf
          provides a simple and efficient way to manage your digital life.
        </p>
      </div>
      <div>
        <form
          action={async () => {
            "use server";

            const session = await auth();
            if (!session.userId) {
              return redirect("/sign-in");
            }

            return redirect("/shelf");
          }}
        >
          <Button
            type="submit"
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </div>
    </>
  );
}
