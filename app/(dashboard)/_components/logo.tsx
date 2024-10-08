"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";

interface LogoProps {
  imageUrl: string;
  imageUrlDark: string;
  link: string;
}

export const Logo = ({ imageUrl, imageUrlDark, link }: LogoProps) => {
  const { theme } = useTheme();

  const imageUrlNew = theme === "dark" ? imageUrlDark : imageUrl;

  return link ? (
    <Link
      target={link ?? ""}
      href={link ?? ""}
      className="flex h-full w-full items-center justify-center"
    >
      <Image
        priority
        height={100}
        width={150}
        alt="logo"
        src={imageUrlNew ?? ""}
        className="max-h-full max-w-full cursor-pointer object-contain"
      />
    </Link>
  ) : (
    <></>
  );
};
