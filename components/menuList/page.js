import { IoHomeOutline } from 'react-icons/io5'
import { SlCalender } from 'react-icons/sl'
import { LuFolderCode } from 'react-icons/lu'
import { MdOutlineIntegrationInstructions } from 'react-icons/md'
import { FaFileCircleQuestion } from 'react-icons/fa6'
import { FaFileAlt } from 'react-icons/fa'
import { FaAward } from 'react-icons/fa'
import { FaIndianRupeeSign } from "react-icons/fa6";
import { ImProfile } from "react-icons/im";
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";
import { FaPlusSquare } from "react-icons/fa";

import { GoListOrdered } from "react-icons/go";
import { FaListUl } from "react-icons/fa6";






export const menuList = () => {
  return [
    { name: 'Dashboard', href: '/dashboard', icon: <IoHomeOutline /> },
    { name: 'Create Sport Type', href: '/dashboard/sport-type', icon: <FaPlusSquare /> },
    {
      name: 'Create Ground',
      href: '/dashboard/grounds',
      icon: <LuFolderCode />
    },
    {
      name: 'Schedule Grounds',
      href: '/dashboard/schedule-grounds',
      icon: <SlCalender />
    },
    {
      name: 'Academy List',
      href: '/dashboard/academy-list',
      icon: <FaListUl />
    },
    {
      name: 'Client List',
      href: '/dashboard/client-list',
      icon: <GoListOrdered />
    },
    // { name: 'My quiz', href: '/dashboard/my-quiz', icon: <FaFileCircleQuestion /> },
    // { name: 'Submit Assignment', href: '/dashboard/submit-assignment', icon: <MdOutlineAssignmentTurnedIn /> },
    // { name: 'My Attendance', href: '/dashboard/my-attendance', icon: <FaFileAlt /> },
    // { name: 'Payment History', href: '/dashboard/payment-history', icon: <FaIndianRupeeSign /> },
    { name: 'My Profile', href: '/dashboard/profile', icon: <ImProfile /> },
    // { name: 'My Certificate', href: '/dashboard/my-certificate', icon: <FaAward /> }
  ]
}
