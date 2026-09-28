'use client';

import React from 'react';
import { LayoutDashboard, GitFork, Upload, BarChart3 } from 'lucide-react';
import { useAppDispatch, useAppSelector, setActiveTab } from '@/store';
import { toast } from 'sonner';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export default function TLBottomNav() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.ui.activeTab);

  const tabs: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'distribute', label: 'Distribute', icon: <GitFork className="w-5 h-5" /> },
    { id: 'intake', label: 'Intake', icon: <Upload className="w-5 h-5" /> },
    { id: 'audit', label: 'Audit', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  const handleTabClick = (tabId: string) => {
    dispatch(setActiveTab(tabId));
    toast.info(`Switched to ${tabId.charAt(0).toUpperCase() + tabId.slice(1)} view`);
  };

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-white/95 backdrop-blur-xl border-t border-crm-subtle shadow-lg pb-safe">
      <div className="max-w-5xl mx-auto h-16 px-4 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[64px] h-12 gap-1 transition-colors active:scale-95 ${
                isActive
                  ? 'text-crm-brand font-bold'
                  : 'text-crm-muted hover:text-crm-secondary font-medium'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
