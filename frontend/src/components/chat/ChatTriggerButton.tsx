"use client";

import React from "react";
import { MessageSquare, X } from "lucide-react";

interface ChatTriggerButtonProps {
  isOpen: boolean;
  hasNewMessage: boolean;
  onToggle: () => void;
}

export function ChatTriggerButton({
  isOpen,
  hasNewMessage,
  onToggle,
}: ChatTriggerButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="group relative p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer"
      aria-label="Open Workspace Chat"
    >
      <MessageSquare
        className={`w-6 h-6 transition-transform duration-200 ${
          isOpen ? "rotate-90 scale-0 opacity-0 absolute" : "scale-100 opacity-100"
        }`}
      />
      <X
        className={`w-6 h-6 transition-transform duration-200 ${
          isOpen
            ? "scale-100 opacity-100 rotate-0"
            : "-rotate-90 scale-0 opacity-0 absolute"
        }`}
      />

      {/* Pulse Indicator badge */}
      {!isOpen && hasNewMessage && (
        <span className="absolute top-0 right-0 flex h-3 w-3 -mt-0.5 -mr-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500 border-2 border-white dark:border-slate-900" />
        </span>
      )}
    </button>
  );
}
