import type { HTMLAttributes } from "react";

export function Card({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}
