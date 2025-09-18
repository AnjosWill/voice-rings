import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voice Rings",
  description: "Ferramenta para gerar sprites e GIFs de aneis animados",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </head>
      <body className="bg-[#0b0e11] text-white antialiased min-h-screen h-full">
        {children}
      </body>
    </html>
  );
}
