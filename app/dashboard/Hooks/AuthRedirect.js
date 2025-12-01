"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const AuthRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");

      // No token → redirect to login
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await axios.post(
          "https://api.ollent.com/api/verify-token/",
          { token } 
        );

        console.log(response , "response from api token")

        // API returns: { result: "true" }
        if (response?.data?.result == true) {
          router.push("/dashboard");
        } else {
          router.push("/login");
          localStorage.clear();
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        router.push("/login");
        localStorage.clear();
      }
    };

    verifyToken();
  }, [router]);

  return null;
};

export default AuthRedirect;
