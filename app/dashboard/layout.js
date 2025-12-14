// import { Work_Sans } from "next/font/google";
// import "./globals.css";
// import Sidebar from "@/components/sidebar/page";

// const WorkSans = Work_Sans({
//   weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
//   subsets: ["latin"],
//   display: "swap",
// });

// export const metadata = {
//   title: "Dashboard",
//   description: "Ollent  is a best sporting platfrom || Ollent",
// };

// export default function LoginLayout({ children }) {
//   return (
//     <section
//       cz-shortcut-listen="true"
//       data-new-gr-c-s-check-loaded="14.1266.0"
//       data-gr-ext-installed=""
//       className={`${WorkSans.className}  antialiased bg-no-repeat `}
//     >
//       <Sidebar />

//       {children}
//     </section>
//   );
// }

import { Work_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sidebar/page";

const WorkSans = Work_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Dashboard",
  description: "Ollent is a best sporting platform || Ollent",
};

export default function LoginLayout({ children }) {
  return (
    <section className={`${WorkSans.className} antialiased bg-no-repeat`}>
      {/* Layout Wrapper */}
      <div className="flex min-h-screen">
        <div className="xl:w-[20vw] 2xl:w-[17vw] shrink-0">
          <Sidebar />
        </div>

        <main className="flex-1">{children}</main>
      </div>
    </section>
  );
}
