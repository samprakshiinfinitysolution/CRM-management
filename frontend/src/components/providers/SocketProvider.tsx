"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { toast } from "sonner";
import { useAppSelector, useAppDispatch } from "@/store";
import { getSocket, disconnectSocket, WS_EVENTS } from "@/lib/socket";
import { crmApi } from "@/store/api/baseApi";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);

  const { token, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!token && !user) {
      disconnectSocket();
      return;
    }

    const socket = getSocket(token);

    const onConnect = () => {
      setIsConnected(true);
      console.log("🟢 Connected to CRM WebSocket server");
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log("🔴 Disconnected from CRM WebSocket server");
    };

    const onNewNotification = (data: { title?: string; message?: string }) => {
      toast.info(data.title || "New Notification", {
        description: data.message,
      });
      // Invalidate notifications cache to auto-refresh UI
      dispatch(crmApi.util.invalidateTags(["Notifications"]));
    };

    const onLeadAssigned = (data: { count?: number; message?: string }) => {
      toast.success(data.message || `${data.count || 1} new lead(s) assigned to you!`);
      dispatch(
        crmApi.util.invalidateTags([
          "Leads",
          "Lead",
          "Distribution",
          "Workload",
          "Notifications",
        ]),
      );
    };

    const onLeadStatusChanged = () => {
      dispatch(
        crmApi.util.invalidateTags([
          "Leads",
          "Lead",
          "Distribution",
          "Workload",
        ]),
      );
    };

    const onFollowUpDue = (data: { title?: string; message?: string }) => {
      toast.warning(data.title || "Follow-up Due", {
        description: data.message,
      });
      dispatch(crmApi.util.invalidateTags(["Notifications"]));
    };

    const onDashboardUpdate = () => {
      dispatch(
        crmApi.util.invalidateTags([
          "Leads",
          "Workload",
          "Distribution",
          "Imports",
          "Dashboard",
          "Metrics",
        ]),
      );
    };

    socket.on(WS_EVENTS.CONNECT, onConnect);
    socket.on(WS_EVENTS.DISCONNECT, onDisconnect);
    socket.on(WS_EVENTS.NOTIFICATION_NEW, onNewNotification);
    socket.on(WS_EVENTS.LEAD_ASSIGNED, onLeadAssigned);
    socket.on(WS_EVENTS.LEAD_STATUS_CHANGED, onLeadStatusChanged);
    socket.on(WS_EVENTS.FOLLOWUP_DUE, onFollowUpDue);
    socket.on(WS_EVENTS.DASHBOARD_METRICS_UPDATE, onDashboardUpdate);

    return () => {
      socket.off(WS_EVENTS.CONNECT, onConnect);
      socket.off(WS_EVENTS.DISCONNECT, onDisconnect);
      socket.off(WS_EVENTS.NOTIFICATION_NEW, onNewNotification);
      socket.off(WS_EVENTS.LEAD_ASSIGNED, onLeadAssigned);
      socket.off(WS_EVENTS.LEAD_STATUS_CHANGED, onLeadStatusChanged);
      socket.off(WS_EVENTS.FOLLOWUP_DUE, onFollowUpDue);
      socket.off(WS_EVENTS.DASHBOARD_METRICS_UPDATE, onDashboardUpdate);
    };
  }, [token, user, dispatch]);

  const socketInstance = token && user ? getSocket(token) : null;

  return (
    <SocketContext.Provider value={{ socket: socketInstance, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
