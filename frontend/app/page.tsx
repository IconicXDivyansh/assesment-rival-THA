import AppHeader from "@/components/app-header";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <AppHeader />
      <main className="flex flex-1 flex-col items-center justify-center gap-12 px-4 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="font-heading text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight">
          Task Manager
        </h1>
        <p className="max-w-md text-muted-foreground">
          A simple, fast way to organize your tasks. Create, track, and manage
          everything in one place.
        </p>
      </div>

      <div className="flex gap-3">
        <Button render={<Link href="/signup" />}>Get Started</Button>
        <Button variant="outline" render={<Link href="/login" />}>
          Login
        </Button>
      </div>

      <div className="w-full max-w-md">
        <Accordion defaultValue={["features"]}>
          <AccordionItem value="features">
            <AccordionTrigger>What can I do with this app?</AccordionTrigger>
            <AccordionPanel>
              Create, edit, and delete tasks with priorities and due dates.
              Filter by status, search by title, and sort by what matters most.
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem value="auth">
            <AccordionTrigger>Is my data secure?</AccordionTrigger>
            <AccordionPanel>
              All data is protected with JWT authentication. Only you can see
              and manage your own tasks. Passwords are hashed before storage.
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem value="stack">
            <AccordionTrigger>What technology is this built with?</AccordionTrigger>
            <AccordionPanel>
              Next.js frontend with React 19, Express.js backend, PostgreSQL
              database via Supabase, and Drizzle ORM. Styled with Tailwind CSS
              and coss/ui components.
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem value="responsive">
            <AccordionTrigger>Does it work on mobile?</AccordionTrigger>
            <AccordionPanel>
              Fully responsive design that adapts to any screen size. Manage
              your tasks on desktop, tablet, or phone.
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </div>
    </main>
    </>
  );
}
