import "~/styles/globals.css";
import MouseMoveEffect from "~/components/ux/mouse-move-effect";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <MouseMoveEffect />
      {children}
    </>
  )
}
