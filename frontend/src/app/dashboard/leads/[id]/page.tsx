'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  User,
  Tag,
  CalendarPlus,
  RefreshCw,
  AlertCircle,
  FileText,
  Activity,
  RotateCcw,
  UserCheck,
  MessageSquare,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetLeadByIdQuery,
  useUpdateLeadStatusMutation,
  useAddLeadNoteMutation,
  useAppSelector,
} from '@/store';
import { LeadStatus, UserRole, type LeadItem, type LeadNoteItem } from '@/types/api.types';
import ScheduleFollowUpModal from '@/components/sales_executive/ScheduleFollowUpModal';
import { RecallLeadModal, ReassignLeadModal } from '@/components/team_leader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExtendedLeadDetail extends Omit<LeadItem, 'notes'> {
  notes?: LeadNoteItem[] | string | null;
  notesList?: LeadNoteItem[];
  followUps?: Array<{
    id: string;
    type: string;
    scheduledAt: string;
    status: string;
  }>;
  activities?: Array<{
    id: string;
    description: string;
    createdAt: string;
  }>;
}

export default function LeadDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAppSelector((state) => state.auth);
  const isTL = user?.role === UserRole.TEAM_LEADER;

  const { data: leadResponse, isLoading, isError, refetch } = useGetLeadByIdQuery(id);
  const lead = leadResponse?.data as ExtendedLeadDetail | undefined;

  const [updateLeadStatus, { isLoading: isUpdatingStatus }] = useUpdateLeadStatusMutation();
  const [addLeadNoteMutation, { isLoading: isAddingNote }] = useAddLeadNoteMutation();

  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [statusNote, setStatusNote] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isRecallModalOpen, setIsRecallModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !lead) return;

    try {
      await addLeadNoteMutation({
        id: lead.id,
        note: newNoteText.trim(),
      }).unwrap();

      toast.success('Note added successfully');
      setNewNoteText('');
      refetch();
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string } };
      toast.error(errorObj?.data?.message || 'Failed to add note');
    }
  };

  const handleStatusChange = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!selectedStatus) return;

    try {
      if (!lead) return;
      await updateLeadStatus({
        id: lead.id,
        status: selectedStatus as LeadStatus,
        note: statusNote.trim() || undefined,
      }).unwrap();

      toast.success(`Lead status updated to ${selectedStatus}`);
      setIsStatusModalOpen(false);
      setStatusNote('');
      refetch();
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string } };
      toast.error(errorObj?.data?.message || 'Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 h-[90dvh] flex flex-col items-center justify-center gap-3  text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="text-xs font-semibold text-slate-600">
          Loading lead record details...
        </span>
      </div>
    );
  }

  if (isError || !lead) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center flex flex-col items-center gap-3">
          <AlertCircle className="w-8 h-8 text-rose-600" />
          <h2 className="text-sm font-bold text-rose-900">Lead Record Unavailable</h2>
          <p className="text-xs text-rose-700 max-w-md">
            This lead may have been deleted, or you may not have sufficient access permissions to view it.
          </p>
          <Link
            href="/dashboard/leads"
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all"
          >
            Return to Lead Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={isTL ? '/dashboard/leads' : '/dashboard/my-leads'}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                {lead.leadCode}
              </span>
              <span className="text-lg font-bold text-slate-900">
                {lead.customerName}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Created on {new Date(lead.createdAt).toLocaleDateString()} · Registered via {lead.leadSource || 'Direct'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {isTL && (
            <button
              type="button"
              onClick={() => setIsReassignModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Reassign</span>
            </button>
          )}

          {isTL && (lead?.assignedTo || lead?.status !== 'NEW') && (
            <button
              type="button"
              onClick={() => setIsRecallModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>Recall to Pool</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setSelectedStatus(lead.status);
              setIsStatusModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Update Status</span>
          </button>

          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-indigo-600" />
            <span>Schedule Follow-up</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left details + Right Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile & Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Customer Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col gap-4">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Customer Contact Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Mobile Phone</span>
                  <a href={`tel:${lead.mobile}`} className="text-xs font-semibold text-indigo-600 hover:underline">
                    {lead.mobile}
                  </a>
                </div>
              </div>

              {lead.alternateMobile && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Alternate Phone</span>
                    <a href={`tel:${lead.alternateMobile}`} className="text-xs font-semibold text-slate-700 hover:underline">
                      {lead.alternateMobile}
                    </a>
                  </div>
                </div>
              )}

              {lead.email && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Email Address</span>
                    <a href={`mailto:${lead.email}`} className="text-xs font-semibold text-indigo-600 hover:underline truncate">
                      {lead.email}
                    </a>
                  </div>
                </div>
              )}

              {lead.companyName && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Building className="w-4 h-4 text-slate-500 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Company</span>
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {lead.companyName}
                    </span>
                  </div>
                </div>
              )}

              {(lead.city || lead.state) && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Location</span>
                    <span className="text-xs font-semibold text-slate-800">
                      {[lead.city, lead.state].filter(Boolean).join(', ')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Deal Requirement Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col gap-4">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Deal Requirements & Offerings</span>
            </h2>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                Detailed Requirement
              </span>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {lead.requirement}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Budget</span>
                <span className="text-sm font-bold text-slate-900">
                  {lead.budget ? `₹${Number(lead.budget).toLocaleString('en-IN')}` : 'Not Specified'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Product / Service</span>
                <span className="text-xs font-bold text-slate-800 truncate block">
                  {lead.productService || 'General Solution'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Priority</span>
                <span className="text-xs font-bold text-indigo-700">
                  {lead.priority}
                </span>
              </div>
            </div>
          </div>

          {/* Follow-up Tasks */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Scheduled Follow-ups</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(true)}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                + Schedule
              </button>
            </div>

            {(!lead?.followUps || lead.followUps.length === 0) ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No follow-ups currently scheduled for this lead.
              </div>
            ) : (
              <div className="space-y-2">
                {lead.followUps.map((fu) => (
                  <div
                    key={fu.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {fu.type[0]}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-800 block">
                          {fu.type} Follow-up
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(fu.scheduledAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        fu.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : fu.status === 'MISSED'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {fu.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes & Team Discussion Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col gap-4">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>Notes & Observations</span>
            </h2>

            {/* Note Composer Form */}
            <form onSubmit={handleAddNote} className="flex flex-col gap-2">
              <div className="relative">
                <textarea
                  rows={3}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Add an internal note or discussion point regarding this lead..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all resize-none"
                  disabled={isAddingNote}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {newNoteText.length > 0 ? `${newNoteText.length} characters` : 'Press submit to log note'}
                </span>
                <button
                  type="submit"
                  disabled={isAddingNote || !newNoteText.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>{isAddingNote ? 'Saving...' : 'Add Note'}</span>
                </button>
              </div>
            </form>

            {/* Notes List */}
            {Array.isArray(lead.notes) && lead.notes.length > 0 ? (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                {lead.notes.map((noteItem) => (
                  <div
                    key={noteItem.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                          {(noteItem.author?.name || 'U')[0].toUpperCase()}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {noteItem.author?.name || 'Team Member'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(noteItem.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap pl-8 leading-relaxed">
                      {noteItem.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-400 border-t border-slate-100">
                No notes logged for this lead yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Status Card & Activity Stream */}
        <div className="flex flex-col gap-6">
          {/* Status & Assignment Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col gap-4">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              Pipeline Stage & Ownership
            </h2>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Current Status</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {lead?.status?.replace(/_/g, ' ') || '—'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Assigned Representative</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800">
                  {lead?.assignedTo ? lead.assignedTo.name : 'Unassigned'}
                </span>
                {isTL && (
                  <button
                    type="button"
                    onClick={() => setIsReassignModalOpen(true)}
                    className="px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                    title="Reassign lead to another representative"
                  >
                    <UserCheck className="w-3 h-3 text-indigo-600" />
                    <span>Reassign</span>
                  </button>
                )}
                {isTL && lead?.assignedTo && (
                  <button
                    type="button"
                    onClick={() => setIsRecallModalOpen(true)}
                    className="px-2 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                    title="Recall lead to unassigned pool"
                  >
                    <RotateCcw className="w-3 h-3 text-rose-600" />
                    <span>Recall</span>
                  </button>
                )}
              </div>
            </div>

            {lead?.assignedAt && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Assigned On</span>
                <span className="text-xs text-slate-600">
                  {new Date(lead.assignedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Activity Timeline Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col gap-4">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Activity History</span>
            </h2>

            {(!lead?.activities || lead.activities.length === 0) ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No activity logs recorded yet.
              </div>
            ) : (
              <div className="relative pl-4 space-y-4 border-l-2 border-slate-100">
                {lead.activities.map((act) => (
                  <div key={act.id} className="relative">
                    <div className="absolute -left-5.25 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-800">
                        {act.description}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(act.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleStatusChange}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl flex flex-col gap-4"
          >
            <h3 className="text-base font-bold text-slate-900">
              Update Lead Pipeline Status
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Status
              </label>
              <Select
                value={selectedStatus}
                onValueChange={(val) => setSelectedStatus(val || 'NEW')}
              >
                <SelectTrigger className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all">
                  <SelectValue placeholder="Select target status" />
                </SelectTrigger>
                <SelectContent className="border border-slate-200 bg-white shadow-md max-h-60">
                  <SelectItem value="NEW" className="text-xs cursor-pointer">
                    NEW
                  </SelectItem>
                  <SelectItem value="ASSIGNED" className="text-xs cursor-pointer">
                    ASSIGNED
                  </SelectItem>
                  <SelectItem value="CONTACTED" className="text-xs cursor-pointer">
                    CONTACTED
                  </SelectItem>
                  <SelectItem value="INTERESTED" className="text-xs cursor-pointer">
                    INTERESTED
                  </SelectItem>
                  <SelectItem value="FOLLOW_UP" className="text-xs cursor-pointer">
                    FOLLOW_UP
                  </SelectItem>
                  <SelectItem value="QUALIFIED" className="text-xs cursor-pointer">
                    QUALIFIED
                  </SelectItem>
                  <SelectItem value="PROPOSAL_QUOTATION" className="text-xs cursor-pointer">
                    PROPOSAL_QUOTATION
                  </SelectItem>
                  <SelectItem value="NEGOTIATION" className="text-xs cursor-pointer">
                    NEGOTIATION
                  </SelectItem>
                  <SelectItem value="WON_SOLD" className="text-xs cursor-pointer">
                    WON_SOLD
                  </SelectItem>
                  <SelectItem value="LOST" className="text-xs cursor-pointer">
                    LOST
                  </SelectItem>
                  <SelectItem value="NOT_INTERESTED" className="text-xs cursor-pointer">
                    NOT_INTERESTED
                  </SelectItem>
                  <SelectItem value="NO_RESPONSE" className="text-xs cursor-pointer">
                    NO_RESPONSE
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason / Progress Note (Optional)
              </label>
              <textarea
                rows={3}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Log why this lead moved to the new stage..."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdatingStatus}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold disabled:opacity-50"
              >
                {isUpdatingStatus ? 'Saving...' : 'Update Status'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Schedule Follow-up Modal */}
      {isScheduleModalOpen && (
        <ScheduleFollowUpModal
          leadId={lead.id}
          leadCode={lead.leadCode}
          customerName={lead.customerName}
          open={isScheduleModalOpen}
          onClose={() => {
            setIsScheduleModalOpen(false);
            refetch();
          }}
        />
      )}

      {/* Recall Lead to Pool Modal */}
      {isRecallModalOpen && (
        <RecallLeadModal
          open={isRecallModalOpen}
          onClose={() => setIsRecallModalOpen(false)}
          leadIds={[lead.id]}
          leadCodes={[lead.leadCode]}
          assignedExecutiveName={lead.assignedTo?.name}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

      {/* Reassign Lead Modal */}
      {isReassignModalOpen && (
        <ReassignLeadModal
          open={isReassignModalOpen}
          onClose={() => setIsReassignModalOpen(false)}
          leadIds={[lead.id]}
          leadCodes={[lead.leadCode]}
          currentAssigneeId={lead.assignedTo?.id || lead.assignedToUserId}
          currentAssigneeName={lead.assignedTo?.name}
          onSuccess={() => {
            refetch();
          }}
        />
      )}
    </div>
  );
}
