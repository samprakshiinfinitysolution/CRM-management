import React from "react";
import { Sparkles } from "lucide-react";

interface DemoCredentialsPillsProps {
  onFillCredentials: (role: "tl" | "exec") => void;
}

export default function DemoCredentialsPills({
  onFillCredentials,
}: DemoCredentialsPillsProps) {
  return (
    <div className="flex flex-col gap-1.5 pb-3 border-b border-crm-subtle">
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 text-(--crm-brand-primary)" />
        <span className="text-[10px] font-bold text-crm-muted uppercase tracking-wider">
          Quick Pre-Fill Sandbox Persona
        </span>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => onFillCredentials("tl")}
          className="whitespace-nowrap px-2.5 py-1.5 rounded-lg bg-crm-subtle hover:bg-crm-muted text-crm-primary border border-crm-subtle text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
          <span>TL: teamleader@leadflow.io</span>
        </button>
        <button
          type="button"
          onClick={() => onFillCredentials("exec")}
          className="whitespace-nowrap px-2.5 py-1.5 rounded-lg bg-crm-subtle hover:bg-crm-muted text-crm-primary border border-crm-subtle text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
        >
          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
          <span>Rep: alex.sales@leadflow.io</span>
        </button>
      </div>
    </div>
  );
}
