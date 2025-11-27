// app/ground-schedule/page.jsx
"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import useAuthToken from "../Hooks/useAuthToken";
import Topbar from "@/components/topbar/page";
import { usePathname } from "next/navigation";
import { AiOutlinePlus } from "react-icons/ai";
import { AiOutlineClose } from "react-icons/ai";

const BASE_URL = "https://api.ollent.com/api";

export default function GroundSchedulePage() {
  const { token } = useAuthToken();
  const [bulkSchedule, setBulkSchedule] = useState(false);
  const [singleOpen, setSingleOpen] = useState(false);
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

  // Filters
  const [filterGround, setFilterGround] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterToday, setFilterToday] = useState(false);
  const [filterBooked, setFilterBooked] = useState(""); // "", "yes", "no"

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
        const results = data.results ?? data;
        setSchedules(Array.isArray(results) ? results : []);
        setCount(data.count ?? (Array.isArray(results) ? results.length : 0));
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

  function localInputToISO(localDateTime) {
    if (!localDateTime) return "";
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

  function buildBulkPayload() {
    return {
      ground_id: bulkData.ground_id ? Number(bulkData.ground_id) : null,
      slot_hour: bulkData.slot_hour ? Number(bulkData.slot_hour) : null,
      start_date: bulkData.start_date || null,
      end_date: bulkData.end_date || null,
      start_time: bulkData.start_time || null,
      end_time: bulkData.end_time || null,
    };
  }

  function buildSinglePayload() {
    return {
      ground: singleData.ground ? Number(singleData.ground) : null,
      start_datetime: localInputToISO(singleData.start_datetime_local),
      end_datetime: localInputToISO(singleData.end_datetime_local),
    };
  }

  const createBulkSchedule = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
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

  const deleteSchedule = async (id) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    setLoading(true);
    try {
      await axios.delete(`${BASE_URL}/ground-schedules/${id}/`, {
        headers: authHeaders(),
      });
      toast.success("Schedule deleted!");
      fetchSchedules(currentPage);
    } catch (err) {
      console.error("deleteSchedule:", err);
      toast.error("Failed to delete schedule");
    } finally {
      setLoading(false);
    }
  };

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

  // ---------- Filtered schedules ----------
  const filteredSchedules = schedules.filter((s) => {
    let valid = true;

    // Ground filter
    if (filterGround)
      valid = valid && String(s.ground ?? s.ground_id) === filterGround;

    // Date range filter
    const startDate = filterStartDate ? new Date(filterStartDate) : null;
    const endDate = filterEndDate ? new Date(filterEndDate) : null;
    const scheduleStart = new Date(s.start_datetime);

    if (startDate) valid = valid && scheduleStart >= startDate;
    if (endDate) valid = valid && scheduleStart <= endDate;

    // Today filter
    if (filterToday) {
      const today = new Date();
      valid =
        valid &&
        scheduleStart.getDate() === today.getDate() &&
        scheduleStart.getMonth() === today.getMonth() &&
        scheduleStart.getFullYear() === today.getFullYear();
    }

    // Booked filter
    if (filterBooked === "yes") valid = valid && s.is_booked === true;
    if (filterBooked === "no") valid = valid && s.is_booked === false;

    return valid;
  });

  console.log(filteredSchedules , "check schedule")

  return (
    <div className="edn__sideToLeftSpace">
      <div className="edn__left__right__space">
        <Topbar title={formattedPath} />
        <div className=" ">
          <h1 className="text-2xl font-semibold mb-4">
            Ground Schedule Management
          </h1>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-10 justify-between  ">
            <div className="bg-white p-10 rounded-xl ">
              <h2 className="text-2xl font-semibold mb-6">Create Schedule</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bulk Create */}
                <div
                  onClick={() => setBulkSchedule(true)}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-600 hover:shadow transition cursor-pointer"
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4 text-2xl">
                    <AiOutlinePlus size={32} />
                  </div>
                  <p className="text-lg font-medium">Bulk Create</p>
                  <p className="text-sm text-gray-500 text-center mt-1">
                    Quickly create multiple slots at once
                  </p>
                </div>

                {/* Create Slot */}
                <div
                  onClick={() => setSingleOpen(true)}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-600 hover:shadow-lg transition cursor-pointer"
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4 text-2xl">
                    <AiOutlinePlus size={32} />
                  </div>
                  <p className="text-lg font-medium">Create Slot</p>
                  <p className="text-sm text-gray-500 text-center mt-1">
                    Create a single schedule slot
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5 items-center bg-white p-10 rounded-xl">
              <div>
                <label className="block text-sm mb-1">Ground</label>
                <select
                  value={filterGround}
                  onChange={(e) => setFilterGround(e.target.value)}
                  className="border rounded p-2 w-full border-black/10 outline-none"
                >
                  <option value="">All Grounds</option>
                  {grounds.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.ground_name ?? g.name ?? `Ground ${g.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Booked</label>
                <select
                  value={filterBooked}
                  onChange={(e) => setFilterBooked(e.target.value)}
                  className="border rounded p-2 w-full border-black/10 outline-none"
                >
                  <option value="">All</option>
                  <option value="yes">Booked</option>
                  <option value="no">Not Booked</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Start Date</label>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="border rounded p-2 w-full border-black/10 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">End Date</label>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="border rounded p-2 w-full border-black/10 outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setFilterToday(!filterToday)}
                className={`px-4 py-2 rounded border border-black/10 hover:bg-[#2545DE] hover:text-white cursor-pointer`}
              >
                Today
              </button>

              {/* Reset Button */}
              <div>
                <button
                  onClick={() => {
                    setFilterGround("");
                    setFilterStartDate("");
                    setFilterEndDate("");
                    setFilterToday(false);
                    setFilterBooked("");
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded  cursor-pointer w-full"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white shadow-sm rounded-xl p-4 my-16  ">
            <div className="flex items-center justify-between mb-4 ">
              <h2 className="text-lg font-medium">All Schedules</h2>

              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Total: {filteredSchedules.length}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto ">
              <table className="min-w-full divide-y divide-black/10">
                <thead>
                  <tr className="text-left text-sm text-gray-700">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Ground Name</th>
                    <th className="px-3 py-2">Academy Name</th>
                    <th className="px-3 py-2">Start</th>
                    <th className="px-3 py-2">End</th>
                    <th className="px-3 py-2">Booked</th>
                    {/* <th className="px-3 py-2">Created By</th> */}
                    <th className="px-3 py-2">Actions</th>
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
                    filteredSchedules.map((s, index) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm">{index + 1}</td>
                        <td className="px-3 py-2 text-sm">
                          {s?.ground_details?.ground_name}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {s?.ground_details?.academy_name}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {s.start_datetime
                            ? new Date(s.start_datetime).toLocaleString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "numeric",
                                  hour12: true,
                                  timeZone: "UTC",
                                }
                              )
                            : "-"}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {s.end_datetime
                            ? new Date(s.end_datetime).toLocaleString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                                hour12: true,
                                timeZone: "UTC",
                              })
                            : "-"}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {s.is_booked ? "Yes" : "No"}
                        </td>
                        {/* <td className="px-3 py-2 text-sm">
                          {s.created_by ?? "-"}
                        </td> */}
                        <td className="px-3 py-2 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEdit(s)}
                              className="px-2 py-1 rounded border text-sm border-black/10 cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteSchedule(s.id)}
                              className="px-2 py-1 rounded border text-sm border-black/10 text-red-600 cursor-pointer"
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

          {/* Grid: Forms on top */}
          <div>
            {bulkSchedule && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
                {/* Background overlay */}
                <div
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setBulkSchedule(false)}
                />

                {/* Bulk Create Form */}
                <form
                  className="bg-white shadow-sm rounded p-10 relative z-10 w-full max-w-3xl"
                  onSubmit={createBulkSchedule}
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium mb-3">
                      Bulk Create Schedule
                    </h2>
                    {/* Close Icon */}
                    <button
                      type="button"
                      onClick={() => setBulkSchedule(false)}
                      className=" text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      <AiOutlineClose size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Ground Select */}
                    <div>
                      <label className="block text-sm mb-1">Ground</label>
                      <select
                        name="ground_id"
                        value={bulkData.ground_id}
                        onChange={handleBulkChange}
                        className="border rounded p-2 w-full border-black/10 outline-none"
                      >
                        <option value="">Select Ground</option>
                        {grounds.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.ground_name ?? g.name ?? `Ground ${g.id}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Slot Hour */}
                    <div>
                      <label className="block text-sm mb-1">Slot hour</label>
                      <input
                        type="number"
                        name="slot_hour"
                        value={bulkData.slot_hour}
                        onChange={handleBulkChange}
                        placeholder="Slot hour (e.g., 1)"
                        className="border rounded p-2 w-full border-black/10 outline-none"
                        min={0}
                      />
                    </div>

                    {/* Start Date */}
                    <div>
                      <label className="block text-sm mb-1">Start date</label>
                      <input
                        type="date"
                        name="start_date"
                        value={bulkData.start_date}
                        onChange={handleBulkChange}
                        className="border rounded p-2 w-full border-black/10 outline-none"
                      />
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-sm mb-1">End date</label>
                      <input
                        type="date"
                        name="end_date"
                        value={bulkData.end_date}
                        onChange={handleBulkChange}
                        className="border rounded p-2 w-full border-black/10 outline-none"
                      />
                    </div>

                    {/* Start Time */}
                    <div>
                      <label className="block text-sm mb-1">Start time</label>
                      <input
                        type="time"
                        name="start_time"
                        value={bulkData.start_time}
                        onChange={handleBulkChange}
                        className="border rounded p-2 w-full border-black/10 outline-none"
                      />
                    </div>

                    {/* End Time */}
                    <div>
                      <label className="block text-sm mb-1">End time</label>
                      <input
                        type="time"
                        name="end_time"
                        value={bulkData.end_time}
                        onChange={handleBulkChange}
                        className="border rounded p-2 w-full border-black/10 outline-none"
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-[#2545E0] text-white px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
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
                      className="px-4 py-2 rounded border border-black/10 cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Single Slot */}

            {singleOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Background overlay */}
                <div
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setSingleOpen(false)}
                />

                {/* Single Slot Form */}
                <form
                  className="bg-white shadow-sm rounded p-10 relative z-10 w-full max-w-2xl"
                  onSubmit={createSingleSlot}
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium mb-3">
                      Create Single Slot
                    </h2>
                    {/* Close Icon */}
                    <button
                      type="button"
                      onClick={() => setSingleOpen(false)}
                      className=" text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      <AiOutlineClose size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Ground Select */}
                    <div>
                      <label className="block text-sm mb-1">Ground</label>
                      <select
                        name="ground"
                        value={singleData.ground}
                        onChange={handleSingleChange}
                        className="border rounded p-2 w-full border-black/10 outline-none"
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

                    {/* Start DateTime */}
                    <div>
                      <label className="block text-sm mb-1">
                        Start (local)
                      </label>
                      <input
                        type="datetime-local"
                        name="start_datetime_local"
                        value={singleData.start_datetime_local}
                        onChange={handleSingleChange}
                        className="border rounded p-2 w-full border-black/10 outline-none"
                      />
                    </div>

                    {/* End DateTime */}
                    <div className="md:col-span-2">
                      <label className="block text-sm mb-1">End (local)</label>
                      <input
                        type="datetime-local"
                        name="end_datetime_local"
                        value={singleData.end_datetime_local}
                        onChange={handleSingleChange}
                        className="border rounded p-2 w-full border-black/10 outline-none"
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-[#2545E0] text-white px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
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
                      className="px-4 py-2 rounded border border-black/10 cursor-pointer cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>
            )}
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
                    className="px-4 py-2 border rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateSchedule}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
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
