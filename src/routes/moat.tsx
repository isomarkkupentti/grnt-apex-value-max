import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/app-nav";
import { Moat } from "@/components/moat";

export const Route = createFileRoute("/moat")({ component: MoatPage });

function MoatPage() {
  return (
    <>
      <AppNav />
      <Moat />
    </>
  );
}
