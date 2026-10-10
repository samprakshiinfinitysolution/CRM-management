"use client";

import React from "react";
import { CheckCheck, MessageSquare } from "lucide-react";
import type { ChatContact, ChatMessage } from "./types";

interface ChatMessagesViewProps {
  isLoading: boolean;
  messages: ChatMessage[];
  selectedContact: ChatContact;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessagesView({
  isLoading,
  messages,
  selectedContact,
  messagesEndRef,
}: ChatMessagesViewProps) {
  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs py-10">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
        <span>Loading messages...</span>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs py-10 text-center px-4">
        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mb-2 text-indigo-500">
          <MessageSquare className="w-5 h-5" />
        </div>
        <p className="font-semibold text-slate-700 dark:text-slate-200">
          No messages yet
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Start a conversation with {selectedContact.name} below.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-3.5 overflow-y-auto space-y-3 no-scrollbar">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-2 text-xs ${
            msg.sender === "user" ? "justify-end" : "justify-start"
          }`}
        >
          {msg.sender !== "user" && (
            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 border border-indigo-200 dark:border-indigo-800">
              {selectedContact.name[0]?.toUpperCase()}
            </div>
          )}
          <div
            className={`max-w-[78%] p-3 rounded-2xl shadow-2xs ${
              msg.sender === "user"
                ? "bg-indigo-600 text-white rounded-br-xs"
                : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-bl-xs"
            }`}
          >
            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            <div
              className={`flex items-center justify-end gap-1 text-[9px] mt-1 ${
                msg.sender === "user"
                  ? "text-indigo-200"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              <span>{msg.timestamp}</span>
              {msg.sender === "user" && (
                <CheckCheck className="w-3 h-3 text-indigo-200" />
              )}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
