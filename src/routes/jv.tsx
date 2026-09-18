import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/app-nav";
import { Jv } from "@/components/jv";

export const Route = createFileRoute("/jv")({ component: JvPage });

function JvPage() {
  return (
    <>
      <AppNav />
      <Jv />
    </>
  );
}
