"use client";

import React, { useState } from "react";
import { X, CalendarClock, Phone, Users, Mail, MessageSquare, Clock } from "lucide-react";
import { useRescheduleFollowUpMutation } from "@/store/api/followUpApi";
import { toast } from "sonner";
import type { FollowUpType } from "@/types/api.types";
import { getApiErrorMessage } from "@/lib/errorHandler";

interface RescheduleFollowUpModalProps {
  followUp: {
    id: string;
    type: FollowUpType;
    scheduledAt: string;
    lead?: {
      id: string;
      leadCode: string;
      customerName: string;
    } | null;
  } | null;
  open: boolean;
  onClose: () => void;
}

const FOLLOW_UP_TYPES: { value: FollowUpType; label: string; icon: React.ReactNode }[] = [
  { value: "Call", label: "Phone Call", icon: <Phone className="w-4 h-4" /> },
  { value: "Meeting", label: "Meeting", icon: <Users className="w-4 h-4" /> },
  { value: "Email", label: "Email", icon: <Mail className="w-4 h-4" /> },
  { value: "WhatsApp", label: "WhatsApp", icon: <MessageSquare className="w-4 h-4" /> },
];

interface InnerFormProps {
  followUp: NonNullable<RescheduleFollowUpModalProps["followUp"]>;
  onClose: () => void;
}

function RescheduleFollowUpForm({ followUp, onClose }: InnerFormProps) {
  const [newType, setNewType] = useState<FollowUpType>(followUp.type || "Call");
  const [newScheduledAt, setNewScheduledAt] = useState<string>(() =>
    followUp.scheduledAt ? new Date(followUp.scheduledAt).toISOString().slice(0, 16) : ""
  );
  const [reason, setReason] = useState("");

  const [rescheduleFollowUp, { isLoading }] = useRescheduleFollowUpMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduledAt) {
      toast.error("Please pick a new date and time.");
      return;
    }

    const scheduledDate = new Date(newScheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      toast.error("Invalid scheduled date.");
      return;
    }

    try {
      await rescheduleFollowUp({
        id: followUp.id,
        newScheduledAt: scheduledDate.toISOString(),
        newType,
        reason: reason.trim() || undefined,
      }).unwrap();

      toast.success("Follow-up successfully rescheduled!");
      onClose();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to reschedule follow-up."));
    }
  };

  return (
    <div className="relative bg-white border border-crm-subtle rounded-2xl shadow-2xl w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-crm-subtle">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shadow-2xs">
            <CalendarClock className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-crm-primary">Reschedule Follow-Up</h2>
            <p className="text-[11px] text-crm-muted">
              {followUp.lead?.leadCode} · {followUp.lead?.customerName}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-crm-muted hover:text-crm-primary hover:bg-crm-muted transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
        {/* Interaction Type */}
        <div>
          <label className="block text-xs font-semibold text-crm-secondary mb-2">
            Interaction Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FOLLOW_UP_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setNewType(t.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  newType === t.value
                    ? "bg-amber-50 border-amber-300 text-amber-800 shadow-2xs font-semibold"
                    : "bg-white border-crm-subtle text-crm-secondary hover:bg-crm-subtle"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* New Date & Time */}
        <div>
          <label className="block text-xs font-semibold text-crm-secondary mb-2">
            <Clock className="w-3.5 h-3.5 inline mr-1.5 opacity-70" />
            New Date & Time
          </label>
          <input
            type="datetime-local"
            value={newScheduledAt}
            onChange={(e) => setNewScheduledAt(e.target.value)}
            required
            className="w-full bg-white border border-crm-subtle rounded-xl px-3 py-2.5 text-sm text-crm-primary focus:outline-none focus:border-amber-600 transition-colors"
          />
        </div>

        {/* Reason */}
        <div>
          <label className="block text-xs font-semibold text-crm-secondary mb-2">
            Reason for Rescheduling <span className="text-crm-muted font-normal">(optional)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Customer requested a callback tomorrow afternoon"
            rows={2}
            maxLength={500}
            className="w-full bg-white border border-crm-subtle rounded-xl px-3 py-2 text-xs text-crm-primary placeholder:text-crm-muted focus:outline-none focus:border-amber-600 transition-colors resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-crm-subtle border border-crm-subtle text-sm text-crm-secondary hover:bg-crm-muted transition-colors font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors cursor-pointer shadow-xs"
          >
            {isLoading ? "Updating..." : "Confirm Reschedule"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function RescheduleFollowUpModal({
  followUp,
  open,
  onClose,
}: RescheduleFollowUpModalProps) {
  if (!open || !followUp) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <RescheduleFollowUpForm
        key={`${followUp.id}-${followUp.scheduledAt}`}
        followUp={followUp}
        onClose={onClose}
      />
    </div>
  );
}
