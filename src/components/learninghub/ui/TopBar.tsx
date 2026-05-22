"use client";
import React from "react";
import Link from "next/link";
import { FaChevronLeft } from "react-icons/fa";
import { useTranslations } from "../../../lib/i18n";

const Header = () => {
  const { tLearninghub, lang } = useTranslations();

  return (
    <div className="flex items-center justify-center p-6 font-[Kantumruy_Pro] t">
      <div className="absolute left-4">
        <Link href="/">
          <FaChevronLeft className="text-xl text-[#5B5B5B] cursor-pointer" />
        </Link>
      </div>
      <h1 className="text-[#0D1B2A]  text-base font-normal leading-4 tracking-[0.2px]">
        {tLearninghub("learningHub")}
      </h1>
    </div>
  );
};

export default Header;
