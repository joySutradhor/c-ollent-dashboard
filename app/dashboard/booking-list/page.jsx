"use client";
import BookingList from "@/components/BookingList/BookingList";
import Topbar from "@/components/topbar/page";
import { usePathname } from "next/navigation";
import React from "react";

const Page = () => {
  const pathname = usePathname();
  const groundId = pathname.split("/").pop();
  const formattedPath = pathname
    .replace(/^\/|\/$/g, "")
    .split("/")
    .map((segment) =>
      segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .join(" / ");

  return (
    <div>
      <div className="edn__sideToLeftSpace">
        <div className="edn__left__right__space">
          <Topbar title={formattedPath} />
          <BookingList />
        </div>
      </div>
    </div>
  );
};

export default Page;
