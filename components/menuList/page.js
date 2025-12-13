"use client";

import { FaListUl, FaPlusSquare } from "react-icons/fa";
import { IoHomeOutline, IoCreateOutline } from "react-icons/io5";
import { TbBackground } from "react-icons/tb";
import { SlCalender } from "react-icons/sl";
import { ImProfile } from "react-icons/im";
import useAuthToken from "@/app/dashboard/Hooks/useAuthToken";
import { RiPriceTag3Line } from "react-icons/ri";
import { TbHistory } from "react-icons/tb";
import { MdChecklist } from "react-icons/md";
import { BsListCheck } from "react-icons/bs";
import { RiListUnordered } from "react-icons/ri";




export const useMenuList = () => {
  const { user_type } = useAuthToken();

  if (!user_type) return []; 

  // Define menus with roles
  const menus = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <IoHomeOutline />,
      roles: ["SuperAdmin", "Academy", "Client"],
    },
    {
      name: "Create Sport Type",
      href: "/dashboard/sport-type",
      icon: <FaPlusSquare />,
      roles: ["SuperAdmin"],
    },
    {
      name: "All Grounds",
      href: "/dashboard/grounds",
      icon: <TbBackground />,
      roles: ["SuperAdmin", "Academy" , "Client"],
    },
    {
      name: "Booking List",
      href: "/dashboard/booking-list",
      icon: <MdChecklist />,
      roles: ["SuperAdmin", "Academy" , "Client"],
    },
    {
      name: "Schedule Grounds",
      href: "/dashboard/schedule-grounds",
      icon: <SlCalender />,
      roles: ["Academy"],
    },
    {
      name: "Academy List",
      href: "/dashboard/academy-list",
      icon: <RiListUnordered />,
      roles: ["SuperAdmin"],
    },
    {
      name: "Client List",
      href: "/dashboard/client-list",
      icon: <BsListCheck />,
      roles: ["SuperAdmin"],
    },
    {
      name: "Create Plans",
      href: "/dashboard/create-subscriptions",
      icon: <IoCreateOutline />,
      roles: ["SuperAdmin"],
    },
    {
      name: "Get Plans",
      href: "/dashboard/get-plans",
      icon: <RiPriceTag3Line />,
      roles: ["Academy"],
    },
    {
      name: "Plans History",
      href: "/dashboard/plan-history",
      icon: <TbHistory />,
      roles: ["Academy"],
    },
    {
      name: "Plans History",
      href: "/dashboard/subscriptions-history",
      icon: <TbHistory />,
      roles: ["SuperAdmin"],
    },
    {
      name: "My Profile",
      href: "/dashboard/profile",
      icon: <ImProfile />,
      roles: ["SuperAdmin", "Academy", "Client"],
    },
  ];

  // Filter menus based on current user_type
  const filteredMenus = menus.filter((menu) => menu.roles.includes(user_type));

  return filteredMenus;
};
