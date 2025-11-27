"use client";

import { usePathname } from "next/navigation";
import Topbar from "../topbar/page";

export default function DashboardHome() {
  const pathname = usePathname();

  const formattedPath = pathname
    .replace(/^\/|\/$/g, "")
    .split("/")
    .map((segment) =>
      segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .join(" / ");

  return (
    <section className="edn__sideToLeftSpace  ">
      <div className="edn__left__right__space bg-red">
        <div>
          <Topbar title={formattedPath} />
        </div>

        <div className=" text-xl font-semibold text-black/80 h-full">
          Upcomming
        </div>
      </div>
    </section>
  );
}
