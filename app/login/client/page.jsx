"use client";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import Link from "next/link";
import "../../root.css";
import { useRouter } from "next/navigation";

export default function Client() {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
  });

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const rouder = useRouter();

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form Data:", formData);

    try {
      const res = await axios.post(
        "https://api.ollent.com/api/client-register/",
        formData
      );

      rouder.push("/dashboard");
      setFormData({
        name: "",
        contact: "",
        email: "",
      });
      toast.success("Client registered successfully!");

      console.log("Response:", res.data);
    } catch (err) {
      toast.error("Registration failed, try again!");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4">
      {/* Full Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://pub-df4928c055234cedb2c64ca27ef7aebd.r2.dev/login/client.jpg')",
        }}
      ></div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Register Card */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 w-full max-w-md shadow-2xl"
      >
        <h2 className="text-center text-white text-3xl font-semibold mb-8">
          Client Register
        </h2>

        {/* Name */}
        <div className="mb-4">
          <label className="text-white text-sm mb-1 block">Full Name</label>
          <input
            type="text"
            name="name"
            onChange={handleChange}
            placeholder="Enter your name"
            className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        {/* Contact */}
        <div className="mb-4">
          <label className="text-white text-sm mb-1 block">
            Contact Number
          </label>
          <input
            type="number"
            name="contact"
            onChange={handleChange}
            placeholder="Enter contact number"
            className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="text-white text-sm mb-1 block">Email Address</label>
          <input
            type="email"
            name="email"
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        {/* Register Button */}
        <button className="w-full bg-white text-purple-700 font-semibold py-3 rounded-full hover:bg-gray-200 transition">
          Register
        </button>

        {/* Login */}
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
