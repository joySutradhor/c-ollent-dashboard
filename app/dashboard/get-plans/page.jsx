"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import Topbar from "@/components/topbar/page";
import useAuthToken from "../Hooks/useAuthToken";

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [activePlans, setActivePlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState({});
  const { token } = useAuthToken();
  const pathname = usePathname();
  const baseURL = "https://api.ollent.com";

  const formattedPath = pathname
    .replace(/^\/|\/$/g, "")
    .split("/")
    .map((segment) =>
      segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .join(" / ");

  // Fetch active plan
  const fetchActivePlans = async () => {
    try {
      if (!token) return;
      const res = await axios.get(`${baseURL}/api/academy-user-active/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setActivePlans(res?.data);
    } catch (error) {
      toast.error("Failed to fetch active plan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchActivePlans();
  }, [token]);

  // Fetch subscription plans
  const fetchPlans = async () => {
    try {
      const res = await axios.get(`${baseURL}/api/subscription-plans/`);
      setPlans(res.data.results);

      // initialize default plan type
      const defaultTypes = {};
      res.data.results.forEach((plan) => {
        defaultTypes[plan.id] = "monthly";
      });
      setSelectedTypes(defaultTypes);
    } catch (error) {
      toast.error("Failed to load plans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handlePurchase = async (plan) => {
    const type = selectedTypes[plan.id];
    try {
      toast.loading("Processing purchase...");
      const res = await axios.post(
        `${baseURL}/api/purchase-academy-subscription/`,
        { plan: plan.id, plan_type: type },
        { headers: { Authorization: `Token ${token}` } }
      );
      toast.dismiss();
      toast.success("Redirecting to checkout...");
      window.location.href = res.data.checkout_url;
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Purchase failed.");
    }
  };

  const handleUpgrade = async (plan) => {
    if (!activePlans || !activePlans.subscriptons_details) {
      toast.error("Active plan info not found");
      return;
    }

    const currentPlanId = activePlans.subscriptons_details.id;
    const currentPlanType = activePlans.plan_type;
    const newPlanType = selectedTypes[plan.id];

    // Prevent downgrade for same plan
    if (
      currentPlanId === plan.id &&
      currentPlanType === "yearly" &&
      newPlanType === "monthly"
    ) {
      toast.error("You cannot downgrade from yearly to monthly.");
      return;
    }

    // Same plan and type
    if (currentPlanId === plan.id && currentPlanType === newPlanType) {
      toast.error("You already have this plan.");
      return;
    }

    // Allowed upgrade or switch to another plan
    try {
      toast.loading("Processing upgrade...");
      const res = await axios.post(
        `${baseURL}/api/upgrade-academy-subscription/`,
        { plan: plan.id, plan_type: newPlanType },
        { headers: { Authorization: `Token ${token}` } }
      );
      toast.dismiss();
      toast.success("Redirecting to checkout...");
      window.location.href = res.data.checkout_url;
    } catch (error) {
      toast.dismiss();
      console.log(error);
      toast.error("Upgrade failed.");
    }
  };

  const isMonthlyDisabled = (plan) => {
    // Disable monthly if current plan is same and yearly
    return (
      activePlans?.subscriptons_details?.id === plan.id &&
      activePlans.plan_type === "yearly"
    );
  };

  const isCurrentPlan = (plan) => {
    return activePlans?.subscriptons_details?.id === plan.id;
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
                className={`p-5 rounded-xl flex flex-col justify-between ${
                  isCurrentPlan(plan) ? "bg-blue-50 border border-blue-200" : "bg-white"
                }`}
              >
                <div className="bg-gray-100 p-8 rounded-xl space-y-[2vh]">
                  <button className="text-sm shadow text-black/70 font-semibold py-2 px-6 bg-white rounded-full">
                    {plan.name}
                  </button>

                  <p className="text-gray-600 text-sm mb-8">{plan.description}</p>

                  <div className="flex flex-wrap gap-5 items-center">
                    {/* MONTHLY */}
                    <label
                      className={`flex items-center gap-3 text-sm font-medium cursor-pointer px-4 py-2 rounded-full border ${
                        selectedTypes[plan.id] === "monthly"
                          ? "bg-[#2545E0] text-white border border-black/10"
                          : "bg-white text-black border-black/10"
                      } ${isMonthlyDisabled(plan) ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="radio"
                        name={`plan_${plan.id}`}
                        value="monthly"
                        className="hidden"
                        checked={selectedTypes[plan.id] === "monthly"}
                        disabled={isMonthlyDisabled(plan)}
                        onChange={() =>
                          setSelectedTypes({ ...selectedTypes, [plan.id]: "monthly" })
                        }
                      />
                      <span>Monthly (${plan.monthly_price})</span>
                    </label>

                    {/* YEARLY */}
                    <label
                      className={`flex items-center gap-3 text-sm font-medium cursor-pointer px-4 py-2 rounded-full border ${
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
                          setSelectedTypes({ ...selectedTypes, [plan.id]: "yearly" })
                        }
                      />
                      <span>Yearly (${plan.yearly_price})</span>
                    </label>
                  </div>
                </div>

                {activePlans ? (
                  isCurrentPlan(plan) ? (
                    <button
                      onClick={() => handleUpgrade(plan)}
                      className="mt-4 border border-black/10 text-black/80 hover:text-white hover:bg-[#2545E0] text-sm font-medium px-8 py-2 rounded-full transition cursor-pointer"
                    >
                      Upgrade Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan)}
                      className="mt-4 border border-black/10 text-black/80 hover:text-white hover:bg-[#2545E0] text-sm font-medium px-8 py-2 rounded-full transition cursor-pointer"
                    >
                      Switch Plan
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => handlePurchase(plan)}
                    className="mt-4 border border-black/10 text-black/80 hover:text-white hover:bg-[#2545E0] text-sm font-medium px-8 py-2 rounded-full transition cursor-pointer"
                  >
                    Get Plan
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
