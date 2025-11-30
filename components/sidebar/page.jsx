"use client";
import { useState } from "react";
import { useMenuList } from "@/components/menuList/page";
import Image from "next/image";
import logo from "@/public/logo/logo.png";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiMenu, HiX } from "react-icons/hi";

export default function Sidebar() {
  const menu = useMenuList();
  const path = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="xl:hidden fixed right-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-gray-50 text-black/70"
        aria-label="Toggle menu"
      >
        {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <section
        className={`
          edn__sidebarMenu
          fixed top-0 left-0 h-full bg-white shadow-lg
          xl:translate-x-0 xl:relative xl:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          z-40
        `}
      >
        <div className="p-4">
          <div className="mb-[5vh]">
            <Image
              src={logo}
              alt="eduden logo"
              width={200}
              height={100}
              className="object-cover"
            />
          </div>

          {menu && menu.length > 0 ? (
            <ul className="space-y-5">
              {menu.map((list, i) => (
                <li key={i}>
                  <Link
                    href={list.href}
                    className={`flex items-center space-x-3 px-4 py-2 rounded cursor-pointer ${
                      path === list.href
                        ? "bg-[#2545E0] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-xl">{list.icon}</span>
                    <span>{list.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
        />
      )}
    </>
  );
}
