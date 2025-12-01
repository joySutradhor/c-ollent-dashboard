import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const useAuthToken = () => {
  const router = useRouter();

  const [token, setToken] = useState(null);
  const [user_type, setUserType] = useState(null);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedType = localStorage.getItem("user_type");

    if (!storedToken) {
      router.push("/login");
      return;
    }

    // Set first (UI will load correctly)
    setToken(storedToken);
    setUserType(storedType);

    // const verify = async () => {
    //   try {
    //     const res = await axios.post(
    //       "https://api.ollent.com/api/verify-token/",
    //       { token: storedToken }
    //     );

    //     const result = res.data?.result;

   
    //     if (result === true || result === "true") {
    //       setLoading(false);
    //     } else {
    //       localStorage.clear();
    //       router.push("/login");
    //     }
    //   } catch (err) {
    //     console.log(err, "auto logout error");
    //     localStorage.clear();
    //     router.push("/login");
    //   }

    //   setLoading(false);
    // };

    // verify();
  }, []);

  return { token, user_type };
};

export default useAuthToken;
