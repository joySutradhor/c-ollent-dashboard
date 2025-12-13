"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import Topbar from "../topbar/page";
import useAuthToken from "@/app/dashboard/Hooks/useAuthToken";
import BookingList from "../BookingList/BookingList";
import PlanHistory from "../PlanHistory/PlanHistory";

export default function DashboardHome() {
  const pathname = usePathname();
  const { token, user_type } = useAuthToken();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ===== Format Pathname for Topbar =====
  const formattedPath = pathname
    .replace(/^\/|\/$/g, "")
    .split("/")
    .map((segment) =>
      segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .join(" / ");

  // ===== Fetch Dashboard Data =====
  useEffect(() => {
    if (!token) return;

    const fetchDashboard = async () => {
      try {
        const res = await axios.get("https://api.ollent.com/api/dashboard/", {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });

        setData(res.data);
      } catch (err) {
        console.log(err.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  // ===== UI States =====
  if (loading) {
    return (
      <section className="edn__sideToLeftSpace">
        <div className="edn__left__right__space">
          <Topbar title={formattedPath} />
          <p className="text-lg font-medium">Loading dashboard...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="edn__sideToLeftSpace">
        <div className="edn__left__right__space">
          <Topbar title={formattedPath} />
          <p className="text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  // ===== Dashboard Content =====
  return (
    <section className="edn__sideToLeftSpace">
      <div className="edn__left__right__space">
        <Topbar title={formattedPath} />

        <div className=" text-black/80">
          {/* ================= SUPER ADMIN ================= */}
          {user_type === "SuperAdmin" && (
            <>
              <div className="  ">
                <p className="text-2xl  text-gray-700">
                  {" "}
                  Wellcome Back{" "}
                  <span className="font-semibold">Super Admin</span>
                </p>
              </div>
              <div className="grid  md:grid-cols-2  xl:grid-cols-3 gap-5 bg-white p-8 mt-10">
                <div className="rounded-xl bg-gray-50 hover:shadow-sm border border-black/10  p-6">
                  <p className="text-sm text-gray-500">Total Academies</p>
                  <p className="text-3xl font-bold">{data.total_academies}</p>
                </div>

                <div className="rounded-xl bg-gray-50 hover:shadow-sm border border-black/10  p-6">
                  <p className="text-sm text-gray-500">Total Clients</p>
                  <p className="text-3xl font-bold">{data.total_clients}</p>
                </div>

                <div className="rounded-xl bg-gray-50 hover:shadow-sm border border-black/10  p-6">
                  <p className="text-sm text-gray-500">Total Grounds</p>
                  <p className="text-3xl font-bold">{data.total_grounds}</p>
                </div>
              </div>
            </>
          )}

          {user_type === "SuperAdmin" && (
            <div>
              <BookingList />
            </div>
          )}

          <div className="mb-20">
            {user_type === "SuperAdmin" && (
              <div>
                <PlanHistory />
              </div>
            )}
          </div>

          {/* ================= ACADEMY ================= */}
          {user_type === "Academy" && (
            <>
              <div className="  ">
                <p className="text-2xl  text-gray-700">
                  {" "}
                  Wellcome Back{" "}
                  <span className="font-semibold">{data.academy_name}</span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 bg-white p-8 rounded-2xl mt-10">
                <div className="rounded-xl bg-gray-50 hover:shadow-sm border border-black/10  p-6 ">
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-3xl font-bold">
                    {data.schedule_stats.total_revenue_from_schedules} $
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 hover:shadow-sm border border-black/10  p-6 ">
                  <p className="text-sm text-gray-500">Total Grounds</p>
                  <p className="text-3xl font-bold">{data.total_grounds}</p>
                </div>

                <div className="rounded-xl bg-gray-50 hover:shadow-sm border border-black/10  p-6">
                  <p className="text-sm text-gray-500">Total Schedules</p>
                  <p className="text-3xl font-bold">
                    {data.schedule_stats.total_schedules}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 hover:shadow-sm border border-black/10  p-6">
                  <p className="text-sm text-gray-500">Booked Schedules</p>
                  <p className="text-3xl font-bold">
                    {data.schedule_stats.booked_schedules}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 hover:shadow-sm border border-black/10  p-6">
                  <p className="text-sm text-gray-500">Available Schedules</p>
                  <p className="text-3xl font-bold">
                    {data.schedule_stats.available_schedules}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 hover:shadow-sm border border-black/10  p-6">
                  <p className="text-sm text-gray-500">Upcoming Schedules</p>
                  <p className="text-3xl font-bold">
                    {data.schedule_stats.upcoming_schedules}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 hover:shadow-sm border border-black/10  p-6">
                  <p className="text-sm text-gray-500">Past Schedules</p>
                  <p className="text-3xl font-bold">
                    {data.schedule_stats.past_schedules}
                  </p>
                </div>
              </div>
            </>
          )}

          {user_type === "Academy" && (
            <div>
              <BookingList />
            </div>
          )}
          {user_type === "Academy" && (
            <div className="mb-20">
              <PlanHistory />
            </div>
          )}

          {/* ================= CLIENT ================= */}
          {user_type === "Client" && (
            <>
              <div className="  ">
                <p className="text-2xl  text-gray-700">
                  {" "}
                  Wellcome Back{" "}
                  <span className="font-semibold">{data.client_name}</span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-5 bg-white p-8 rounded-2xl mt-10">
                <div className="rounded-xl bg-gray-50 hover:shadow-sm border border-black/10  p-6 ">
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="text-3xl font-bold">
                    ${data.booking_stats.total_amount_spent}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 hover:shadow-sm border border-black/10  p-6">
                  <p className="text-sm text-gray-500">Total Bookings</p>
                  <p className="text-3xl font-bold">
                    {data.booking_stats.total_bookings}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 hover:shadow-sm border border-black/10  p-6">
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-3xl font-bold">
                    {data.booking_stats.pending}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 hover:shadow-sm border border-black/10  p-6">
                  <p className="text-sm text-gray-500">Confirmed</p>
                  <p className="text-3xl font-bold">
                    {data.booking_stats.confirmed}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 hover:shadow-sm border border-black/10  p-6">
                  <p className="text-sm text-gray-500">Cancelled</p>
                  <p className="text-3xl font-bold">
                    {data.booking_stats.cancelled}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 hover:shadow-sm border border-black/10  p-6">
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-3xl font-bold">
                    {data.booking_stats.completed}
                  </p>
                </div>
              </div>
            </>
          )}

          {user_type === "Client" && (
            <div>
              <BookingList />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
