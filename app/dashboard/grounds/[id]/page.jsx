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
  const [selectedSlots, setSelectedSlots] = useState([]);

  const groundId = pathname.split("/").pop();

  const formatAMPM = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      month: "short",
      day: "numeric",
    });
  };

  const formattedPath = pathname
    .replace(/^\/|\/$/g, "")
    .split("/")
    .map((segment) =>
      segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .join(" / ");

  // ------------------- Fetch Schedules -------------------
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

  // ------------------- Handle Select -------------------
  const toggleSlot = (scheduleId) => {
    setSelectedSlots((prev) =>
      prev.includes(scheduleId)
        ? prev.filter((id) => id !== scheduleId)
        : [...prev, scheduleId]
    );
  };

  // ------------------- Handle Booking -------------------
  const bookNow = async () => {
    if (selectedSlots.length === 0) return;

    try {
      const response = await axios.post(
        "https://api.ollent.com/api/create-booking/",
        { slot_ids: selectedSlots },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const checkoutURL = response.data?.checkout_url;

      if (checkoutURL) {
        window.location.href = checkoutURL;
      }
    } catch (error) {
      console.error("Booking failed", error);
    }
  };

  console.log(filteredSchedules, "check ");

  // ------------------- Total Price -------------------
  // const totalPrice = filteredSchedules
  //   .filter((s) => selectedSlots.includes(s.id))
  //   .reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

  return (
    <div className="edn__sideToLeftSpace">
      <div className="edn__left__right__space">
        <Topbar title={formattedPath} />

        {/* Table */}
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
                  <th className="px-3 py-2"></th>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Ground Name</th>
                  <th className="px-3 py-2">Academy Name</th>
                  <th className="px-3 py-2">Start</th>
                  <th className="px-3 py-2">End</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Booked</th>
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
                  filteredSchedules
                    .filter((s) => !s.is_booked)
                    .map((s, index) => (
                      <tr
                        key={s.id}
                        onClick={() => toggleSlot(s.id)}
                        className={`cursor-pointer ${
                          selectedSlots.includes(s.id)
                            ? "bg-blue-200 "
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-3 py-2"></td>

                        <td className="px-3 py-2 text-sm">{index + 1}</td>
                        <td className="px-3 py-2 text-sm">
                          {s.ground_details?.ground_name}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {s.ground_details?.academy_name}
                        </td>

                        <td className="px-3 py-2 text-sm">
                          {formatAMPM(s.start_datetime)}
                        </td>

                        <td className="px-3 py-2 text-sm">
                          {formatAMPM(s.end_datetime)}
                        </td>

                        <td className="px-3 py-2 text-sm">
                          {s.total_schedule_amount}
                        </td>
                        <td className="px-3 py-2 text-sm">No</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Section */}
        {selectedSlots.length > 0 && (
          <div className="">
            <button
              onClick={bookNow}
              className="mt-2 px-4 py-2 hover:bg-[#2545E0] hover:text-white  text-black border border-black/10 cursor-pointer rounded"
            >
              Proceed to Book
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
