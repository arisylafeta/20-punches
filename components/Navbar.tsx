"use client";

import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="mb-4">
      <a className={`mr-4 ${pathname === "/chat" ? "text-white border-b" : ""}`} href="/chat">💼 Chat with Warren</a>
    </nav>
  );
}