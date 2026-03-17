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
          <div className="from-background via-background/90 to-background absolute inset-0 bg-linear-to-b" />
          <div className="absolute top-0 right-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
        </div>

        <div className="relative z-10">
          <section className="container flex min-h-screen max-w-(--breakpoint-2xl) flex-col items-center justify-center space-y-14 py-24 text-center">
            {children}
          </section>
        </div>

        <footer className="border-t">
          <div className="container py-6">
            <p className="text-muted-foreground text-center text-sm">
              © {new Date().getFullYear()} My Shelf. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
