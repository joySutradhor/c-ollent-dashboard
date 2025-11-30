"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

import Topbar from "@/components/topbar/page";
import useAuthToken from "../Hooks/useAuthToken";
import { toast } from "sonner";

const baseURL = "https://api.ollent.com";

const SubscriptionPlansPage = () => {
  const { token, user_type } = useAuthToken();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    monthly_price: "",
    yearly_price: "",
    is_active: true,
  });

  const [editingId, setEditingId] = useState(null);

  //==============================
  //  Fetch Subscription Plans
  //==============================
  const fetchPlans = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const res = await axios.get(`${baseURL}/api/subscription-plans/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      setPlans(res.data.results || []);
    } catch (err) {
      console.error("Error fetching subscription plans:", err);
      toast.error("Failed to load plans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [token]);

  //==============================
  //  Handle Input Change
  //==============================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  //==============================
  //  Create New Plan (POST)
  //==============================
  const handleCreate = async (e) => {
    e.preventDefault();

    if (user_type !== "SuperAdmin") {
      toast.error("Only SuperAdmin can create plans.");
      return;
    }

    try {
      await axios.post(`${baseURL}/api/subscription-plans/`, form, {
        headers: { Authorization: `Token ${token}` },
      });

      setForm({
        name: "",
        description: "",
        monthly_price: "",
        yearly_price: "",
        is_active: true,
      });

      fetchPlans();
      toast.success("Plan created successfully!");
    } catch (err) {
      console.error("Error creating plan:", err);
      toast.error("Failed to create plan.");
    }
  };

  //==============================
  //  Edit / Update (PUT)
  //==============================
  const startEdit = (plan) => {
    setEditingId(plan.id);
    setForm({
      name: plan.name,
      description: plan.description,
      monthly_price: plan.monthly_price,
      yearly_price: plan.yearly_price,
      is_active: plan.is_active,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (user_type !== "SuperAdmin") {
      toast.error("Only SuperAdmin can update plans.");
      return;
    }

    try {
      await axios.put(`${baseURL}/api/subscription-plans/${editingId}/`, form, {
        headers: { Authorization: `Token ${token}` },
      });

      setEditingId(null);
      fetchPlans();
      toast.success("Plan updated successfully!");
      setForm({
        name: "",
        description: "",
        monthly_price: "",
        yearly_price: "",
        is_active: true,
      });
    } catch (err) {
      console.error("Error updating plan:", err);
      toast.error("Failed to update plan.");
    }
  };

  //==============================
  // Delete (DELETE)
  //==============================
  const handleDelete = async (id) => {
    if (user_type !== "SuperAdmin") {
      toast.error("Only SuperAdmin can delete plans.");
      return;
    }

    try {
      await axios.delete(`${baseURL}/api/subscription-plans/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });

      fetchPlans();
      toast.success("Plan deleted successfully!");
    } catch (err) {
      console.error("Error deleting plan:", err);
      toast.error("Failed to delete plan.");
    }
  };

  return (
    <div className="edn__sideToLeftSpace">
      <div className="edn__left__right__space">
        <Topbar title="Subscription Plans" />

        <div>
          <div className="bg-white shadow-sm rounded-xl p-6 mt-10 max-w-3xl">
            <div>
              <h2 className="edn__section__title mb-4">
                {editingId
                  ? "Edit Subscription Plan"
                  : "Create Subscriptions Plan"}
              </h2>

              {/*=======================*/}
              {/*  Form (Create / Edit) */}
              {/*=======================*/}
              <form
                onSubmit={editingId ? handleUpdate : handleCreate}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10"
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Plan Name"
                  value={form.name}
                  onChange={handleChange}
                  className="border border-black/10 outline-none p-2 rounded"
                  required
                />

                <input
                  type="text"
                  name="monthly_price"
                  placeholder="Monthly Price"
                  value={form.monthly_price}
                  onChange={handleChange}
                  className="border border-black/10 outline-none p-2 rounded"
                  required
                />

                <input
                  type="text"
                  name="yearly_price"
                  placeholder="Yearly Price"
                  value={form.yearly_price}
                  onChange={handleChange}
                  className="border border-black/10 outline-none p-2 rounded"
                  required
                />

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="is_active"
                    className="cursor-pointer"
                    checked={form.is_active}
                    onChange={handleChange}
                  />
                  <label>Is Active?</label>
                </div>

                <textarea
                  name="description"
                  placeholder="Description"
                  value={form.description}
                  onChange={handleChange}
                  className="border border-black/10 outline-none p-2 rounded md:col-span-2"
                  rows={3}
                />

                <div>
                  <button
                    type="submit"
                    className="hover:bg-[#2545E0] hover:text-white border border-black/10 transition px-4 py-2 rounded cursor-pointer"
                  >
                    {editingId ? "Update Plan" : "Create Plan"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div>
            {/*=======================*/}
            {/*  Table */}
            {/*=======================*/}

            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="bg-white shadow-sm rounded-xl p-4 my-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium">
                    All Subscription Plans
                  </h2>
                  <div className="text-sm text-gray-600">
                    Total: {plans.length}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-black/10">
                    <thead>
                      <tr className="text-left text-sm text-gray-700">
                        <th className="px-3 py-2">SL</th>
                        <th className="px-3 py-2">Plan Name</th>
                        <th className="px-3 py-2">Monthly Price</th>
                        <th className="px-3 py-2">Yearly Price</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-black/10">
                      {plans.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-4 text-center">
                            No plans found
                          </td>
                        </tr>
                      ) : (
                        plans.map((s, index) => (
                          <tr key={s.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-sm">{index + 1}</td>

                            <td className="px-3 py-2 text-sm">{s.name}</td>

                            <td className="px-3 py-2 text-sm">
                              {s.monthly_price}
                            </td>

                            <td className="px-3 py-2 text-sm">
                              {s.yearly_price}
                            </td>

                            <td className="px-3 py-2 text-sm">
                              {s.is_active ? "Active" : "Inactive"}
                            </td>

                            <td className="p-2">
                              <div className="flex gap-2">
                                <button
                                  className="px-3 py-1 bg-gray-200 rounded cursor-pointer"
                                  onClick={() => startEdit(s)}
                                >
                                  Edit
                                </button>

                                <button
                                  className="px-3 py-1 bg-red-500 text-white rounded cursor-pointer"
                                  onClick={() => handleDelete(s.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlansPage;
