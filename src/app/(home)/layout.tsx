import "~/styles/globals.css";
import MouseMoveEffect from "~/components/ux/mouse-move-effect";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MouseMoveEffect />
      <main className="relative min-h-screen">
        {/* Background gradients */}
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
          <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
        </div>

        <div className="relative z-10">
          <section className="container flex min-h-screen max-w-screen-2xl flex-col items-center justify-center space-y-14 py-24 text-center">
            {children}
          </section>
        </div>

        <footer className="border-t">
          <div className="container py-6">
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} My Shelf. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
