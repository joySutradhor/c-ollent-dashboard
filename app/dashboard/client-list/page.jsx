"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Topbar from "@/components/topbar/page";
import { usePathname } from "next/navigation";
import useAuthToken from "../Hooks/useAuthToken";
import Image from "next/image";

const BASE_URL = "https://api.ollent.com/api";

const Page = () => {
  const { token, user_type } = useAuthToken();
  const pathname = usePathname();
  const [academyList, setAcademyList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Auth headers memoized
  const authHeaders = useCallback(() => {
    return token ? { Authorization: `Token ${token}` } : {};
  }, [token]);

  console.log(token , "before fetch token")

  // Fetch Grounds
  const fetchAcademyList = useCallback(async () => {
    setLoading(true);
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/clients/`, {
        headers: authHeaders(),
      });

      const items = res.data.results ?? res.data ?? [];
      setAcademyList(items);
      setLoading(false);
      console.log(items, "check list");
    } catch (err) {
      console.error("academyList:", err);
      setLoading(false);
    }
  }, [token, authHeaders]);

  // Call API when token is available
  useEffect(() => {
    fetchAcademyList();
  }, [fetchAcademyList]);


  console.log(academyList , "check cleint list")

  // Format breadcrumb title
  const formattedPath = pathname
    ?.replace(/^\/|\/$/g, "")
    .split("/")
    .map((segment) =>
      segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .join(" / ");

  return (
    <div>
      <div className="edn__sideToLeftSpace">
        <div className="edn__left__right__space">
          <Topbar title={formattedPath || "Dashboard"} />

          <div className="bg-white shadow-sm rounded-xl p-4 my-16  ">
            <div className="flex items-center justify-between mb-4 ">
              <h2 className="text-lg font-medium">All Clients List</h2>

              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Total: {academyList.length}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto ">
              <table className="min-w-full divide-y divide-black/10">
                <thead>
                  <tr className="text-left text-sm text-gray-700">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Number</th>
                    <th className="px-3 py-2">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : academyList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center">
                        No clients found
                      </td>
                    </tr>
                  ) : (
                    academyList.map((s, index) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm">{index + 1}</td>
                        <td className="px-3 py-2 text-sm">{s?.name}</td>
                        <td className="px-3 py-2 text-sm">{s?.contact}</td>
                        <td className="px-3 py-2 text-sm">
                          {s?.auth_info.email}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
