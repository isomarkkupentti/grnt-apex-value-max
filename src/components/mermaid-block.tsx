import { useEffect, useId, useState } from "react";

export function MermaidBlock({ chart, title }: { chart: string; title: string }) {
  const rawId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          flowchart: { useMaxWidth: true, htmlLabels: true },
          sequence: { useMaxWidth: true },
          gantt: { useMaxWidth: true },
          themeVariables: {
            darkMode: true,
            background: "#182338",
            primaryColor: "#121a2a",
            primaryTextColor: "#e8edf5",
            primaryBorderColor: "#2a364a",
            secondaryColor: "#0b1220",
            secondaryTextColor: "#e8edf5",
            secondaryBorderColor: "#2a364a",
            tertiaryColor: "#182338",
            tertiaryTextColor: "#8b9aab",
            tertiaryBorderColor: "#2a364a",
            lineColor: "#8b9aab",
            textColor: "#e8edf5",
            mainBkg: "#121a2a",
            nodeBorder: "#2a364a",
            clusterBkg: "#0b1220",
            clusterBorder: "#2a364a",
            titleColor: "#e8edf5",
            edgeLabelBackground: "#121a2a",
            fontFamily: "IBM Plex Sans, Segoe UI, sans-serif",
          },
        });
        const { svg: out } = await mermaid.render(`mmd-${rawId}`, chart);
        if (alive) {
          setSvg(out);
          setErr(null);
        }
      } catch (e) {
        if (alive) setErr(e instanceof Error ? e.message : "Diagram failed");
      }
    })();
    return () => {
      alive = false;
    };
  }, [chart, rawId]);

  return (
    <figure className="grid gap-2">
      <figcaption className="text-xs font-medium uppercase tracking-wide text-muted">{title}</figcaption>
      <div className="max-w-full overflow-x-auto rounded-md border border-border bg-raised p-3">
        {err ? (
          <p className="text-sm text-loss">{err}</p>
        ) : svg ? (
          <div className="mermaid-host min-h-24 w-full" dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <p className="text-sm text-subtle">Drawing…</p>
        )}
      </div>
    </figure>
  );
}
