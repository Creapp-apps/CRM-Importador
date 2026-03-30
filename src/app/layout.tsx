import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "Gestor Interno — ERP para Importadoras",
  description:
    "Sistema de gestión integral para importadoras y distribuidoras. Control de stock, CRM, facturación y logística.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
