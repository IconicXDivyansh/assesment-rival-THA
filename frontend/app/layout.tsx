import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const fontSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const fontHeading = Geist({ variable: "--font-heading", subsets: ["latin"], weight: "600" });
const fontMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`relative ${fontSans.variable} ${fontHeading.variable} ${fontMono.variable} font-sans`}>
        <div className="isolate relative flex min-h-svh flex-col max-w-7xl mx-auto">
          {children}
        </div>
      </body>
    </html>
  );
}
