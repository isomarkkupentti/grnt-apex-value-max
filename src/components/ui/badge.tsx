import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "muted",
  ...props
}: React.ComponentProps<"span"> & { tone?: "muted" | "gain" | "loss" | "warn" | "ok" }) {
  const tones = {
    muted: "border-border text-muted",
    gain: "border-gain/40 text-gain",
    loss: "border-loss/40 text-loss",
    warn: "border-warn/40 text-warn",
    ok: "border-accent/40 text-accent",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium uppercase tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
