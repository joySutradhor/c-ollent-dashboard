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
  const [selectedTypes, setSelectedTypes] = useState({}); // store user click per plan
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
    if (!type) {
      toast.error("Please select Monthly or Yearly.");
      return;
    }
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
    const newPlanType = selectedTypes[plan.id];
    if (!newPlanType) {
      toast.error("Please select Monthly or Yearly.");
      return;
    }

    if (!activePlans || !activePlans.subscriptons_details) {
      toast.error("Active plan info not found");
      return;
    }

    const currentPlanId = activePlans.subscriptons_details.id;
    const currentPlanType = activePlans.plan_type;

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
                className={`p-5 rounded-xl flex flex-col justify-between border ${
                  isCurrentPlan(plan)
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">{plan.name}</h2>
                    {isCurrentPlan(plan) && (
                      <span className="text-sm text-[#2545E0] font-semibold">
                        Current / {activePlans.plan_type.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm">{plan.description}</p>

                  <div className="flex gap-4">
                    {/* Monthly */}
                    <button
                      onClick={() =>
                        setSelectedTypes({ ...selectedTypes, [plan.id]: "monthly" })
                      }
                      disabled={isMonthlyDisabled(plan)}
                      className={`flex-1 py-2 rounded-full cursor-pointer border text-sm font-medium ${
                        selectedTypes[plan.id] === "monthly"
                          ? "bg-[#2545E0] text-white border-[#2545E0]"
                          : "bg-white text-black border-gray-300"
                      } ${isMonthlyDisabled(plan) ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      Monthly (${plan.monthly_price})
                    </button>

                    {/* Yearly */}
                    <button
                      onClick={() =>
                        setSelectedTypes({ ...selectedTypes, [plan.id]: "yearly" })
                      }
                      className={`flex-1 py-2 rounded-full border cursor-pointer text-sm font-medium ${
                        selectedTypes[plan.id] === "yearly"
                          ? "bg-[#2545E0] text-white border-[#2545E0]"
                          : "bg-white text-black border-gray-300"
                      }`}
                    >
                      Yearly (${plan.yearly_price})
                    </button>
                  </div>
                </div>

                {/* Action button */}
                {activePlans ? (
                  isCurrentPlan(plan) ? (
                    <button
                      onClick={() => handleUpgrade(plan)}
                      disabled={!selectedTypes[plan.id]}
                      className={`mt-4 w-full py-2 rounded-full text-sm  cursor-pointer font-medium border transition ${
                        selectedTypes[plan.id]
                          ? "bg-[#2545E0] text-white border-[#2545E0] hover:bg-[#1b37c9]"
                          : "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                      }`}
                    >
                      Upgrade Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan)}
                      disabled={!selectedTypes[plan.id]}
                      className={`mt-4 w-full py-2 rounded-full cursor-pointer text-sm font-medium border transition ${
                        selectedTypes[plan.id]
                          ? "bg-[#2545E0] text-white border-[#2545E0] hover:bg-[#1b37c9]"
                          : "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                      }`}
                    >
                      Switch Plan
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => handlePurchase(plan)}
                    disabled={!selectedTypes[plan.id]}
                    className={`mt-4 w-full py-2 rounded-full cursor-pointer text-sm font-medium border transition ${
                      selectedTypes[plan.id]
                        ? "bg-[#2545E0] text-white border-[#2545E0] hover:bg-[#1b37c9]"
                        : "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                    }`}
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
