import "./globals.css";
import { AuthProvider } from "../src/context/AuthContext";
import I18nProvider from "@/components/I18nProvider";

export const metadata = {
  title: "HRM App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <I18nProvider>
          <AuthProvider>{children}</AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
