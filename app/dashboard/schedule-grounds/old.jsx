// app/ground-schedule/page.jsx
"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import useAuthToken from "../Hooks/useAuthToken";
import Topbar from "@/components/topbar/page";
import { usePathname } from "next/navigation";

const BASE_URL = "https://api.ollent.com/api";

export default function GroundSchedulePage() {
  const { token } = useAuthToken();

  // Data
  const [grounds, setGrounds] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  // Pagination
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Forms
  const [bulkData, setBulkData] = useState({
    ground_id: "",
    slot_hour: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
  });

  const [singleData, setSingleData] = useState({
    ground: "",
    start_datetime_local: "",
    end_datetime_local: "",
  });

  // Edit
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    id: null,
    ground: "",
    start_datetime_local: "",
    end_datetime_local: "",
  });

  // helper for headers
  const authHeaders = useCallback(
    () => ({ Authorization: `Token ${token}` }),
    [token]
  );

  // Fetch grounds (mini list)
  const fetchGrounds = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/ground-mini-list/`, {
        headers: authHeaders(),
      });
      // accept either results or direct array
      const items = res.data.results ?? res.data ?? [];
      setGrounds(items);
    } catch (err) {
      console.error("fetchGrounds:", err);
      toast.error("Failed to load grounds");
    }
  }, [token, authHeaders]);

  // Fetch schedules (paginated)
  const fetchSchedules = useCallback(
    async (page = 1) => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/ground-schedules/`, {
          params: { page },
          headers: authHeaders(),
        });
        const data = res.data ?? {};
        // support both Django default and custom pagination
        const results = data.results ?? data;
        setSchedules(Array.isArray(results) ? results : []);
        setCount(data.count ?? (Array.isArray(results) ? results.length : 0));
        // Attempt to set total pages and current page if provided, otherwise compute
        const tp =
          data.total_pages ??
          Math.ceil((data.count ?? results.length) / (data.page_size ?? 10));
        setTotalPages(tp || 1);
        setCurrentPage(data.current_page ?? page);
      } catch (err) {
        console.error("fetchSchedules:", err);
        toast.error("Failed to load schedules");
      } finally {
        setLoading(false);
      }
    },
    [token, authHeaders]
  );

  // Run initial loads
  useEffect(() => {
    if (!token) return;
    fetchGrounds();
    fetchSchedules(1);
  }, [token, fetchGrounds, fetchSchedules]);

  // ---------- Small utility functions ----------
  function pad(n) {
    return String(n).padStart(2, "0");
  }

  // Convert ISO -> datetime-local (local)
  function toLocalDateTimeInput(isoString) {
    if (!isoString) return "";
    const dt = new Date(isoString);
    const y = dt.getFullYear();
    const m = pad(dt.getMonth() + 1);
    const d = pad(dt.getDate());
    const hh = pad(dt.getHours());
    const mm = pad(dt.getMinutes());
    return `${y}-${m}-${d}T${hh}:${mm}`;
  }

  // Convert datetime-local (local) -> ISO Z
  function localInputToISO(localDateTime) {
    if (!localDateTime) return "";
    // localDateTime comes like '2025-11-29T12:00'
    // Construct Date using local representation to preserve timezone -> then toISOString()
    const dt = new Date(localDateTime);
    return dt.toISOString();
  }

  // ---------- Handlers: form changes ----------
  const handleBulkChange = (e) => {
    const { name, value } = e.target;
    setBulkData((s) => ({ ...s, [name]: value }));
  };

  const handleSingleChange = (e) => {
    const { name, value } = e.target;
    setSingleData((s) => ({ ...s, [name]: value }));
  };

  // ---------- Build payloads ----------
  function buildBulkPayload() {
    // Convert numeric fields if necessary
    return {
      ground_id: bulkData.ground_id ? Number(bulkData.ground_id) : null,
      slot_hour: bulkData.slot_hour ? Number(bulkData.slot_hour) : null,
      start_date: bulkData.start_date || null, // YYYY-MM-DD
      end_date: bulkData.end_date || null, // YYYY-MM-DD
      start_time: bulkData.start_time || null, // HH:MM
      end_time: bulkData.end_time || null, // HH:MM
    };
  }

  function buildSinglePayload() {
    return {
      ground: singleData.ground ? Number(singleData.ground) : null,
      start_datetime: localInputToISO(singleData.start_datetime_local),
      end_datetime: localInputToISO(singleData.end_datetime_local),
    };
  }

  // ---------- Create/Update/Delete ----------

  // Create bulk
  const createBulkSchedule = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // basic validation
    if (!bulkData.ground_id || !bulkData.start_date || !bulkData.end_date) {
      toast.error("Select ground and provide start & end dates.");
      return;
    }

    const payload = buildBulkPayload();

    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/ground-schedules/`, payload, {
        headers: authHeaders(),
      });
      toast.success("Bulk schedule created!");
      setBulkData({
        ground_id: "",
        slot_hour: "",
        start_date: "",
        end_date: "",
        start_time: "",
        end_time: "",
      });
      // refresh
      fetchSchedules(1);
    } catch (err) {
      console.error("createBulkSchedule:", err);
      const msg =
        err?.response?.data?.detail ||
        JSON.stringify(err?.response?.data) ||
        "Failed to create bulk schedule";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Create single slot
  const createSingleSlot = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (
      !singleData.ground ||
      !singleData.start_datetime_local ||
      !singleData.end_datetime_local
    ) {
      toast.error("Fill ground, start and end datetime.");
      return;
    }

    const payload = buildSinglePayload();
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/single-ground-schedule/`, payload, {
        headers: authHeaders(),
      });
      toast.success("Single slot created!");
      setSingleData({
        ground: "",
        start_datetime_local: "",
        end_datetime_local: "",
      });
      fetchSchedules(1);
    } catch (err) {
      console.error("createSingleSlot:", err);
      const msg =
        err?.response?.data?.detail ||
        JSON.stringify(err?.response?.data) ||
        "Failed to create single slot";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const openEdit = (schedule) => {
    const startLocal = toLocalDateTimeInput(schedule.start_datetime);
    const endLocal = toLocalDateTimeInput(schedule.end_datetime);
    setEditData({
      id: schedule.id,
      ground: schedule.ground ?? schedule.ground_id ?? "",
      start_datetime_local: startLocal,
      end_datetime_local: endLocal,
    });
    setEditing(true);
  };

  const closeEdit = () => {
    setEditing(false);
    setEditData({
      id: null,
      ground: "",
      start_datetime_local: "",
      end_datetime_local: "",
    });
  };

  // Update schedule
  const updateSchedule = async () => {
    if (
      !editData.id ||
      !editData.ground ||
      !editData.start_datetime_local ||
      !editData.end_datetime_local
    ) {
      toast.error("Fill all edit fields.");
      return;
    }

    const payload = {
      ground: Number(editData.ground),
      start_datetime: localInputToISO(editData.start_datetime_local),
      end_datetime: localInputToISO(editData.end_datetime_local),
    };

    setLoading(true);
    try {
      await axios.put(`${BASE_URL}/ground-schedules/${editData.id}/`, payload, {
        headers: authHeaders(),
      });
      toast.success("Schedule updated!");
      fetchSchedules(currentPage);
      closeEdit();
    } catch (err) {
      console.error("updateSchedule:", err);
      const msg = err?.response?.data?.detail || "Failed to update schedule";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Delete schedule
  const deleteSchedule = async (id) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    setLoading(true);
    try {
      await axios.delete(`${BASE_URL}/ground-schedules/${id}/`, {
        headers: authHeaders(),
      });
      toast.success("Schedule deleted!");
      // refresh current page
      // If the page becomes empty you might want to go to previous page; simple refresh for now:
      fetchSchedules(currentPage);
    } catch (err) {
      console.error("deleteSchedule:", err);
      toast.error("Failed to delete schedule");
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    fetchSchedules(p);
  };

  const formattedPath = pathname
    .replace(/^\/|\/$/g, "")
    .split("/")
    .map((segment) =>
      segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .join(" / ");

  console.log(schedules, "get schedules");

  // ---------- Render ----------
  return (
    <div className="edn__sideToLeftSpace">
      <div className="edn__left__right__space">
        <Topbar title={formattedPath} />
        <div className=" ">
          <h1 className="text-2xl font-semibold mb-4">
            Ground Schedule Management
          </h1>

          {/* Table */}
          <div className="bg-white shadow-sm rounded p-4 mt-16 mb-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">All Schedules</h2>

              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">Total: {count}</div>
                <div className="text-sm text-gray-600">
                  Page: {currentPage}/{totalPages}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto ">
              <table className="min-w-full divide-y">
                <thead>
                  <tr className="text-left text-sm text-gray-700">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Ground</th>
                    <th className="px-3 py-2">Start</th>
                    <th className="px-3 py-2">End</th>
                    <th className="px-3 py-2">Booked</th>
                    <th className="px-3 py-2">Created By</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : schedules.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center">
                        No schedules found
                      </td>
                    </tr>
                  ) : (
                    schedules.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm">{s.id}</td>
                        <td className="px-3 py-2 text-sm">
                          {s.ground_name ?? s.ground ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {s.start_datetime
                            ? new Date(s.start_datetime).toLocaleString()
                            : "-"}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {s.end_datetime
                            ? new Date(s.end_datetime).toLocaleString()
                            : "-"}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {s.is_booked ? "Yes" : "No"}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {s.created_by ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEdit(s)}
                              className="px-2 py-1 rounded border text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteSchedule(s.id)}
                              className="px-2 py-1 rounded border text-sm text-red-600"
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

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing page {currentPage} of {totalPages}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  First
                </button>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Last
                </button>
              </div>
            </div>
          </div>

          {/* Grid: Forms on top */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Bulk Create */}
            <form
              className="bg-white shadow-sm rounded p-4"
              onSubmit={createBulkSchedule}
            >
              <h2 className="text-lg font-medium mb-3">Bulk Create Schedule</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Ground</label>
                  <select
                    name="ground_id"
                    value={bulkData.ground_id}
                    onChange={handleBulkChange}
                    className="border rounded p-2 w-full border-black/10  outline-none"
                    aria-label="Select ground for bulk"
                  >
                    <option value="">Select Ground</option>
                    {grounds.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.ground_name ?? g.name ?? `Ground ${g.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Slot hour</label>
                  <input
                    type="number"
                    name="slot_hour"
                    value={bulkData.slot_hour}
                    onChange={handleBulkChange}
                    placeholder="Slot hour (e.g., 1)"
                    className="border rounded p-2 w-full border-black/10  outline-none"
                    min={0}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Start date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={bulkData.start_date}
                    onChange={handleBulkChange}
                    className="border rounded p-2 w-full border-black/10  outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">End date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={bulkData.end_date}
                    onChange={handleBulkChange}
                    className="border rounded p-2 w-full border-black/10  outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Start time</label>
                  <input
                    type="time"
                    name="start_time"
                    value={bulkData.start_time}
                    onChange={handleBulkChange}
                    className="border rounded p-2 w-full border-black/10  outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">End time</label>
                  <input
                    type="time"
                    name="end_time"
                    value={bulkData.end_time}
                    onChange={handleBulkChange}
                    className="border rounded p-2 w-full border-black/10  outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#2545E0] text-white px-4 py-2 rounded  disabled:opacity-50"
                >
                  Create Bulk
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setBulkData({
                      ground_id: "",
                      slot_hour: "",
                      start_date: "",
                      end_date: "",
                      start_time: "",
                      end_time: "",
                    })
                  }
                  className="px-4 py-2 rounded border border-black/10"
                >
                  Reset
                </button>
              </div>
            </form>

            {/* Single Slot */}
            <form
              className="bg-white shadow-sm rounded p-4"
              onSubmit={createSingleSlot}
            >
              <h2 className="text-lg font-medium mb-3">Create Single Slot</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Ground</label>
                  <select
                    name="ground"
                    value={singleData.ground}
                    onChange={handleSingleChange}
                    className="border rounded p-2 w-full border-black/10  outline-none"
                    aria-label="Select ground for single slot"
                  >
                    <option value="">Select Ground</option>
                    {grounds.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.ground_name ?? g.name ?? `Ground ${g.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Start (local)</label>
                  <input
                    type="datetime-local"
                    name="start_datetime_local"
                    value={singleData.start_datetime_local}
                    onChange={handleSingleChange}
                    className="border rounded p-2 w-full border-black/10  outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">End (local)</label>
                  <input
                    type="datetime-local"
                    name="end_datetime_local"
                    value={singleData.end_datetime_local}
                    onChange={handleSingleChange}
                    className="border rounded p-2 w-full border-black/10  outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#2545E0] text-white px-4 py-2 rounded  disabled:opacity-50"
                >
                  Create Slot
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSingleData({
                      ground: "",
                      start_datetime_local: "",
                      end_datetime_local: "",
                    })
                  }
                  className="px-4 py-2 rounded border border-black/10"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Edit Modal */}
          {editing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={closeEdit}
              />
              <div className="bg-white rounded shadow-lg max-w-xl w-full relative p-4 z-10">
                <h3 className="text-lg font-medium mb-3">
                  Edit Schedule #{editData.id}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Ground</label>
                    <select
                      value={editData.ground}
                      onChange={(e) =>
                        setEditData((s) => ({ ...s, ground: e.target.value }))
                      }
                      className="border rounded p-2 w-full border-black/10  outline-none"
                    >
                      <option value="">Select Ground</option>
                      {grounds.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.ground_name ?? g.name ?? `Ground ${g.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Start (local)</label>
                    <input
                      type="datetime-local"
                      value={editData.start_datetime_local}
                      onChange={(e) =>
                        setEditData((s) => ({
                          ...s,
                          start_datetime_local: e.target.value,
                        }))
                      }
                      className="border rounded p-2 w-full border-black/10  outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm mb-1">End (local)</label>
                    <input
                      type="datetime-local"
                      value={editData.end_datetime_local}
                      onChange={(e) =>
                        setEditData((s) => ({
                          ...s,
                          end_datetime_local: e.target.value,
                        }))
                      }
                      className="border rounded p-2 w-full border-black/10  outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={closeEdit}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateSchedule}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
