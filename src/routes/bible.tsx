import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/app-nav";
import { Bible } from "@/components/bible";

export const Route = createFileRoute("/bible")({ component: BiblePage });

function BiblePage() {
  return (
    <>
      <AppNav />
      <Bible />
    </>
  );
}
