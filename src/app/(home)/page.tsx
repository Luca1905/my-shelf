"use client";

import { useUser } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";

export default function Home() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSignedIn) {
      router.push("/shelf");
    } else {
      router.push("/sign-in");
    }
  };

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
        <form onSubmit={handleFormSubmit}>
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
