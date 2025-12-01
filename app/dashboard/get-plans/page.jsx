"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import Topbar from "@/components/topbar/page";
import useAuthToken from "../Hooks/useAuthToken";

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const baseURL = "https://api.ollent.com";

  // plan type state for each card
  const [selectedTypes, setSelectedTypes] = useState({});

  const { token } = useAuthToken();

  const formattedPath = pathname
    .replace(/^\/|\/$/g, "")
    .split("/")
    .map((segment) =>
      segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .join(" / ");

  // Fetch subscription plans
  const fetchPlans = async () => {
    try {
      const res = await axios.get(`${baseURL}/api/subscription-plans/`);
      setPlans(res.data.results);

      // initialize default plan type for each
      const defaultTypes = {};
      res.data.results.forEach((plan) => {
        defaultTypes[plan.id] = "monthly";
      });
      setSelectedTypes(defaultTypes);
    } catch (error) {
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Purchase API Call
  const handlePurchase = async (plan) => {
    const type = selectedTypes[plan.id];

    try {
      toast.loading("Processing purchase...");

      console.log(  plan.id, type , "check what i send")
      console.log(  token , "check token")
      const res = await axios.post(
        `${baseURL}/api/purchase-academy-subscription/`,
        {
          plan: plan.id,
          plan_type: type,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      console.log( res , "check take plan response")

      toast.dismiss();
      toast.success("Redirecting to checkout...");

      window.location.href = res.data.checkout_url;
    } catch (error) {
      toast.dismiss();
      console.log(error)

      toast.error(
        error.response?.data?.message || "Purchase failed. Try again."
      );
    }
  };

  return (
    <div className="edn__sideToLeftSpace">
      <div className="edn__left__right__space">
        <Topbar title={formattedPath} />
        <h1 className="text-3xl font-semibold mb-6">Subscription Plans</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="  p-5 rounded-xl bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="bg-gray-100 p-8 rounded-xl space-y-[2vh]">
                    <button className="text-sm shadow text-black/70 font-semibold py-2 px-6 bg-white rounded-full">
                      {plan.name}
                    </button>

                    <p className="text-gray-600 text-sm mb-8 ">
                      {plan.description}
                    </p>

                    <div className="flex flex-wrap gap-5 items-center  ">
                      {/* MONTHLY */}
                      <label
                        className={`flex items-center gap-3 text-sm font-medium cursor-pointer px-4 py-2 rounded-full border 
      ${
        selectedTypes[plan.id] === "monthly"
          ? "bg-[#2545E0] text-white border border-black/10"
          : "bg-white text-black border-black/10"
      }`}
                      >
                        <input
                          type="radio"
                          name={`plan_${plan.id}`}
                          value="monthly"
                          className="hidden"
                          checked={selectedTypes[plan.id] === "monthly"}
                          onChange={() =>
                            setSelectedTypes({
                              ...selectedTypes,
                              [plan.id]: "monthly",
                            })
                          }
                        />
                        <span>Monthly (${plan.monthly_price})</span>
                      </label>

                      {/* YEARLY */}
                      <label
                        className={`flex items-center gap-3 text-sm font-medium cursor-pointer px-4 py-2 rounded-full border  ${
                          selectedTypes[plan.id] === "yearly"
                            ? "bg-[#2545E0] text-white border-blue-600"
                            : "bg-white text-black border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`plan_${plan.id}`}
                          value="yearly"
                          className="hidden"
                          checked={selectedTypes[plan.id] === "yearly"}
                          onChange={() =>
                            setSelectedTypes({
                              ...selectedTypes,
                              [plan.id]: "yearly",
                            })
                          }
                        />
                        <span>Yearly (${plan.yearly_price})</span>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(plan)}
                  className="mt-4 border border-black/10 text-black/80 hover:text-white hover:bg-[#2545E0] text-sm font-medium px-8 t py-2 rounded-full  transition cursor-pointer"
                >
                  Get Plan
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
