import { logoutAction } from "@/app/dashboard/actions";
import ThemeToggle from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";
import { LogOutIcon } from "lucide-react";

export default function AppHeader({ showLogout = false }: { showLogout?: boolean }) {
  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <span className="font-heading text-lg font-semibold">Task Manager</span>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {showLogout && (
          <form action={logoutAction}>
            <Tooltip>
              <TooltipTrigger render={<Button type="submit" size="icon-xs" variant="ghost" aria-label="Log out" />}>
                <LogOutIcon aria-hidden="true" />
              </TooltipTrigger>
              <TooltipPopup>Log out</TooltipPopup>
            </Tooltip>
          </form>
        )}
      </div>
    </header>
  );
}
