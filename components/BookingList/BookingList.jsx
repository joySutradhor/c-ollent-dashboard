"use client";

import Topbar from "@/components/topbar/page";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import useAuthToken from "@/app/dashboard/Hooks/useAuthToken";


const BookingList = () => {

  const { token, user_type } = useAuthToken();

  const [loading, setLoading] = useState(true);
  const [filteredSchedules, setFilteredSchedules] = useState([]);

  

  

  // ------------------- Format Time -------------------
  const formatAMPM = (timeString) => {
    if (!timeString) return "-";
    const date = new Date(timeString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  // ------------------- Fetch Bookings -------------------
  const fetchSchedules = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await axios.get(
        `https://api.ollent.com/api/ground-booking-list/`,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(res?.data?.results, "check restults");

      // Flatten booking_slot array for table rendering
      const formatted = res.data.results.flatMap((b) =>
        b.booking_slot.map((slot) => ({
          booking_code: b.booking_code,
          booking_status: b.status,
          total_amount: b.total_amount,
          slot_status: slot.is_booked ? "Booked" : "Available",
          ground_name: slot.ground_name,
          schedule_start: slot.schedule_start,
          schedule_end: slot.schedule_end,
          slot_price: slot.slot_price,
        }))
      );

      setFilteredSchedules(formatted);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [token]);

  console.log(filteredSchedules, "check");

  return (
   

    <div>
        <div className="bg-white shadow-sm rounded-xl p-4 my-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Booking List</h2>
            <div className="text-sm text-gray-600">
              Total: {filteredSchedules.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-black/10">
              <thead>
                <tr className="text-left text-sm text-gray-700">
                  <th className="px-3 py-2">Booking Code</th>
                  <th className="px-3 py-2">Ground Name</th>
                  <th className="px-3 py-2">Start</th>
                  <th className="px-3 py-2">End</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2 text-nowrap">Booking Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-black/10">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : filteredSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-4 text-center">
                      No schedules found
                    </td>
                  </tr>
                ) : (
                  filteredSchedules
                    // Hide booked slots if you want
                    .filter((s) => s.slot_status !== "Booked")
                    .map((s, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm text-nowrap">{s.booking_code}</td>
                        <td className="px-3 py-2 text-sm text-nowrap">{s.ground_name}</td>
                        <td className="px-3 py-2 text-sm text-nowrap">
                          {formatAMPM(s.schedule_start)}
                        </td>
                        <td className="px-3 py-2 text-sm text-nowrap">
                          {formatAMPM(s.schedule_end)}
                        </td>
                        <td className="px-3 py-2 text-sm text-nowrap">{s.slot_price} $</td>
                        <td className="px-3 py-2 text-sm text-nowrap">{s.booking_status}</td>
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

export default BookingList;
