import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/app-nav";
import { Desk } from "@/components/desk";

export const Route = createFileRoute("/desk")({ component: DeskPage });

function DeskPage() {
  return (
    <>
      <AppNav />
      <Desk />
    </>
  );
}
