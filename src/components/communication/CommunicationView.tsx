import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/modules/auth/auth.store";
import { useSocket } from "@/context/useSocket";
import {
  useChatUsersQuery,
  useChatConversationsQuery,
  useDirectMessagesQuery,
  useGroupMessagesQuery,
  useGroupDetailsQuery,
  chatQueryKeys,
} from "@/modules/team-chat/team-chat.hooks";
import {
  useCustomerDirectConversationsQuery,
  useCustomerDirectMessagesQuery,
  useSendCustomerDirectMessageMutation,
  customerDirectChatQueryKeys,
} from "@/modules/customer-direct-chat/customer-direct-chat.hooks";
import type { CustomerDirectMessage } from "@/modules/customer-direct-chat/customer-direct-chat.types";
import { useCustomerDetailQuery } from "@/modules/customers/customers.hooks";
import { uploadFileToS3 } from "@/lib/upload";
import type {
  TeamMessage,
  TeamAttachment,
  TeamTypingEvent,
  TeamMessagesReadEvent,
} from "@/types/communication";

import { type ActiveChatState } from "./types";
import { ChatSidebar } from "./ChatSidebar";
import { ChatHeader } from "./ChatHeader";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInputBar } from "./ChatInputBar";
import { ChatDrawer } from "./ChatDrawer";
import { ChatEmptyState } from "./ChatEmptyState";
import { NewChatModal } from "./NewChatModal";
import { NewGroupModal } from "./NewGroupModal";

