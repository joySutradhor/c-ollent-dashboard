"use client";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Topbar from "../topbar/page";
import Image from "next/image";
import axios from "axios";
import Swal from "sweetalert2";
import { FaSignOutAlt, FaSave, FaCamera } from "react-icons/fa";
import { MdOutlinePassword } from "react-icons/md";
import { IoCloseSharp } from "react-icons/io5";
import useAuthToken from "@/app/dashboard/Hooks/useAuthToken";

export default function ProfilePage() {
  const pathname = usePathname();
  const router = useRouter();
  const { token, user_type } = useAuthToken();

  const [data, setData] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [form, setForm] = useState({});

  // password states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Format Pathname
  const formattedPath = pathname
    .replace(/^\/|\/$/g, "")
    .split("/")
    .map((segment) =>
      segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .join(" / ");

  // Fetch User Profile
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://api.ollent.com/api/profile/`,
          {
            headers: { Authorization: `Token ${token}` },
          }
        );

        const profile = response.data;
        setData(profile);

        // Auto-fill form according to user type
        if (user_type === "SuperAdmin") {
          setForm({
            name: profile.name || "",
            contact: profile.contact || "",
            address: profile.address || "",
            logo: null,
          });
          setImagePreview(profile.logo);
        } else if (user_type === "Academy") {
          setForm({
            academy_name: profile.academy_name || "",
            about_academy: profile.about_academy || "",
            contact_no: profile.contact_no || "",
            location: profile.location || "",
            map_link: profile.map_link || "",
            academy_thumbnail: null,
            academy_logo: null,
          });
          setImagePreview(profile.academy_logo);
        } else if (user_type === "Client") {
          setForm({
            name: profile.name || "",
            contact: profile.contact || "",
            address: profile.address || "",
            profile_image: null,
          });
          setImagePreview(profile.profile_image);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchData();
  }, [token]);

  // General Input Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Image Change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const key =
        user_type === "SuperAdmin"
          ? "logo"
          : user_type === "Academy"
          ? "academy_logo"
          : "profile_image";

      setForm((prev) => ({ ...prev, [key]: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Submit Profile Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to update your profile?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2545E0",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
    });

    if (!result.isConfirmed) return;

    try {
      const formData = new FormData();

      // Admin fields
      if (user_type === "SuperAdmin") {
        formData.append("name", form.name);
        formData.append("contact", form.contact);
        formData.append("address", form.address);
        if (form.logo) formData.append("logo", form.logo);
      }

      // Academy fields
      else if (user_type === "Academy") {
        formData.append("academy_name", form.academy_name);
        formData.append("about_academy", form.about_academy);
        formData.append("contact_no", form.contact_no);
        formData.append("location", form.location);
        formData.append("map_link", form.map_link);
        if (form.academy_thumbnail) {
          formData.append("academy_thumbnail", form.academy_thumbnail);
        }
        if (form.academy_logo) {
          formData.append("academy_logo", form.academy_logo);
        }
      }

      // Client fields
      else if (user_type === "Client") {
        formData.append("name", form.name);
        formData.append("contact", form.contact);
        formData.append("address", form.address || "Place address here");
        if (form.profile_image) {
          formData.append("profile_image", form.profile_image);
        }
      }

      await axios.patch(`https://api.ollent.com/api/profile/`, formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        title: "Updated!",
        text: "Your profile has been updated.",
        icon: "success",
        confirmButtonColor: "#2545E0",
      });
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire("Error", "Failed to update profile.", "error");
    }
  };

  // Logout
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2545E0",
      cancelButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      localStorage.clear();
      router.push("/login");
    }
  };

  // Password Handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return Swal.fire("Error", "New passwords do not match.", "error");
    }

    try {
      await axios.post(
        "https://api.ollent.com/api/change-password/",
        passwordForm,
        { headers: { Authorization: `Token ${token}` } }
      );

      Swal.fire("Success", "Password changed.", "success");
      setShowPasswordModal(false);
    } catch {
      Swal.fire("Error", "Failed to change password.", "error");
    }
  };

  return (
    <section className="edn__sideToLeftSpace">
      <div className="edn__left__right__space">
        <Topbar title={formattedPath} />

        <div className="bg-white rounded-xl px-5 pt-5 pb-1">
          <h3 className="edn__section__title mb-4">Profile</h3>

          {data ? (
            <form onSubmit={handleSubmit}>
              {/* IMAGE */}
              <div className="flex justify-center items-center col-span-2 mb-5 relative">
                <Image
                  height={100}
                  width={100}
                  alt="Profile Img"
                  src={imagePreview || "/default-avatar.png"}
                  className="rounded-full size-36 object-cover"
                />
                <label className="flex justify-end bg-black text-white p-2 rounded-full cursor-pointer mt-16">
                  <FaCamera />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    hidden
                  />
                </label>
              </div>

              {/* DYNAMIC FIELDS */}
              <div className="grid md:grid-cols-2 gap-5">
                {/* ADMIN */}
                {user_type === "SuperAdmin" && (
                  <>
                    <Input
                      label="Name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                    />
                    <Input
                      type="number"
                      label="Contact"
                      name="contact"
                      value={form.contact}
                      onChange={handleChange}
                    />
                    <Input
                      label="Address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                    />
                  </>
                )}

                {/* ACADEMY */}
                {user_type === "Academy" && (
                  <>
                    <Input
                      label="Academy Name"
                      name="academy_name"
                      value={form.academy_name}
                      onChange={handleChange}
                    />
                    <Input
                      label="About Academy"
                      name="about_academy"
                      value={form.about_academy}
                      onChange={handleChange}
                    />
                    <Input
                      inputMode="numeric"
                      label="Contact No"
                      name="contact_no"
                      value={form.contact_no}
                      onChange={handleChange}
                    />
                    <Input
                      label="Location"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                    />
                    <Input
                      label="Map Link"
                      name="map_link"
                      value={form.map_link}
                      onChange={handleChange}
                    />
                  </>
                )}

                {/* CLIENT */}
                {user_type === "Client" && (
                  <>
                    <Input
                      label="Name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                    />
                    <Input
                      label="Contact"
                      name="contact"
                      value={form.contact}
                      onChange={handleChange}
                    />
                    <Input
                      label="Address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                    />
                  </>
                )}
              </div>

              {/* BUTTONS */}
              <div className="grid md:grid-cols-2 justify-between items-center py-10">
                <div className="flex gap-x-6 flex-wrap mb-5 md:mb-0">
                  <button
                    type="submit"
                    className="flex items-center gap-2 border border-black/10 cursor-pointer hover:bg-[#2545E0] hover:text-white text-black py-2 px-6 rounded"
                  >
                    <FaSave /> Update Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    type="button"
                    className="flex items-center gap-2 border border-black/10 cursor-pointer hover:bg-[#2545E0] hover:text-white text-black py-2 px-6 rounded"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>

                <div className="flex md:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(true)}
                    className="flex items-center gap-2 border-black/10 cursor-pointer hover:bg-[#2545E0] hover:text-white text-black  py-2 px-6 rounded"
                  >
                    <MdOutlinePassword /> Change Password
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <p>Loading profile...</p>
          )}
        </div>

        {/* PASSWORD MODAL */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
              <button
                className="absolute top-4 right-3 cursor-pointer text-gray-500 hover:text-red-500 text-xl"
                onClick={() => setShowPasswordModal(false)}
              >
                <IoCloseSharp />
              </button>

              <h2 className="text-xl font-semibold mb-4">Change Password</h2>

              <form onSubmit={submitChangePassword} className="space-y-4">
                <Input
                  label="Old Password"
                  name="old_password"
                  value={passwordForm.old_password}
                  onChange={handlePasswordChange}
                />
                <Input
                  label="New Password"
                  name="new_password"
                  value={passwordForm.new_password}
                  onChange={handlePasswordChange}
                />
                <Input
                  label="Confirm Password"
                  name="confirm_password"
                  value={passwordForm.confirm_password}
                  onChange={handlePasswordChange}
                />

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="bg-[#2545E0] cursor-pointer text-white  px-6 py-2 rounded flex items-center gap-x-2"
                  >
                    <FaSave /> Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

const Input = ({ label, name, value, onChange }) => {
  // auto-detect numeric fields
  const isNumberField =
    /contact|contact_no|number|mobile/i.test(name);

  return (
    <label className="flex flex-col">
      {label}
      <input
        type={isNumberField ? "number" : "text"}
        name={name}
        value={value}
        onChange={onChange}
        className="p-2 border border-black/10 rounded outline-none mt-1 edn__small__text"
      />
    </label>
  );
};
