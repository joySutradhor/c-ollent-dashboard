"use client";
import Topbar from "@/components/topbar/page";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import useAuthToken from "../../Hooks/useAuthToken";

const Page = () => {
  const pathname = usePathname();
  const { token, user_type } = useAuthToken();

  const [loading, setLoading] = useState(true);
  const [filteredSchedules, setFilteredSchedules] = useState([]);

  const groundId = pathname.split("/").pop(); // last segment (ex: 42)

  // Format breadcrumb title
  const formattedPath = pathname
    .replace(/^\/|\/$/g, "")
    .split("/")
    .map((segment) =>
      segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .join(" / ");

  // 🔥 Fetch schedules
  const fetchSchedules = async () => {
    if (!token) return;
    try {
      setLoading(true);

      const res = await axios.get(
        `https://api.ollent.com/api/ground-schedules/?ground=${groundId}`,
        {
          headers: {
            Authorization: `Token ${token}`, 
            "Content-Type": "application/json",
          },
        }
      );

      setFilteredSchedules(res.data.results);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [token, groundId]);

  console.log(filteredSchedules, "check data");

  return (
    <div className="edn__sideToLeftSpace">
      <div className="edn__left__right__space">
        <Topbar title={formattedPath} />
      </div>

      <div className="bg-white shadow-sm rounded-xl p-4 my-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">All Schedules</h2>

          <div className="text-sm text-gray-600">
            Total: {filteredSchedules.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-black/10">
            <thead>
              <tr className="text-left text-sm text-gray-700">
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Ground Name</th>
                <th className="px-3 py-2">Academy Name</th>
                <th className="px-3 py-2">Start</th>
                <th className="px-3 py-2">End</th>
                <th className="px-3 py-2">Booked</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-black/10">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center">
                    No schedules found
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((s, index) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm">{index + 1}</td>

                    <td className="px-3 py-2 text-sm">
                      {s.ground_details?.ground_name}
                    </td>

                    <td className="px-3 py-2 text-sm">
                      {s.ground_details?.academy_name}
                    </td>

                    <td className="px-3 py-2 text-sm">
                      {s.start_datetime
                        ? new Date(s.start_datetime).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                            hour12: true,
                          })
                        : "-"}
                    </td>

                    <td className="px-3 py-2 text-sm">
                      {s.end_datetime
                        ? new Date(s.end_datetime).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                            hour12: true,
                          })
                        : "-"}
                    </td>

                    <td className="px-3 py-2 text-sm">
                      {s.is_booked ? "Yes" : "No"}
                    </td>

                    <td className="px-3 py-2">
                      {user_type == "Client" ? (
                        <button className="px-2 py-1 border rounded text-sm border-black/10 text-black-800 cursor-pointer">
                          Book Now
                        </button>
                      ) : (
                        <button className="px-2 py-1 border rounded text-sm disabled border-black/10 text-black-800 cursor-pointer">
                          N/A
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Page;
