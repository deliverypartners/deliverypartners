import React from "react";

export function Badge({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800 ${className}`}>
      {children}
    </span>
  );
} 