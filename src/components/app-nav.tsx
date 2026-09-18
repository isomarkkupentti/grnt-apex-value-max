import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Pitch" },
  { to: "/desk", label: "Desk" },
  { to: "/bible", label: "Bible" },
  { to: "/jv", label: "JV" },
  { to: "/moat", label: "Moat" },
] as const;

export function AppNav() {
  return (
    <nav className="border-b border-border bg-bg">
      <div className="mx-auto flex h-12 min-w-0 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <p className="shrink-0 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">GRNT APEX</p>
        <div className="flex min-w-0 gap-1 overflow-x-auto">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "inline-flex min-h-9 items-center rounded-sm px-3 text-sm text-muted transition-opacity duration-150 hover:text-fg",
              )}
              activeProps={{ className: "bg-raised text-fg" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
