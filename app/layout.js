import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/Chrome";
import { AuthProvider } from "@/components/AuthProvider";
import CookieBanner from "@/components/CookieBanner";

export const metadata = {
  title: "Fourchettator - Des recettes miamesques",
  description: "Des recettes testées, des portions qui s'ajustent, des étapes claires.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,400;9..144,0,500;9..144,0,600;9..144,0,900;9..144,1,400;9..144,1,600;9..144,1,900&family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/svg+xml" href="/logo.png" />
      </head>
      <body>
        <AuthProvider>
          <SiteHeader />
          <main className="fade">{children}</main>
          <SiteFooter />
          <CookieBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
