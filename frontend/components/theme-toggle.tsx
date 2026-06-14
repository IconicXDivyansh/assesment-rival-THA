"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";
import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <Tooltip>
      <TooltipTrigger render={<Button size="icon-xs" variant="ghost" onClick={toggle} aria-label="Toggle theme" />}>
        {dark ? <SunIcon aria-hidden="true" /> : <MoonIcon aria-hidden="true" />}
      </TooltipTrigger>
      <TooltipPopup>{dark ? "Switch to light mode" : "Switch to dark mode"}</TooltipPopup>
    </Tooltip>
  );
}
