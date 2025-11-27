"use client";
import Topbar from "@/components/topbar/page";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function SportPage() {
  const [sportName, setSportName] = useState("");
  const [sports, setSports] = useState([]);
  const [selectedSport, setSelectedSport] = useState(null);
  const [editName, setEditName] = useState("");
  const pathname = usePathname();

  const formattedPath = pathname
    .replace(/^\/|\/$/g, "")
    .split("/")
    .map((segment) =>
      segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .join(" / ");

  //   Fetch all sports
  const fetchSports = async () => {
    try {
      const res = await axios.get("https://api.ollent.com/api/sport-type/");
      setSports(res.data?.results);
      // console.log(res.data, "check sport data");
    } catch (err) {
      toast.error("Failed to fetch sports!");
    }
  };

  useEffect(() => {
    fetchSports();
  }, []);

  // Create sport
  const handleCreate = async () => {
    if (!sportName) return toast.error("Please enter a sport name");

    try {
      await axios.post("https://api.ollent.com/api/sport-type/", {
        sport_name: sportName,
      });
      toast.success("Sport created successfully!");
      setSportName("");
      fetchSports();
    } catch (err) {
      toast.error("Failed to create sport!");
    }
  };

  // Select single sport
  const handleSelect = async (id) => {
    try {
      const res = await axios.get(
        `https://api.ollent.com/api/sport-type/${id}/`
      );
      setSelectedSport(res.data);
      setEditName(res.data.sport_name);
    } catch (err) {
      toast.error("Failed to fetch sport details!");
    }
  };

  // Update sport
  const handleUpdate = async () => {
    if (!editName || !selectedSport) return;

    console.log(selectedSport.id, editName, "update sport");

    try {
      await axios.put(
        `https://api.ollent.com/api/sport-type/${selectedSport.id}/`,
        { sport_name: editName }
      );
      toast.success("Sport updated successfully!");
      setSelectedSport(null);
      setEditName("");
      fetchSports();
    } catch (err) {
      toast.error("Failed to update sport!");
    }
  };

  // console.log(sports, "check data");
  return (
    <div className="edn__sideToLeftSpace">
      <div className="edn__left__right__space">
        <Topbar title={formattedPath} />
        <div className="grid lg:grid-cols-2 gap-[5vw] h-full">
          <div className="border border-black/10 p-10">
            <h1 className="text-xl md:text-xl text-black/70 font-bold mb-4">
              Create Sport type
            </h1>

            {/* Create Sport */}
            <div>
              <input
                type="text"
                value={sportName}
                onChange={(e) => setSportName(e.target.value)}
                placeholder="Enter sport name"
                className="w-full p-3 rounded-lg border border-gray-300 outline-none  "
              />
              <div>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 mt-10 bg-[#2545E0] text-white rounded-md "
                >
                  Create
                </button>
              </div>
            </div>
          </div>

          <div className="border border-black/10 p-10 w-full   h-full ">
            {/* List of Sports */}
            <div className="  ">
              <h2 className="font-semibold mb-4">All Sports</h2>
              <ul className="bg-white rounded-lg shadow divide-y divide-gray-200">
                {sports?.map((sport) => (
                  <li
                    key={sport.id}
                    className="p-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                  >
                    <span>{sport.sport_name}</span>
                    <button
                      onClick={() => handleSelect(sport.id)}
                      className="text-[#2545E0] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Edit Sport */}
            {selectedSport && (
              <div className="flex flex-col md:flex-row items-center gap-4 w-full mt-6 ">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 "
                />
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-[#2545E0] text-white rounded-md "
                >
                  Update
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
