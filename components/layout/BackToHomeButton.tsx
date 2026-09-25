"use client";

import Link from "next/link";
import { Home } from "lucide-react";

export default function BackToHomeButton() {
  return (
    <Link
      href="/dashboard"
      className="inline-flex items-center gap-2 rounded-lg border border-[#d4af37] bg-white px-4 py-2 text-sm font-semibold text-[#0d3b78] shadow-sm transition hover:bg-[#f8f5ec]"
    >
      <Home size={17} />
      ወደ መነሻ ገጽ
    </Link>
  );
}