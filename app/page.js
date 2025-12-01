"use client";

import { useRouter } from "next/navigation";
import "./root.css";
import useAuthToken from "./dashboard/Hooks/useAuthToken";
import { useEffect, useState } from "react";

export default function Home() {
  const token = useAuthToken();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token === null || token === undefined) return;

    setLoading(false);

    if (token) {
      router.push("/dashboard");
      console.log("token exists");
    } else {
      console.log("token not");
      router.push("/login");
    }
  }, [token]);

  return (
    <section className="h-screen flex justify-center items-center bg-white">
      {loading && (
        <p className="text-gray-600 text-sm font-semibold">Loading dashboard ......</p>
      )}
    </section>
  );
}
