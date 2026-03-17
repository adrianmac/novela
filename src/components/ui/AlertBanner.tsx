"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export interface AlertBannerProps {
  message: string;
  action?: string;
  href?: string;
  level: 'critical' | 'high' | 'medium' | 'low';
  className?: string;
}

export function AlertBanner({ message, action, href, level, className }: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Small delay to allow the slide down animation to trigger on mount
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  if (isDismissed) return null;

  let bgClass = "bg-gray-50";
  let textClass = "text-gray-600";
  let borderClass = "border-gray-200";
  let iconBgClass = "bg-gray-100";
  let iconColorClass = "text-gray-500";

  if (level === 'critical') {
    bgClass = "bg-red-50";
    textClass = "text-red-800";
    borderClass = "border-red-200";
    iconBgClass = "bg-red-100";
    iconColorClass = "text-red-600";
  } else if (level === 'high') {
    bgClass = "bg-amber-50";
    textClass = "text-amber-800";
    borderClass = "border-amber-200";
    iconBgClass = "bg-amber-100";
    iconColorClass = "text-amber-600";
  } else if (level === 'medium') {
    bgClass = "bg-blue-50";
    textClass = "text-blue-800";
    borderClass = "border-blue-200";
    iconBgClass = "bg-blue-100";
    iconColorClass = "text-blue-600";
  }

  return (
    <div
      className={cn(
        "relative rounded-xl p-4 flex gap-4 items-center border shadow-sm overflow-hidden transition-all duration-300 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4",
        bgClass, borderClass, className
      )}
    >
      <div className={cn("p-2 rounded-lg shrink-0", iconBgClass, iconColorClass)}>
        <AlertTriangle className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0 pr-8">
        <h3 className={cn("font-semibold text-sm sm:text-base", textClass)}>
          {message}
        </h3>
      </div>

      {action && href && (
        <Link
          href={href}
          className={cn(
            "hidden sm:flex h-10 px-4 rounded-lg bg-white border font-medium whitespace-nowrap items-center transition-colors shadow-sm",
            textClass, borderClass,
            level === 'critical' ? "hover:bg-red-50" :
            level === 'high' ? "hover:bg-amber-50" :
            level === 'medium' ? "hover:bg-blue-50" : "hover:bg-gray-100"
          )}
        >
          {action}
        </Link>
      )}

      {action && href && (
        <Link href={href} className={cn("sm:hidden text-sm font-medium underline underline-offset-2 shrink-0 mr-8", textClass)}>
          {action.replace(' →', '')}
        </Link>
      )}

      <button
        onClick={() => setIsDismissed(true)}
        className={cn(
          "absolute top-3 right-3 p-1.5 rounded-md hover:bg-black/5 transition-colors",
          textClass
        )}
        aria-label="Dismiss alert"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
