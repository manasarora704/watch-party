import { useEffect, useState } from "react";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import type { StreamChat as StreamChatType } from "stream-chat";
import "stream-chat-react/css/v2/index.css";
import type { ChatMessage } from "@/types/watchio";

interface StreamChatProps {
  roomId: string;
  username: string;
  messages: ChatMessage[];
  onSendMessage: (text: string, emoji?: string) => void;
  syncStatus: "synced" | "syncing" | "offline";
}

export function StreamChatProvider({
  roomId,
  username,
  messages,
  onSendMessage,
  syncStatus,
}: StreamChatProps) {
  const [client, setClient] = useState<StreamChatType | null>(null);

  useEffect(() => {
    // Initialize Stream Chat client (anonymous for local dev)
    // In production, use a token generated from your backend
    const initChat = async () => {
      try {
        // Using a mock/demo token for local development
        // Replace with actual token generation in production
        const chatClient = new (await import("stream-chat")).StreamChat(
          "rv1fk7rbqpz9" // Demo API key
        );

        await chatClient.connectUser(
          {
            id: username.toLowerCase().replace(/\s+/g, "_"),
            name: username,
            image: `https://getstream.io/random_png/?id=${username}&size=200`,
          },
          chatClient.devToken(username.toLowerCase().replace(/\s+/g, "_"))
        );

        const channel = chatClient.channel("messaging", `watchio_${roomId}`, {
          name: `Watchio Room ${roomId}`,
          members: [username.toLowerCase().replace(/\s+/g, "_")],
        });

        await channel.create();
        setClient(chatClient);
      } catch (error) {
        console.error("Stream Chat init error:", error);
      }
    };

    if (syncStatus !== "offline") {
      void initChat();
    }

    return () => {
      client?.disconnectUser().catch(() => {});
    };
  }, [roomId, username, syncStatus, client]);

  if (!client) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-muted-foreground">Initializing chat...</div>
      </div>
    );
  }

  return (
    <Chat client={client} theme="str-chat__theme-dark">
      <Channel
        channel={client.channel("messaging", `watchio_${roomId}`)}
        emojiData={[]}
      >
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
        <Thread />
      </Channel>
    </Chat>
  );
}
