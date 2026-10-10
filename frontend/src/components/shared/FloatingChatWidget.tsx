"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  useGetConversationsQuery,
  useGetUsersQuery,
  useGetMessagesQuery,
  useCreateDirectConversationMutation,
  useSendMessageMutation,
  useMarkConversationAsReadMutation,
} from "@/store/api/userApi";
import { UserRole } from "@/types/api.types";
import { useAppSelector } from "@/store";
import { useDebounce } from "@/lib/useDebounce";
import { useSocket } from "@/components/providers/SocketProvider";
import { usePathname } from "next/navigation";
import {
  ChatHeader,
  ChatContactList,
  ChatMessagesView,
  ChatInputBar,
  ChatTriggerButton,
  type ChatContact,
  type ChatMessage,
  type LatestMessageInfo,
  type TabType,
} from "@/components/chat";

export function FloatingChatWidget() {
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);
  const { socket } = useSocket();

  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [unreadContactIds, setUnreadContactIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("employees");
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [input, setInput] = useState("");

  // Automatically close message box when any route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Automatically close message box when navigation menus or sidebars are opened
  useEffect(() => {
    const handleClose = () => setIsOpen(false);

    window.addEventListener("crm:menu-open", handleClose);
    window.addEventListener("crm:close-chat", handleClose);

    // Also close if clicking any hamburger button, sidebar toggle, or dropdown menu trigger
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isMenuToggle = target.closest(
        'button[aria-label*="navigation" i], button[aria-label*="sidebar" i], button[aria-label*="menu" i], [data-slot="dropdown-menu-trigger"], [data-menu-toggle]'
      );
      if (isMenuToggle) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleGlobalClick, { capture: true });

    return () => {
      window.removeEventListener("crm:menu-open", handleClose);
      window.removeEventListener("crm:close-chat", handleClose);
      document.removeEventListener("click", handleGlobalClick, { capture: true });
    };
  }, []);

  const [createDirectConversation] = useCreateDirectConversationMutation();
  const [sendMessageMutation] = useSendMessageMutation();
  const [markConversationAsRead] = useMarkConversationAsReadMutation();

  const handleMarkAsRead = (convId?: string | null) => {
    if (!convId) return;
    markConversationAsRead({ conversationId: convId })
      .unwrap()
      .catch((err) => {
        console.debug("Failed to mark conversation as read:", err);
      });
  };

  const handleSelectContact = async (contact: ChatContact) => {
    setSelectedContact(contact);
    setUnreadContactIds((prev) => {
      const filtered = prev.filter((id) => id !== contact.id);
      if (filtered.length === 0) setHasNewMessage(false);
      return filtered;
    });

    if (contact.conversationId) {
      setActiveConversationId(contact.conversationId);
      handleMarkAsRead(contact.conversationId);
    }
    try {
      const res = await createDirectConversation({ toUserId: contact.id }).unwrap();
      if (res.data?.id) {
        setActiveConversationId(res.data.id);
        handleMarkAsRead(res.data.id);
      }
    } catch (err) {
      console.error("Failed to initialize direct conversation:", err);
    }
  };

  const handleToggleOpen = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next && selectedContact) {
        setUnreadContactIds((prevUnread) => {
          const filtered = prevUnread.filter((id) => id !== selectedContact.id);
          if (filtered.length === 0) setHasNewMessage(false);
          return filtered;
        });
        const currentConv = activeConversationId || selectedContact.conversationId;
        if (currentConv) {
          handleMarkAsRead(currentConv);
        }
      }
      return next;
    });
  };

  const debounceValue = useDebounce(searchQuery, 500);

  const params = {
    search: debounceValue || undefined,
    status: "active",
    page: 1,
    limit: 50,
  };

  const { data: searchedUsersRes } = useGetUsersQuery(params, {
    skip: !isOpen,
  });

  const { data: conversationsRes } = useGetConversationsQuery(undefined, {
    skip: !isOpen,
  });

  // Derive chat contacts from conversations and directory search
  const allContacts: ChatContact[] = useMemo(() => {
    const contactMap = new Map<string, ChatContact>();

    // 1. Existing conversations
    if (conversationsRes?.data && conversationsRes.data.length > 0) {
      for (const conversation of conversationsRes.data) {
        const otherParticipant =
          conversation.participants?.find((p) => p.userId !== user?.id) ??
          conversation.participants?.[0];
        const profile = otherParticipant?.user;
        if (profile && profile.id !== user?.id) {
          contactMap.set(profile.id, {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role || "SALES_EXECUTIVE",
            isActive: profile.isActive ?? true,
            conversationId: conversation.id,
          });
        }
      }
    }

    // 2. Direct search results
    if (searchedUsersRes?.data && searchedUsersRes.data.length > 0) {
      for (const u of searchedUsersRes.data) {
        if (u.id !== user?.id && !contactMap.has(u.id)) {
          contactMap.set(u.id, {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role || "SALES_EXECUTIVE",
            isActive: u.isActive ?? true,
          });
        }
      }
    }

    return Array.from(contactMap.values());
  }, [conversationsRes, searchedUsersRes, user?.id]);

  // Filter employees and admin/TL separately
  const employeesList = useMemo(() => {
    return allContacts.filter(
      (c) =>
        c.role === UserRole.SALES_EXECUTIVE ||
        c.role === "SALES_EXECUTIVE" ||
        !c.role?.includes("ADMIN"),
    );
  }, [allContacts]);

  const adminTlList = useMemo(() => {
    return allContacts.filter(
      (c) =>
        c.role === UserRole.ADMIN ||
        c.role === UserRole.TEAM_LEADER ||
        c.role === "ADMIN" ||
        c.role === "TEAM_LEADER",
    );
  }, [allContacts]);

  const activeContactList = activeTab === "employees" ? employeesList : adminTlList;

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return activeContactList;
    const q = searchQuery.toLowerCase();
    return activeContactList.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q),
    );
  }, [activeContactList, searchQuery]);

  // Synchronize unread badge indicators from server conversation data
  useEffect(() => {
    if (!conversationsRes?.data || !user?.id) return;

    const unreadIds: string[] = [];
    for (const conv of conversationsRes.data) {
      const myParticipant = conv.participants?.find((p) => p.userId === user.id);
      const otherParticipant =
        conv.participants?.find((p) => p.userId !== user.id) ?? conv.participants?.[0];
      const otherUserId = otherParticipant?.user?.id || otherParticipant?.userId;
      if (!otherUserId || otherUserId === user.id) continue;

      const latestMsg = conv.messages?.[0];
      if (latestMsg && latestMsg.senderId !== user.id) {
        const lastRead = myParticipant?.lastReadAt
          ? new Date(myParticipant.lastReadAt).getTime()
          : 0;
        const msgTime = new Date(latestMsg.createdAt).getTime();
        if (msgTime > lastRead && selectedContact?.id !== otherUserId) {
          unreadIds.push(otherUserId);
        }
      }
    }

    if (unreadIds.length > 0) {
      setUnreadContactIds((prev) => Array.from(new Set([...prev, ...unreadIds])));
      setHasNewMessage(true);
    }
  }, [conversationsRes?.data, user?.id, selectedContact?.id]);

  // Messages state grouped by contact ID
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const targetConvId = activeConversationId || selectedContact?.conversationId;
  const { data: messagesRes, isLoading: isLoadingMessages } = useGetMessagesQuery(
    { conversationId: targetConvId! },
    { skip: !targetConvId || !selectedContact },
  );

  // Sync loaded messages from backend database for the active contact
  useEffect(() => {
    if (selectedContact && messagesRes?.data) {
      const contactId = selectedContact.id;
      const messageList = Array.isArray(messagesRes.data)
        ? messagesRes.data
        : Array.isArray((messagesRes.data as any)?.messages)
          ? (messagesRes.data as any).messages
          : [];

      const serverMessages: ChatMessage[] = messageList.map((m: any) => ({
        id: m.id,
        sender: m.senderId === user?.id ? "user" : "other",
        text: m.content,
        timestamp: new Date(m.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        rawCreatedAt: m.createdAt,
      }));

      setConversations((prev) => ({
        ...prev,
        [contactId]: serverMessages,
      }));
    }
  }, [messagesRes, selectedContact?.id, user?.id]);

  // Mark conversation as read when active in view
  useEffect(() => {
    if (isOpen && selectedContact && targetConvId) {
      handleMarkAsRead(targetConvId);
    }
  }, [isOpen, selectedContact?.id, targetConvId, messagesRes?.data]);

  // Listen for real-time incoming messages via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (msg: {
      id?: string;
      conversationId?: string;
      senderId?: string;
      content: string;
      createdAt?: string | Date;
      sender?: { id: string; name: string };
    }) => {
      if (!msg || !msg.senderId || msg.senderId === user?.id) return;

      const senderId = msg.senderId;

      setConversations((prev) => {
        const contactMsgs = prev[senderId] || [];
        if (contactMsgs.some((m) => m.id === msg.id)) {
          return prev;
        }
        return {
          ...prev,
          [senderId]: [
            ...contactMsgs,
            {
              id: msg.id || Date.now().toString(),
              sender: "other",
              text: msg.content,
              timestamp: msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
              rawCreatedAt: msg.createdAt || Date.now(),
            },
          ],
        };
      });

      // Show pulse notification indicator if widget is closed or viewing a different contact
      if (!isOpen || selectedContact?.id !== senderId) {
        setHasNewMessage(true);
        setUnreadContactIds((prev) =>
          prev.includes(senderId) ? prev : [...prev, senderId],
        );
      } else {
        // Chat is open with this contact: mark conversation as read on the backend
        const activeId = msg.conversationId || targetConvId;
        if (activeId) {
          handleMarkAsRead(activeId);
        }
      }
    };

    socket.on("message", handleIncomingMessage);
    socket.on("message:new", handleIncomingMessage);

    return () => {
      socket.off("message", handleIncomingMessage);
      socket.off("message:new", handleIncomingMessage);
    };
  }, [socket, user?.id, isOpen, selectedContact, targetConvId]);

  // Helper to extract the latest message for any contact
  const getContactLatestMessage = (contact: ChatContact): LatestMessageInfo => {
    // 1. Check local state (messages sent or received in this session)
    const localMsgs = conversations[contact.id];
    let localLatest: LatestMessageInfo | null = null;
    if (localMsgs && localMsgs.length > 0) {
      const last = localMsgs[localMsgs.length - 1];
      localLatest = {
        text: last.text,
        timestamp: last.timestamp,
        timeMs: last.rawCreatedAt ? new Date(last.rawCreatedAt).getTime() : Date.now(),
      };
    }

    // 2. Check conversation history from server
    let serverLatest: LatestMessageInfo | null = null;
    if (conversationsRes?.data) {
      const conv = conversationsRes.data.find(
        (c) =>
          c.id === contact.conversationId ||
          c.participants?.some((p) => p.userId === contact.id),
      );
      if (conv && conv.messages && conv.messages.length > 0) {
        const msg = conv.messages[0];
        const date = new Date(msg.createdAt);
        serverLatest = {
          text: msg.content,
          timestamp: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          timeMs: date.getTime(),
        };
      }
    }

    if (localLatest && serverLatest) {
      return localLatest.timeMs >= serverLatest.timeMs ? localLatest : serverLatest;
    }
    return localLatest || serverLatest || { text: "", timestamp: "", timeMs: 0 };
  };

  // Sort contacts by latest message timestamp descending
  const sortedContacts = useMemo(() => {
    return [...filteredContacts].sort((a, b) => {
      const msgA = getContactLatestMessage(a);
      const msgB = getContactLatestMessage(b);

      if (msgA.timeMs !== msgB.timeMs) {
        return msgB.timeMs - msgA.timeMs;
      }

      if (a.isActive !== b.isActive) {
        return a.isActive ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [filteredContacts, conversations, conversationsRes]);

  const currentMessages = useMemo(() => {
    if (!selectedContact) return [];
    return conversations[selectedContact.id] || [];
  }, [selectedContact, conversations]);

  // Smoothly scroll to bottom on message updates
  useEffect(() => {
    if (selectedContact) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages, selectedContact]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedContact) return;

    const contactId = selectedContact.id;
    const textToSend = input.trim();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      rawCreatedAt: Date.now(),
    };

    setConversations((prev) => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), userMsg],
    }));
    setInput("");

    let targetConv = activeConversationId || selectedContact.conversationId;
    if (!targetConv) {
      try {
        const res = await createDirectConversation({ toUserId: contactId }).unwrap();
        if (res.data?.id) {
          targetConv = res.data.id;
          setActiveConversationId(res.data.id);
        }
      } catch (err) {
        console.error("Failed to initialize direct conversation before sending:", err);
      }
    }

    if (targetConv) {
      sendMessageMutation({
        conversationId: targetConv,
        content: textToSend,
      }).catch((err) => {
        console.error("Failed to send message via API:", err);
      });
    }
  };

  // Only render the widget for authenticated workspace users
  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Modal / Popup */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-130 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all transform animate-in fade-in slide-in-from-bottom-4 duration-200 no-scrollbar">
          <ChatHeader
            selectedContact={selectedContact}
            onBack={() => {
              setSelectedContact(null);
              setActiveConversationId(null);
            }}
            onClose={() => setIsOpen(false)}
          />

          {!selectedContact ? (
            <ChatContactList
              activeTab={activeTab}
              onTabChange={setActiveTab}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              employeesCount={employeesList.length}
              adminTlCount={adminTlList.length}
              contacts={sortedContacts}
              unreadContactIds={unreadContactIds}
              getContactLatestMessage={getContactLatestMessage}
              onSelectContact={handleSelectContact}
            />
          ) : (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/40 dark:bg-slate-950/30 no-scrollbar">
              <ChatMessagesView
                isLoading={isLoadingMessages}
                messages={currentMessages}
                selectedContact={selectedContact}
                messagesEndRef={messagesEndRef}
              />
              <ChatInputBar
                input={input}
                contactName={selectedContact.name}
                onInputChange={setInput}
                onSubmit={handleSendMessage}
              />
            </div>
          )}
        </div>
      )}

      {/* Floating Action Trigger Icon */}
      <ChatTriggerButton
        isOpen={isOpen}
        hasNewMessage={hasNewMessage}
        onToggle={handleToggleOpen}
      />
    </div>
  );
}
