"use client";

import React from "react";
import { Send } from "lucide-react";

interface ChatInputBarProps {
  input: string;
  contactName: string;
  onInputChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ChatInputBar({
  input,
  contactName,
  onInputChange,
  onSubmit,
}: ChatInputBarProps) {
  const shortName = contactName ? contactName.split(" ")[0] : "user";

  return (
    <form
      onSubmit={onSubmit}
      className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
    >
      <input
        type="text"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder={`Message ${shortName}...`}
        className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all"
        autoFocus
      />
      <button
        type="submit"
        disabled={!input.trim()}
        className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors shadow-xs cursor-pointer"
        aria-label="Send Message"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