export const CommunicationView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlCustomerId = searchParams.get("customerId");

  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const {
    socket,
    isConnected,
    joinChannel,
    leaveChannel,
    sendTypingStart,
    sendTypingStop,
    sendMessage,
    joinCustomerDirect,
    leaveCustomerDirect,
  } = useSocket();

  // Top level tabs: Customers vs Team
  const [activeMainTab, setActiveMainTab] = useState<"Customers" | "Team">(
    urlCustomerId ? "Customers" : "Customers"
  );
  // Sub-tab under Team: Departments vs Direct
  const [teamTab, setTeamTab] = useState<"Departments" | "Direct">("Direct");

  const [activeChat, setActiveChat] = useState<ActiveChatState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"Members" | "Files">("Members");
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);

  // File upload state
  const [pendingAttachments, setPendingAttachments] = useState<TeamAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Real-time local message list & typing users map
  const [liveMessages, setLiveMessages] = useState<TeamMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, { isTyping: boolean; name: string }>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Team queries
  const { data: usersData, isLoading: isLoadingUsers } = useChatUsersQuery();
  const { data: conversationsData, isLoading: isLoadingConversations } = useChatConversationsQuery();

  // Customer direct conversations query
  const {
    data: customerConversationsData,
    isLoading: isLoadingCustomerConversations,
  } = useCustomerDirectConversationsQuery();

  // Single customer query for deep-link / direct initiate
  const { data: targetCustomerDetailRes } = useCustomerDetailQuery(urlCustomerId || "");

  // Auto-select chat when customerId is present in URL
  useEffect(() => {
    if (!urlCustomerId) return;

    setActiveMainTab("Customers");
    const existingConv = customerConversationsData?.find(
      (c) => c.customerId === urlCustomerId
    );

    if (existingConv) {
      setActiveChat({
        type: "customer",
        id: urlCustomerId,
        name: existingConv.customerName || "Customer",
        email: existingConv.email,
        phone: existingConv.phone,
        category: "Customer",
        color: "bg-emerald-600",
      });
    } else {
      const cust = targetCustomerDetailRes?.data?.customer;
      const cName = cust
        ? `${cust.firstName || ""} ${cust.lastName || ""}`.trim()
        : "Customer";

      setActiveChat({
        type: "customer",
        id: urlCustomerId,
        name: cName || "Customer",
        email: cust?.email,
        phone: cust?.phone?.number,
        category: "Customer",
        color: "bg-emerald-600",
      });
    }
  }, [urlCustomerId, customerConversationsData, targetCustomerDetailRes]);

  // Active chat state flags
  const isDirectActive = activeChat?.type === "direct" && Boolean(activeChat.id);
  const isGroupActive = activeChat?.type === "group" && Boolean(activeChat.id);
  const isCustomerActive = activeChat?.type === "customer" && Boolean(activeChat.id);

  // Team chat message history queries
  const {
    data: directHistoryData,
    isLoading: isLoadingDirectHistory,
  } = useDirectMessagesQuery(activeChat?.id || "", {
    page: 1,
    limit: 50,
    enabled: isDirectActive,
  });

  const {
    data: groupHistoryData,
    isLoading: isLoadingGroupHistory,
  } = useGroupMessagesQuery(activeChat?.id || "", {
    page: 1,
    limit: 50,
    enabled: isGroupActive,
  });

  const {
    data: groupDetails,
    isLoading: isLoadingGroupDetails,
  } = useGroupDetailsQuery(activeChat?.id || "", isGroupActive);

  // Customer direct chat history query
  const {
    data: customerHistoryData,
    isLoading: isLoadingCustomerHistory,
  } = useCustomerDirectMessagesQuery(activeChat?.id || "", undefined, {
    enabled: isCustomerActive,
  });

  // Customer direct send mutation
  const sendCustomerMessageMutation = useSendCustomerDirectMessageMutation();

  // Merge historical messages with live socket messages
  const displayedMessages = useMemo(() => {
    let history: TeamMessage[] = [];

    if (isDirectActive) {
      history = directHistoryData?.messages || [];
    } else if (isGroupActive) {
      history = groupHistoryData?.messages || [];
    } else if (isCustomerActive && customerHistoryData) {
      history = customerHistoryData.map((m) => ({
        _id: m._id || m.messageId || `cmsg-${m.createdAt}-${Math.random()}`,
        messageId: m.messageId,
        customerId: m.customerId,
        channelType: "customer",
        senderType: m.senderType,
        senderId:
          m.senderId ||
          (m.senderType === "customer" ? m.customerId : currentUser?._id || "staff"),
        senderName:
          m.senderName ||
          (m.senderType === "customer"
            ? activeChat?.name || "Customer"
            : currentUser?.name || "You"),
        content: m.content,
        isReadByCustomer: m.isReadByCustomer,
        isReadByStaff: m.isReadByStaff,
        createdAt: m.createdAt,
        mirroredFrom: m.mirroredFrom,
        leadId: m.leadId,
        channel: m.channel,
      }));
    }

    const map = new Map<string, TeamMessage>();
    history.forEach((m) => map.set(m._id, m));

    liveMessages.forEach((m) => {
      // replace optimistic or append
      const existingTempKey = Array.from(map.keys()).find(
        (k) =>
          k.startsWith("temp-") &&
          map.get(k)?.content === m.content &&
          map.get(k)?.senderId === m.senderId
      );
      if (existingTempKey) {
        map.delete(existingTempKey);
      }
      map.set(m._id, m);
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [
    isDirectActive,
    isGroupActive,
    isCustomerActive,
    directHistoryData,
    groupHistoryData,
    customerHistoryData,
    liveMessages,
    currentUser,
    activeChat,
  ]);

  // Auto scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom("auto");
  }, [activeChat?.id]);

  useEffect(() => {
    scrollToBottom("smooth");
  }, [displayedMessages]);

  // Join / Leave channel lifecycle for Team Chat
  useEffect(() => {
    if (!activeChat || activeChat.type === "customer") return;

    joinChannel(activeChat.type, activeChat.id);

    return () => {
      leaveChannel(activeChat.type, activeChat.id);
    };
  }, [activeChat, joinChannel, leaveChannel]);

  // Join / Leave channel lifecycle for Customer Direct Chat
  useEffect(() => {
    if (!activeChat || activeChat.type !== "customer") return;

    joinCustomerDirect(activeChat.id);

    return () => {
      leaveCustomerDirect(activeChat.id);
    };
  }, [activeChat, joinCustomerDirect, leaveCustomerDirect]);

  // Listen to live socket events for current Team chat
  useEffect(() => {
    if (!socket || !activeChat || activeChat.type === "customer") return;

    // 1. new_team_message
    const handleNewMessage = (msg: TeamMessage) => {
      console.log("[CommunicationView] new_team_message:", msg);

      const isCurrentGroup =
        activeChat.type === "group" &&
        msg.channelType === "group" &&
        msg.groupId === activeChat.id;

      const isCurrentDirect =
        activeChat.type === "direct" &&
        msg.channelType === "direct" &&
        (msg.senderId === activeChat.id ||
          (msg.senderId === currentUser?._id && msg.participants?.includes(activeChat.id)));

      if (isCurrentGroup || isCurrentDirect) {
        setLiveMessages((prev) => {
          const exists = prev.some((m) => m._id === msg._id);
          if (exists) return prev;

          const filtered = prev.filter(
            (m) =>
              !(
                m.isOptimistic &&
                m.content === msg.content &&
                m.senderId === msg.senderId
              )
          );

          return [...filtered, msg];
        });

        if (msg.senderId !== currentUser?._id) {
          queryClient.invalidateQueries({ queryKey: chatQueryKeys.unreadCount() });
          queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
        }
      }
    };

    // 2. team_typing
    const handleTyping = (data: TeamTypingEvent) => {
      if (
        data.channelType === activeChat.type &&
        data.channelId === activeChat.id &&
        data.userId !== currentUser?._id
      ) {
        setTypingUsers((prev) => {
          if (data.isTyping) {
            return { ...prev, [data.name]: { isTyping: true, name: data.name } };
          }
          const next = { ...prev };
          delete next[data.name];
          return next;
        });
      }
    };

    // 3. team_messages_read
    const handleMessagesRead = (data: TeamMessagesReadEvent) => {
      if (
        data.channelType === activeChat.type &&
        data.channelId === activeChat.id
      ) {
        setLiveMessages((prev) =>
          prev.map((msg) => {
            if (!msg.readBy?.includes(data.by)) {
              return { ...msg, readBy: [...(msg.readBy || []), data.by] };
            }
            return msg;
          })
        );
      }
    };

    // 4. team_chat_error
    const handleChatError = (data: { message: string }) => {
      console.error("[CommunicationView] team_chat_error:", data);
      setErrorBanner(data.message || "Failed to deliver message");
    };

    socket.on("new_team_message", handleNewMessage);
    socket.on("team_typing", handleTyping);
    socket.on("team_messages_read", handleMessagesRead);
    socket.on("team_chat_error", handleChatError);

    return () => {
      socket.off("new_team_message", handleNewMessage);
      socket.off("team_typing", handleTyping);
      socket.off("team_messages_read", handleMessagesRead);
      socket.off("team_chat_error", handleChatError);
    };
  }, [socket, activeChat, currentUser, queryClient]);

  // Listen to live socket events for current Customer Direct chat
  useEffect(() => {
    if (!socket || !activeChat || activeChat.type !== "customer") return;

    const handleCustomerDirectMessage = (msg: CustomerDirectMessage) => {
      console.log("[CommunicationView] customer_direct_message:", msg);

      if (msg.customerId === activeChat.id) {
        const converted: TeamMessage = {
          _id: msg._id || msg.messageId || `msg-${Date.now()}`,
          messageId: msg.messageId,
          customerId: msg.customerId,
          channelType: "customer",
          senderType: msg.senderType,
          senderId:
            msg.senderId ||
            (msg.senderType === "customer"
              ? msg.customerId
              : currentUser?._id || "staff"),
          senderName:
            msg.senderName ||
            (msg.senderType === "customer"
              ? activeChat.name
              : currentUser?.name || "You"),
          content: msg.content,
          isReadByCustomer: msg.isReadByCustomer,
          isReadByStaff: msg.isReadByStaff,
          createdAt: msg.createdAt,
        };

        setLiveMessages((prev) => {
          const exists = prev.some(
            (m) =>
              (m.messageId && m.messageId === msg.messageId) ||
              m._id === converted._id
          );
          if (exists) return prev;

          const filtered = prev.filter(
            (m) => !(m.isOptimistic && m.content === msg.content)
          );

          return [...filtered, converted];
        });

        queryClient.invalidateQueries({
          queryKey: customerDirectChatQueryKeys.conversations(),
        });
      }
    };

    socket.on("customer_direct_message", handleCustomerDirectMessage);

    return () => {
      socket.off("customer_direct_message", handleCustomerDirectMessage);
    };
  }, [socket, activeChat, currentUser, queryClient]);

  // Handle typing debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMessageInput(val);

    if (!activeChat || activeChat.type === "customer") return;

    sendTypingStart(activeChat.type, activeChat.id);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStop(activeChat.type, activeChat.id);
    }, 2500);
  };

  // Handle file uploads to presigned S3
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorBanner(null);

    try {
      const uploaded: TeamAttachment[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileUrl = await uploadFileToS3(file, "chat-attachments");

        uploaded.push({
          url: fileUrl,
          name: file.name,
          type: file.type,
          size: file.size,
        });
      }

      setPendingAttachments((prev) => [...prev, ...uploaded]);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to upload file attachment";
      console.error("[CommunicationView] File upload error:", err);
      setErrorBanner(message);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const removePendingAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Send message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeChat) return;

    const trimmed = messageInput.trim();
    if (!trimmed && pendingAttachments.length === 0) return;

    // 1. Customer Direct message send
    if (activeChat.type === "customer") {
      const tempId = `temp-${Date.now()}`;
      let finalContent = trimmed;

      if (pendingAttachments.length > 0) {
        const links = pendingAttachments.map((a) => a.url).join("\n");
        finalContent = trimmed ? `${trimmed}\n\n${links}` : links;
      }

      const optimisticMsg: TeamMessage = {
        _id: tempId,
        channelType: "customer",
        customerId: activeChat.id,
        senderType: "admin",
        senderId: currentUser?._id || "staff",
        senderName: currentUser?.name || "You",
        content: finalContent,
        attachments: [...pendingAttachments],
        createdAt: new Date().toISOString(),
        isOptimistic: true,
        status: "pending",
      };

      setLiveMessages((prev) => [...prev, optimisticMsg]);

      sendCustomerMessageMutation.mutate(
        { customerId: activeChat.id, content: finalContent },
        {
          onError: (err: unknown) => {
            const errObj = err as {
              response?: { data?: { message?: string } };
              message?: string;
            };
            const msg =
              errObj?.response?.data?.message ||
              errObj?.message ||
              "Failed to send message to customer";
            setErrorBanner(msg);
            setLiveMessages((prev) => prev.filter((m) => m._id !== tempId));
          },
        }
      );

      setMessageInput("");
      setPendingAttachments([]);
      return;
    }

    // 2. Team message send
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    sendTypingStop(activeChat.type, activeChat.id);

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: TeamMessage = {
      _id: tempId,
      channelType: activeChat.type,
      groupId: activeChat.type === "group" ? activeChat.id : undefined,
      senderId: currentUser?._id || "me",
      senderName: currentUser?.name || "You",
      senderRole: currentUser?.role,
      content: trimmed,
      attachments: [...pendingAttachments],
      createdAt: new Date().toISOString(),
      isOptimistic: true,
      status: "pending",
    };

    setLiveMessages((prev) => [...prev, optimisticMsg]);

    sendMessage({
      channelType: activeChat.type,
      channelId: activeChat.id,
      content: trimmed,
      attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
    });

    setMessageInput("");
    setPendingAttachments([]);
  };

  // Active typing list string
  const typingText = useMemo(() => {
    const names = Object.keys(typingUsers);
    if (names.length === 0) return null;
    if (names.length === 1) return `${names[0]} is typing...`;
    return `${names.slice(0, 2).join(", ")} and others are typing...`;
  }, [typingUsers]);

  // Extract shared files from messages for the Files drawer
  const sharedFiles = useMemo(() => {
    const files: TeamAttachment[] = [];
    displayedMessages.forEach((msg) => {
      if (msg.attachments && msg.attachments.length > 0) {
        files.push(...msg.attachments);
      }
    });
    return files;
  }, [displayedMessages]);

  return (
    <div className="flex h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 1. Left Contact Sidebar */}
      <ChatSidebar
        currentUser={currentUser}
        isConnected={isConnected}
        activeMainTab={activeMainTab}
        setActiveMainTab={(tab) => {
          setActiveMainTab(tab);
          setSearchQuery("");
        }}
        teamTab={teamTab}
        setTeamTab={setTeamTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeChat={activeChat}
        onSelectChat={(chat) => {
          setActiveChat(chat);
          setLiveMessages([]);
          setTypingUsers({});
          setErrorBanner(null);
          setIsDrawerOpen(false);
        }}
        conversations={conversationsData || []}
        isLoadingConversations={isLoadingConversations}
        customerConversations={customerConversationsData || []}
        isLoadingCustomerConversations={isLoadingCustomerConversations}
        onOpenNewChat={() => setIsNewChatModalOpen(true)}
        onOpenNewGroup={() => setIsNewGroupModalOpen(true)}
      />

      {/* 2. Right Chat Main Area */}
      <div className="flex-1 flex flex-col bg-[#F8FAFC] relative min-w-0">
        {activeChat ? (
          <>
            <ChatHeader
              activeChat={activeChat}
              typingText={activeChat.type === "customer" ? null : typingText}
              errorBanner={errorBanner}
              setErrorBanner={setErrorBanner}
              isDrawerOpen={isDrawerOpen}
              setIsDrawerOpen={setIsDrawerOpen}
            />

            <ChatMessageList
              messages={displayedMessages}
              isLoadingHistory={
                isLoadingDirectHistory ||
                isLoadingGroupHistory ||
                isLoadingCustomerHistory
              }
              currentUserId={currentUser?._id}
              currentUserName={currentUser?.name}
              messagesEndRef={messagesEndRef}
            />

            <ChatInputBar
              chatName={activeChat.name}
              messageInput={messageInput}
              onInputChange={handleInputChange}
              onSendMessage={handleSendMessage}
              pendingAttachments={pendingAttachments}
              onRemoveAttachment={removePendingAttachment}
              onFileSelect={handleFileSelect}
              isUploading={isUploading}
            />
          </>
        ) : (
          <ChatEmptyState />
        )}
      </div>

      {/* 3. Right Sidebar Details Drawer */}
      {activeChat && (
        <ChatDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          activeChat={activeChat}
          drawerTab={drawerTab}
          setDrawerTab={setDrawerTab}
          groupDetails={groupDetails}
          isLoadingGroupDetails={isLoadingGroupDetails}
          sharedFiles={sharedFiles}
        />
      )}

      {/* 4. New Direct Chat Modal (Team Only) */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        users={usersData || []}
        isLoadingUsers={isLoadingUsers}
        onSelectUser={(chat) => {
          setActiveChat(chat);
          setActiveMainTab("Team");
          setTeamTab("Direct");
          setLiveMessages([]);
          setTypingUsers({});
          setErrorBanner(null);
          setIsDrawerOpen(false);
        }}
        currentUserId={currentUser?._id}
      />

      {/* 5. New Department / Group Channel Modal (Team Only) */}
      <NewGroupModal
        isOpen={isNewGroupModalOpen}
        onClose={() => setIsNewGroupModalOpen(false)}
        users={usersData || []}
        isLoadingUsers={isLoadingUsers}
        onGroupCreated={(group) => {
          setActiveChat({
            type: "group",
            id: group._id,
            name: group.name,
            category: "Group",
            membersCount: group.members?.length || 2,
            avatar: group.avatar,
            color: "bg-[#4285F4]",
          });
          setActiveMainTab("Team");
          setTeamTab("Departments");
          setLiveMessages([]);
          setTypingUsers({});
          setErrorBanner(null);
          setIsDrawerOpen(false);
        }}
        currentUserId={currentUser?._id}
      />
    </div>
  );
};

export default CommunicationView;
