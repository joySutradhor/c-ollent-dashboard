"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import Link from "next/link";
import "../root.css";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // <-- Loading state
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Email and password required");
      return;
    }

    setLoading(true); 

    try {
      const response = await axios.post("https://api.ollent.com/api/login/", {
        email,
        password,
      });

      console.log(response.data, "login response")

      localStorage.setItem("token", response?.data?.token);
      localStorage.setItem("user_type", response?.data?.user?.user_type);

      toast.success("Login successful!");

      router.push("/dashboard");
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Invalid email or password");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://pub-df4928c055234cedb2c64ca27ef7aebd.r2.dev/login/login.jpg')",
        }}
      ></div>

      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-center text-white text-3xl font-semibold mb-8">
          Login
        </h2>

        {/* email */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="email"
            className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full font-semibold py-3 rounded-full transition cursor-pointer
            ${
              loading
                ? "bg-gray-300 text-gray-600"
                : "bg-white text-black-700 hover:bg-gray-200"
            }
          `}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Loading...
            </div>
          ) : (
            "Login"
          )}
        </button>

        <p className="text-white mt-4">Don’t have an account?</p>

        <p className="text-white text-sm">
          <Link href="/login/academy">
            <span className="underline cursor-pointer">Academy Register</span>
          </Link>
        </p>

        <p className="text-white text-sm">
          <Link href="/login/client">
            <span className="underline cursor-pointer">Client Register</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
