// components/Topbar.tsx

"use client";

import React from "react";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">
            FINNEX Dashboard
          </div>
          <div className="text-xs text-gray-500">
            Structured agricultural investment intelligence
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Placeholder for future auth / user menu */}
          <div className="text-xs text-gray-500">
            Role: Investor (MVP)
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
            AK
          </div>
        </div>
      </div>
    </header>
  );
}