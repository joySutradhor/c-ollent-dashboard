"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Topbar from "@/components/topbar/page";
import useAuthToken from "../Hooks/useAuthToken";

export default function SuccessPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user_type } = useAuthToken();

  const formattedPath = pathname
    .replace(/^\/|\/$/g, "")
    .split("/")
    .map((segment) =>
      segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .join(" / ");

  // Determine redirect URL based on user_type
  const handleRedirect = () => {
    if (user_type === "Academy") {
      router.push("/dashboard/plan-history");
    } else if (user_type === "Client") {
      router.push("/dashboard/booking-list");
    } else {
      router.push("/dashboard"); 
    }
  };

  return (
    <section className="edn__sideToLeftSpace">
      <div className="edn__left__right__space">
        <Topbar title={formattedPath} />

        <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 p-6">
          <div className="bg-white shadow-lg rounded-xl p-10 text-center max-w-md">
            <h1 className="text-3xl font-semibold text-[#2545E0] mb-4">
              Payment Successful
            </h1>

            <p className="text-gray-700 mb-6">
              Your subscription has been activated successfully.
            </p>

            <button
              onClick={handleRedirect}
              className="px-6 py-3 cursor-pointer bg-[#2545E0] text-white rounded-lg transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
