import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/app-nav";
import { Pitch } from "@/components/pitch";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <>
      <AppNav />
      <Pitch />
    </>
  );
}
