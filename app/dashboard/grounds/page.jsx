"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import Topbar from "@/components/topbar/page";
import { usePathname } from "next/navigation";
import {
  FaFutbol,
  FaMapMarkerAlt,
  FaDollarSign,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import useAuthToken from "../Hooks/useAuthToken";

const GROUNDS_API = "https://api.ollent.com/api/grounds/";
const SPORT_API = "https://api.ollent.com/api/sport-type/";

export default function Page() {
  const [grounds, setGrounds] = useState([]);
  const [sportTypes, setSportTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const pathname = usePathname();
  const { token } = useAuthToken();
  console.log(token, "check token");

  const [formData, setFormData] = useState({
    ground_name: "",
    sport_type: "",
    location: "",
    map_link: "",
    description: "",
    price_per_hour: "",
    capacity: "",
    is_available: true,
    photos: [],
  });

  // Fetch Grounds
  const fetchGrounds = async () => {
    try {
      const res = await axios.get(GROUNDS_API);
      setGrounds(res.data?.results || []);
    } catch (err) {
      console.error("Error fetching grounds:", err);
    }
  };

  // Fetch Sports
  const fetchSportTypes = async () => {
    try {
      const res = await axios.get(SPORT_API);
      setSportTypes(res.data?.results || []);
    } catch (err) {
      console.error("Error fetching sport types:", err);
    }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchGrounds(), fetchSportTypes()]);
      setLoading(false);
    };
    load();
  }, []);

  // FORM HANDLER
  const handleChange = (e) => {
    const { name, value, checked, type, files } = e.target;
    if (type === "file") {
      // Convert FileList to Array immediately
      setFormData({ ...formData, [name]: Array.from(files) });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      ground_name: "",
      sport_type: "",
      location: "",
      map_link: "",
      description: "",
      price_per_hour: "",
      capacity: "",
      is_available: true,
      photos: [],
    });
    setEditMode(false);
    setEditId(null);
  };

  // CREATE - FIXED VERSION
  const createGround = async () => {
    const data = new FormData();

    // Append all non-file fields
    data.append("ground_name", formData.ground_name);
    data.append("sport_type", formData.sport_type);
    data.append("location", formData.location);
    data.append("map_link", formData.map_link);
    data.append("description", formData.description);
    data.append("price_per_hour", formData.price_per_hour);
    data.append("capacity", formData.capacity);
    data.append("is_available", formData.is_available);

    // Append files - this is the critical part
    if (formData.photos?.length > 0) {
      formData.photos.forEach((file) => {
        data.append("photos", file, file.name);
      });
    }

    console.log("FORMDATA CREATE:");
    for (let p of data.entries()) {
      console.log(p[0], p[1]);
    }

    toast.promise(
      axios.post(GROUNDS_API, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Token ${token}`,
        },
      }),
      {
        loading: "Creating...",
        success: () => {
          fetchGrounds();
          setModalOpen(false);
          resetForm();
          return "Ground created!";
        },
        error: (err) => {
          console.log("Error details:", err.response?.data);
          return err.response?.data?.detail || "Create failed";
        },
      }
    );
  };

  // UPDATE - FIXED VERSION
  const updateGround = async () => {
    const data = new FormData();

    // Append all non-file fields
    data.append("ground_name", formData.ground_name);
    data.append("sport_type", formData.sport_type);
    data.append("location", formData.location);
    data.append("map_link", formData.map_link);
    data.append("description", formData.description);
    data.append("price_per_hour", formData.price_per_hour);
    data.append("capacity", formData.capacity);
    data.append("is_available", formData.is_available);

    // Append files
    if (formData.photos?.length > 0) {
      formData.photos.forEach((file) => {
        data.append("photos", file, file.name);
      });
    }

    console.log("UPDATE check data:");
    for (let p of data.entries()) {
      console.log(p[0], p[1]);
    }

    toast.promise(
      axios.put(`${GROUNDS_API}${editId}/`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Token ${token}`,
        },
      }),
      {
        loading: "Updating...",
        success: () => {
          fetchGrounds();
          setModalOpen(false);
          resetForm();
          return "Ground updated!";
        },
        error: (err) => {
          console.log("Error details:", err.response?.data);
          return err.response?.data?.detail || "Update failed";
        },
      }
    );
  };

  // DELETE
  const deleteGround = async (id) => {
    toast.promise(
      axios.delete(`${GROUNDS_API}${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      }),
      {
        loading: "Deleting...",
        success: () => {
          fetchGrounds();
          return "Ground deleted!";
        },
        error: "Failed to delete ground",
      }
    );
  };

  // OPEN EDIT MODAL
  const openEditModal = (g) => {
    setFormData({
      ground_name: g.ground_name,
      sport_type: g.sport_type,
      location: g.location,
      map_link: g.map_link,
      description: g.description,
      price_per_hour: g.price_per_hour,
      capacity: g.capacity,
      is_available: g.is_available,
      photos: [],
    });
    setEditId(g.id);
    setEditMode(true);
    setModalOpen(true);
  };

  const getSportName = (id) => {
    const found = sportTypes.find((s) => s.id === id);
    return found ? found.sport_name : "N/A";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const formattedPath = pathname
    .replace(/^\/|\/$/g, "")
    .split("/")
    .map((segment) =>
      segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .join(" / ");

  console.log(grounds, "chek");

  return (
    <div>
      <div className="edn__sideToLeftSpace">
        <div className="edn__left__right__space">
          <Topbar title={formattedPath} />
          <div>
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold">Manage Grounds</h1>
              <button
                onClick={() => {
                  resetForm();
                  setModalOpen(true);
                }}
                className="px-4 py-2 bg-[#2545E0] text-white rounded-md cursor-pointer hover:bg-[#1e3ac4]"
              >
                + Create Ground
              </button>
            </div>
            {/* TABLE */}

            <div>
              {grounds.length === 0 ? (
                <div className="text-center p-6 text-gray-500">
                  No grounds found
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                  {grounds.map((g, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow p-5  "
                    >
                      <div className="grid grid-cols-[60%_35%] justify-between ">
                        {/* Image */}
                        <div>
                          <div>
                            {g?.ground_photos?.length > 0 ? (
                              <img
                                src={g.ground_photos[0].photo}
                                alt={g.ground_name}
                                className="w-full h-40 object-cover rounded-md "
                              />
                            ) : (
                              <div className="w-full h-40 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 ">
                                No Image
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          {/* Ground Info */}
                          <h4 className="font-bold  text-xl text-black/70 mb-1">
                            {g.ground_name}
                          </h4>

                          <div className="flex items-center text-gray-600 text-xs mb-1">
                            {/* <FaMapMarkerAlt className="mr-2 text-red-500" />{" "} */}
                            {g.location}
                          </div>

                          <div className="flex items-center text-gray-700 text-base font-medium mb-1">
                            <FaDollarSign className="mr-2 text-gray-500" />{" "}
                            {g.price_per_hour}/hr
                          </div>

                          <div className="flex items-center text-gray-600 text-sm mb-1">
                            <FaFutbol className="mr-2 text-gray-500" />{" "}
                            {getSportName(g.sport_type)}
                          </div>

                          <div className="flex items-center text-gray-600 text-sm mb-1">
                            <FaUsers className="mr-2 text-gray-500" />{" "}
                            {g.capacity} People
                          </div>

                          <div className="flex items-center text-sm font-medium ">
                            {g.is_available ? (
                              <FaCheckCircle className="mr-2 text-gray-500" />
                            ) : (
                              <FaTimesCircle className="mr-2 text-red-500" />
                            )}
                            {g.is_available ? "Available" : "Unavailable"}
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm pt-4 pb-8 ">{g.description}</p>
                      </div>

                      {/* Actions */}
                      <div className="mt-auto flex gap-2">
                        <button
                          onClick={() => openEditModal(g)}
                          className="flex-1 border border-black/10 cursor-pointer hover:bg-[#2545E0] text-black/70 px-3 py-2 rounded-md flex items-center justify-center hover:text-white gap-2 font-medium transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteGround(g.id)}
                          className="flex-1 border border-black/10 hover:bg-red-500 hover:text-white text-black/70 cursor-pointer  px-3 py-2 rounded-md flex items-center justify-center gap-2 font-medium transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* MODAL */}
            {modalOpen && (
              <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                <div className="bg-white w-full max-w-2xl p-6 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
                  <h2 className="text-lg font-bold mb-4">
                    {editMode ? "Update Ground" : "Create Ground"}
                  </h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Ground Name */}
                    <label className="flex flex-col gap-1 text-sm font-medium">
                      Ground Name
                      <input
                        name="ground_name"
                        value={formData.ground_name}
                        placeholder="Enter ground name"
                        onChange={handleChange}
                        className="border border-black/10 p-2 rounded outline-none focus:border-blue-500"
                      />
                    </label>

                    {/* Sport Type */}
                    <label className="flex flex-col gap-1 text-sm font-medium">
                      Sport Type
                      <select
                        name="sport_type"
                        value={formData.sport_type}
                        onChange={handleChange}
                        className="border border-black/10 p-2 rounded outline-none focus:border-blue-500"
                      >
                        <option value="">Select Sport Type</option>
                        {sportTypes.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.sport_name}
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* Location */}
                    <label className="flex flex-col gap-1 text-sm font-medium">
                      Location
                      <input
                        name="location"
                        value={formData.location}
                        placeholder="Enter location"
                        onChange={handleChange}
                        className="border border-black/10 p-2 rounded outline-none focus:border-blue-500"
                      />
                    </label>

                    {/* Map Link */}
                    <label className="flex flex-col gap-1 text-sm font-medium">
                      Map Link
                      <input
                        name="map_link"
                        value={formData.map_link}
                        placeholder="Enter map link"
                        onChange={handleChange}
                        className="border border-black/10 p-2 rounded outline-none focus:border-blue-500"
                      />
                    </label>

                    {/* Description */}
                    <label className="flex flex-col gap-1 text-sm font-medium md:col-span-2">
                      Description
                      <textarea
                        name="description"
                        value={formData.description}
                        placeholder="Enter description"
                        onChange={handleChange}
                        rows="3"
                        className="border border-black/10 p-2 rounded outline-none focus:border-blue-500"
                      />
                    </label>

                    {/* Price Per Hour */}
                    <label className="flex flex-col gap-1 text-sm font-medium">
                      Price Per Hour
                      <input
                        type="number"
                        name="price_per_hour"
                        value={formData.price_per_hour}
                        placeholder="Enter price"
                        onChange={handleChange}
                        className="border border-black/10 p-2 rounded outline-none focus:border-blue-500"
                      />
                    </label>

                    {/* Capacity */}
                    <label className="flex flex-col gap-1 text-sm font-medium">
                      Capacity
                      <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        placeholder="Enter capacity"
                        onChange={handleChange}
                        className="border border-black/10 p-2 rounded outline-none focus:border-blue-500"
                      />
                    </label>

                    {/* Availability */}
                    <label className="flex items-center gap-2 text-sm font-medium md:col-span-2">
                      <input
                        type="checkbox"
                        name="is_available"
                        checked={formData.is_available}
                        onChange={handleChange}
                        className="w-4 h-4"
                      />
                      Available
                    </label>

                    {/* Ground Photos */}
                    <label className="flex flex-col gap-1 text-sm font-medium md:col-span-2">
                      Ground Photos
                      <input
                        type="file"
                        name="photos"
                        multiple
                        accept="image/*"
                        onChange={handleChange}
                        className="border border-black/10 p-2 rounded outline-none"
                      />
                      <span className="text-xs text-gray-500">
                        Selected: {formData.photos.length} file(s)
                      </span>
                    </label>

                    {/* Preview Images */}
                    {formData.photos.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium mb-2">Preview:</p>
                        <div className="flex gap-2 flex-wrap">
                          {formData.photos.map((file, idx) => (
                            <div key={idx} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`preview-${idx}`}
                                className="w-20 h-20 object-cover rounded border"
                              />
                              <div className="text-xs text-gray-500 mt-1 truncate w-20">
                                {file.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      onClick={() => {
                        setModalOpen(false);
                        resetForm();
                      }}
                      className="px-4 py-2 bg-gray-300 rounded cursor-pointer hover:bg-gray-400"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={editMode ? updateGround : createGround}
                      className="px-4 py-2 bg-[#2545E0] text-white cursor-pointer rounded-md hover:bg-[#1e3ac4]"
                    >
                      {editMode ? "Update" : "Create"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
