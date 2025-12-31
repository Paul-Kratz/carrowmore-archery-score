import { Dock } from "./Dock";

export default function DockWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full w-full -mt-16">
      {children}
      <Dock />
    </div>
  );
}
