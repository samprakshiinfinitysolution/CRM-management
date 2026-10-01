"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  CalendarClock,
  UserCheck,
  AlertCircle,
  Clock,
  CheckCheck,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "@/store/api/notificationApi";

export default function NotificationsCenterPage() {
  const {
    data: notifRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const notifications = notifRes?.data || [];
  const filtered = notifications.filter((n) =>
    filter === "unread" ? !n.isRead : true,
  );
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id).unwrap();
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead().unwrap();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "ASSIGNMENT":
        return <UserCheck className="w-4 h-4 text-indigo-600" />;
      case "FOLLOW_UP":
        return <CalendarClock className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600" />
            <span>Notification Alerts</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time feed of lead assignments, upcoming follow-up deadlines,
            and pipeline updates
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={isMarkingAll}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All as Read ({unreadCount})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition-all"
            title="Refresh alerts"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin text-indigo-600" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === "all"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          All Alerts ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === "unread"
              ? "bg-indigo-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Checking notifications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 stroke-[1.5]" />
            <p className="text-sm font-semibold text-slate-700">
              All caught up!
            </p>
            <p className="text-xs text-slate-400">
              No new alerts or pending tasks require your attention.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.isRead && handleMarkRead(item.id)}
              className={`p-4 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                item.isRead
                  ? "bg-white hover:bg-slate-50/60"
                  : "bg-indigo-50/30 hover:bg-indigo-50/60"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {item.title}
                    </span>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-indigo-100 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {!item.isRead && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkRead(item.id);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 shrink-0"
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
