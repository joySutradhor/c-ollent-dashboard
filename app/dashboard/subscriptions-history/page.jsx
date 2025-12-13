"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Topbar from "@/components/topbar/page";
import { usePathname } from "next/navigation";
import useAuthToken from "@/app/dashboard/Hooks/useAuthToken";

const baseURL = "https://api.ollent.com";

const Page = () => {
  const pathname = usePathname();
  const { token } = useAuthToken();

  const formattedPath = pathname
    .replace(/^\/|\/$/g, "")
    .split("/")
    .map((segment) =>
      segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    )
    .join(" / ");

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- FILTER STATES ---------------- */
  const [filters, setFilters] = useState({
    academy_name: "",
    plan_name: "",
    plan_type: "",
    status: "",
  });

  /* ---------------- FETCH DATA ---------------- */
  const fetchSubscriptions = async (customFilters = filters) => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseURL}/api/academy-subscriptions/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
        params: Object.fromEntries(
          Object.entries(customFilters).filter(([_, value]) => value !== "")
        ),
      });

      setSubscriptions(res.data.results || []);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSubscriptions();
  }, [token]);

  /* ---------------- DROPDOWN DATA ---------------- */
  const academyOptions = useMemo(() => {
    const set = new Set();
    subscriptions.forEach((s) => {
      if (s.academy_details?.academy_name) {
        set.add(s.academy_details.academy_name);
      }
    });
    return Array.from(set);
  }, [subscriptions]);

  const planOptions = useMemo(() => {
    const set = new Set();
    subscriptions.forEach((s) => {
      if (s.subscriptons_details?.name) {
        set.add(s.subscriptons_details.name);
      }
    });
    return Array.from(set);
  }, [subscriptions]);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchSubscriptions();
  };

  const resetFilters = () => {
    const emptyFilters = {
      academy_name: "",
      plan_name: "",
      plan_type: "",
      status: "",
    };
    setFilters(emptyFilters);
    fetchSubscriptions(emptyFilters);
  };

  return (
    <div className="edn__sideToLeftSpace">
      <div className="edn__left__right__space">
        <Topbar title={formattedPath} />

        {/* FILTER SECTION */}

        <div className="mt-6 bg-white p-6 rounded-xl shadow-sm ">
          <h2 className="edn__section__title mb-4">Filter Subscriptions</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {/* Academy Name */}
            <div className="border border-black/10 p-3 rounded ">
              <select
                name="academy_name"
                value={filters.academy_name}
                onChange={handleChange}
                className="input w-full border border-black/10 p-3 rounded-md outline-none cursor-pointer"
              >
                <option value="">All Academies</option>
                {academyOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Plan Name */}
            <div className="border border-black/10 p-3 rounded">
              <select
                name="plan_name"
                value={filters.plan_name}
                onChange={handleChange}
                className="input w-full border border-black/10 p-3 rounded-md outline-none cursor-pointer"
              >
                <option value="">All Plans</option>
                {planOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Plan Type */}
            <div className="border border-black/10 p-3 rounded">
              <select
                name="plan_type"
                value={filters.plan_type}
                onChange={handleChange}
                className="input w-full border border-black/10 p-3 rounded-md outline-none cursor-pointer"
              >
                <option className="cursor-pointer" value="">
                  All Types
                </option>
                <option className="cursor-pointer" value="monthly">
                  Monthly
                </option>
                <option className="cursor-pointer" value="yearly">
                  Yearly
                </option>
              </select>
            </div>

            {/* Status */}
            <div className="border border-black/10 p-3 rounded">
              <select
                name="status"
                value={filters.status}
                onChange={handleChange}
                className="input w-full border border-black/10 p-3 rounded-md outline-none cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-10">
            <button
              onClick={applyFilters}
              className="px-4 py-1.5 text-sm hover:bg-[#2545E0] text-black/80 border hover:border-transparent border-black/10 cursor-pointer  hover:text-white rounded transition"
            >
              Apply Filter
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-1.5 text-sm bg-gray-200 rounded cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
        {/* TABLE SECTION */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-sm">
          <h2 className="edn__section__title mb-4">Subscriptions History</h2>

          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading...</div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No Subscription Found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-black/80 text-sm">
                <thead className=" border-b border-black/10 text-left">
                  <tr>
                    <th className="p-3">Plan</th>
                    <th className="p-3">Academy</th>
                    <th className="p-3">Plan Type</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Start Date</th>
                    <th className="p-3">Expired Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Payment</th>
                  </tr>
                </thead>

                <tbody>
                  {subscriptions.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-black/10 hover:bg-gray-50"
                    >
                      <td className="p-3">
                        <p>{s.subscriptons_details?.name}</p>
                        <p className="text-xs">
                          ID : {s?.stripe_payment_intent_id || "—"}
                        </p>
                      </td>
                      <td className="p-3">{s.academy_details?.academy_name}</td>
                      <td className="p-3 capitalize">{s.plan_type}</td>
                      <td className="p-3">${s.amount}</td>
                      <td className="p-3">{s.start_date}</td>
                      <td className="p-3">{s.expired_date || "—"}</td>
                      <td className="p-3 capitalize">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            s.status === "active"
                              ? "bg-green-100 text-green-700"
                              : s.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "border border-black/10 text-gray-600"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>

                      <td className="p-3 capitalize">{s.payment_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
