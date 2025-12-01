"use client";

import React, { useEffect, useState } from "react";
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

  // Fetch data using axios
  const fetchSubscriptions = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${baseURL}/api/academy-subscriptions/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      console.log(res , "check plans response")

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

  return (
    <div className="edn__sideToLeftSpace">
      <div className="edn__left__right__space">
        <Topbar title={formattedPath} />

        {/* TABLE SECTION */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-sm">
          <h2 className="edn__section__title mb-4"> Subscriptions History</h2>
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading...</div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No Subscription Found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full  text-black/80 text-sm">
                <thead className="bg-gray-100 text-left ">
                  <tr>
                    <th className="p-3 ">Plan</th>
                    <th className="p-3 ">Academy</th>
                    <th className="p-3 ">Plan Type</th>
                    <th className="p-3 ">Amount</th>
                    <th className="p-3 ">Start Date</th>
                    <th className="p-3 ">Expired Date</th>
                    <th className="p-3 ">Status</th>
                    <th className="p-3 ">Payment</th>
                  </tr>
                </thead>

                <tbody>
                  {subscriptions.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-black/10 hover:bg-gray-50"
                    >
                      <td className="p-3 ">
                        <div>
                          <p>{s.subscriptons_details?.name}</p>
                          <p className="text-xs"> ID : {s?.stripe_payment_intent_id}</p>
                        </div>
                      </td>
                      <td className="p-3 ">
                        {s.academy_details?.academy_name}
                      </td>

                      <td className="p-3  capitalize">{s.plan_type}</td>

                      <td className="p-3 ">${s.amount}</td>

                      <td className="p-3 ">{s.start_date}</td>

                      <td className="p-3 ">{s.expired_date || "—"}</td>

                      <td className="p-3  capitalize">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            s.status === "active"
                              ? "bg-green-100 text-green-600"
                              : s.status === "pending"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>

                      <td className="p-3  capitalize">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            s.payment_status === "completed"
                              ? "bg-green-100 text-green-600"
                              : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          {s.payment_status}
                        </span>
                      </td>
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
