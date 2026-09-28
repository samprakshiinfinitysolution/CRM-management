import React from 'react';
import { User } from 'lucide-react';

interface RegisterFieldsProps {
  fullName: string;
  onFullNameChange: (val: string) => void;
  //mobile: string;
  //onMobileChange: (val: string) => void;
  //branch: string;
  //onBranchChange: (val: string) => void;
}

export default function RegisterFields({
  fullName,
  onFullNameChange,
  //mobile,
  //onMobileChange,
  //branch,
  //onBranchChange,
}: RegisterFieldsProps) {
  return (
    <div className="flex flex-col gap-3.5">
      {/* Full Name */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
          <span>Official Full Name</span>
          <span className="text-rose-500">*</span>
        </label>
        <div className="relative flex items-center">
          <User className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            required
            type="text"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            placeholder="e.g. Rachel Sterling"
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
          />
        </div>
      </div>

      {/* Official Mobile Number */}
      {/*<div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
          <span className="flex items-center gap-1">
            Official Mobile Number <span className="text-rose-500">*</span>
          </span>
          <span className="text-[11px] text-slate-400">OTP Verified</span>
        </label>
        <div className="flex items-center gap-2">
          <div className="h-10 px-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1">
            <span>🇮🇳 +91</span>
          </div>
          <div className="relative flex-1 flex items-center">
            <input
              required
              type="tel"
              maxLength={10}
              value={mobile}
              onChange={(e) => onMobileChange(e.target.value)}
              placeholder="98765 43210"
              className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
            />
            <Smartphone className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
          </div>
        </div>
      </div>*/}

      {/* Branch */}
      {/*<div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-700">Regional Branch / Zone</label>
        <div className="relative flex items-center">
          <Building className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <select
            value={branch}
            onChange={(e) => onBranchChange(e.target.value)}
            className="w-full h-10 pl-9 pr-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
          >
            <option value="blr-hq">HQ - Bengaluru Central (Tech & Direct Sales)</option>
            <option value="mum-fin">Mumbai Metro West - Corporate Enterprise</option>
            <option value="del-ncr">Delhi NCR - North Distribution Cluster</option>
            <option value="hyd-tel">Hyderabad - Tele-acquisition Unit</option>
          </select>
        </div>
      </div>*/}
    </div>
  );
}
