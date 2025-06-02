// src/components/ChatView.jsx
import React from "react";
import { useChat } from "../hooks/useChat";
import MessageCard from "./MessageCard";

const ChatView = () => {
  const { message, messages = [] } = useChat(); // 👈 Default empty array to prevent crash

  const safeMessages = messages.length
    ? messages
    : message
    ? [message]
    : [];

  return (
    <div style={{ padding: "1rem", display: "flex", flexDirection: "column" }}>
      {safeMessages.map((msg, i) => (
        <MessageCard
          key={i}
          text={msg.text}
          facialExpression={msg.facialExpression}
          animation={msg.animation}
        />
      ))}
    </div>
  );
};

export default ChatView;
