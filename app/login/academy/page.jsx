"use client";
import { useState } from "react";
import Link from "next/link";
import "../../root.css";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Academy() {
  const [formData, setFormData] = useState({
    academy_name: "",
    contact_no: "",
    email: "",
    location: "",
    map_link: "",
    social_media_link: "",
    about_academy: "",
    academy_thumbnail: null,
    academy_logo: null,
  });

  const router = useRouter();

  // Handle text inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle file inputs
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.files[0],
    });
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      form.append(key, formData[key]);
    });

    // Log all data
    // console.log("FormData Contents:");
    // form.forEach((value, key) => {
    //   console.log(key, value);
    // });

    try {
      const res = await axios.post(
        "https://api.ollent.com/api/academy-register/",
        form
      );

      router.push("/login");

      console.log(res , "check academi")

      // Reset the form
      setFormData({
        academy_name: "",
        contact_no: "",
        email: "",
        location: "",
        map_link: "",
        social_media_link: "",
        about_academy: "",
        academy_thumbnail: null,
        academy_logo: null,
      });
      toast.success("Academy Registered Successfully!");

      console.log("Response:", res.data);
    } catch (error) {
      toast.error("Registration failed! Try again.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://pub-df4928c055234cedb2c64ca27ef7aebd.r2.dev/login/academy.jpg')",
        }}
      ></div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Register Card */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 w-full max-w-3xl shadow-2xl"
      >
        <h2 className="text-center text-white text-3xl font-semibold mb-8">
          Academy Register
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Academy Name */}
          <div>
            <label className="text-white text-sm mb-1 block">
              Academy Name
            </label>
            <input
              type="text"
              name="academy_name"
              onChange={handleChange}
              placeholder="Enter Academy Name"
              className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
            />
          </div>

          {/* Contact Number */}
          <div>
            <label className="text-white text-sm mb-1 block">
              Contact Number
            </label>
            <input
              type="text"
              name="contact_no"
              onChange={handleChange}
              placeholder="017xxxxxxx"
              className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-white text-sm mb-1 block">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              placeholder="example@gmail.com"
              className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-white text-sm mb-1 block">Location</label>
            <input
              type="text"
              name="location"
              onChange={handleChange}
              placeholder="Enter Location"
              className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
            />
          </div>

          {/* Academy Thumbnail */}
          <div>
            <label className="text-white text-sm mb-1 block">
              Academy Thumbnail
            </label>
            <input
              type="file"
              name="academy_thumbnail"
              onChange={handleFileChange}
              className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white cursor-pointer"
            />
          </div>

          {/* Academy Logo */}
          <div>
            <label className="text-white text-sm mb-1 block">
              Academy Logo
            </label>
            <input
              type="file"
              name="academy_logo"
              onChange={handleFileChange}
              className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white cursor-pointer"
            />
          </div>

          {/* Map Link */}
          <div>
            <label className="text-white text-sm mb-1 block">
              Google Map Link
            </label>
            <input
              type="text"
              name="map_link"
              onChange={handleChange}
              placeholder="Paste Google Map Link"
              className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
            />
          </div>

          {/* Social Media Link */}
          <div>
            <label className="text-white text-sm mb-1 block">
              Social Media Link
            </label>
            <input
              type="text"
              name="social_media_link"
              onChange={handleChange}
              placeholder="Paste Social Link"
              className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
            />
          </div>

          {/* About Academy */}
          <div className="md:col-span-2">
            <label className="text-white text-sm mb-1 block">
              About Academy
            </label>
            <textarea
              name="about_academy"
              onChange={handleChange}
              rows="3"
              placeholder="Write about your academy..."
              className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white"
            ></textarea>
          </div>
        </div>

        {/* Submit Button */}
        <button className="w-full mt-6 bg-white text-purple-700 font-semibold py-3 rounded-full hover:bg-gray-200 transition">
          Register Academy
        </button>

        <p className="text-center text-white mt-4">
          Already have an account?{" "}
          <Link href="/login">
            <span className="underline cursor-pointer">Login</span>
          </Link>
        </p>
      </form>
    </div>
  );
}
