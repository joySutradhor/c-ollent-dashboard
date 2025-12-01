"use client";


// import { useToken } from '@/components/hooks/GetToken';
// import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import "./root.css"


export default function Home() {
  // const token = useToken();
  const router = useRouter();

  // useEffect(() => {
  //   if (token) {
  //     console.log("have token");
  //     router.push("/dashboard")
  //   } else {
  //     console.log("no token");
  //     router.push("/login")
  //   }
  // }, [token]); 



  return (
    <section>
      {/* <Login /> */}
      <h1 className='text-6xl font-bold  flex justify-center items-center h-[100vh]'>
  
         </h1>
    </section>
  );
}

