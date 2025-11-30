"use client";

import { FaListUl, FaPlusSquare } from "react-icons/fa";
import { IoHomeOutline, IoCreateOutline } from "react-icons/io5";
import { TbBackground } from "react-icons/tb";
import { SlCalender } from "react-icons/sl";
import { ImProfile } from "react-icons/im";
import useAuthToken from "@/app/dashboard/Hooks/useAuthToken";

export const useMenuList = () => {
  const { token, user_type } = useAuthToken();

  if (!user_type) return []; // wait for user_type

  const menus = [
    { name: "Dashboard", href: "/dashboard", icon: <IoHomeOutline /> },
    {
      name: "Create Sport Type",
      href: "/dashboard/sport-type",
      icon: <FaPlusSquare />,
    },
    {
      name: "Create Ground",
      href: "/dashboard/grounds",
      icon: <TbBackground />,
    },
    {
      name: "Schedule Grounds",
      href: "/dashboard/schedule-grounds",
      icon: <SlCalender />,
    },
    {
      name: "Academy List",
      href: "/dashboard/academy-list",
      icon: <FaListUl />,
    },
    { name: "Client List", href: "/dashboard/client-list", icon: <FaListUl /> },
    {
      name: "Create Plans",
      href: "/dashboard/create-subscriptions",
      icon: <IoCreateOutline />,
    },
    { name: "My Profile", href: "/dashboard/profile", icon: <ImProfile /> },
  ];

  if (user_type === "SuperAdmin") return menus;

  if (user_type === "Academy") {
    return menus.filter(
      (m) =>
        m.name !== "Create Sport Type" &&
        m.name !== "Academy List" &&
        m.name !== "Client List"
    );
  }

  if (user_type === "Client") {
    return menus.filter(
      (m) =>
        m.name !== "Create Sport Type" &&
        m.name !== "Academy List" &&
        m.name !== "Schedule Grounds" &&
        m.name !== "Client List"
    );
  }

  return menus;
};
