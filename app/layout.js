import { Work_Sans } from "next/font/google";
import { Toaster } from "sonner";
import AuthRedirect from "./dashboard/Hooks/AuthRedirect";

const WorkSans = Work_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Dashboard - Home",
  description: "ollent  is a best software || ollent",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-arp="">
      <body
        cz-shortcut-listen="true"
        className={`${WorkSans.className}  antialiased bg-no-repeat bg-[#f7f5f5]`}
        data-new-gr-c-s-check-loaded="14.1264.0"
        data-gr-ext-installed=""
      >
        <Toaster richColors position="top-right" />
        {/* <Sidebar /> */}
        {children}
        <AuthRedirect/>
      </body>
    </html>
  );
}
