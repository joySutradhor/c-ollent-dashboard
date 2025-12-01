"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Topbar from "@/components/topbar/page";


export default function CancelPage() {
  const router = useRouter();
  const pathname = usePathname();

  const formattedPath = pathname
    .replace(/^\/|\/$/g, "")
    .split("/")
    .map((segment) =>
      segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .join(" / ");

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard/plan-history");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <section className="edn__sideToLeftSpace">
      <div className="edn__left__right__space">
        <Topbar title={formattedPath} />

        <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 p-6">
          <div className="bg-white shadow-lg rounded-xl p-10 text-center max-w-md">
            <h1 className="text-3xl font-semibold text-red-600 mb-4">
              Payment Cancelled ❌
            </h1>

            <p className="text-gray-700 mb-6">
              Your payment was not completed. You can try again anytime.
            </p>

            <button
              onClick={() => router.push("/dashboard/plan-history")}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Go to Plan History
            </button>

            <p className="text-sm text-gray-500 mt-4">
              Redirecting automatically...
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
