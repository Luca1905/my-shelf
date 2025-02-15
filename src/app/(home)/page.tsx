import { auth } from "@clerk/nextjs/server";
import { ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10">
        <section className="container flex min-h-screen max-w-screen-2xl flex-col items-center justify-center space-y-14 py-24 text-center">
          <div className="space-y-8">
            <h1 className="overflow-visible bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-7xl font-extrabold tracking-tight text-transparent sm:text-8xl md:text-9xl">
              My Shelf
            </h1>
            <p className="mx-auto max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Securely store, access, and share your files from anywhere. My
              Shelf provides a simple and efficient way to manage your digital
              life.
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
        </section>

        <footer className="border-t">
          <div className="container py-6">
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} My Shelf. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
