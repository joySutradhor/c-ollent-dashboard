import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const useAuthToken = () => {
  const [token, setToken] = useState(null);
  const [user_type, setAccountType] = useState(null);


  const rouder = useRouter();

  const loadLocal = () => {
    setToken(localStorage.getItem("token"));
    setAccountType(localStorage.getItem("user_type"));

  };

  const verifyToken = async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) return;

    try {
      const res = await axios.post(
        "https://api.ollent.com/api/verify-token/",
        { token: storedToken }
      );

      if (res.data.result !== true) {
        rouder.push("/login")
        localStorage.clear();
        setToken(null);
      }
    } catch {
      localStorage.clear();
      setToken(null);
    }
  };

  useEffect(() => {
    loadLocal();
    verifyToken();
  }, []);

  return { token, user_type };
};

export default useAuthToken;
