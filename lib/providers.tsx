import LightMode from "@/components/custom/light-mode";
import { Toaster } from "@/components/ui/sonner";
import React from "react";
import { ThemeProvider } from "./providers/theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <LightMode />
      <Toaster richColors closeButton />
    </ThemeProvider>
  );
}
