// src/components/ChatHistory.jsx
import React, { useEffect, useState } from "react";
import { useChat } from "../hooks/useChat";
import MessageCard from "./MessageCard";

const ChatHistory = () => {
  const { message } = useChat();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (message?.text) {
        setHistory((prev) => [...prev.slice(-1), { ...message, id: Date.now() }]);
    }
  }, [message]);

  return (
    <div style={styles.container}>
      {history.map((msg) => (
        <MessageCard
          key={msg.id}
          text={msg.text}
          facialExpression={msg.facialExpression}
          animation={msg.animation}
          audioDuration={4}
        />
      ))}
    </div>
  );
};

const styles = {
  container: {
    position: "fixed",
    top: "1rem",
    right: "1rem",
    display: "flex",
    flexDirection: "column-reverse", // Newest on top
    gap: "1rem",
    zIndex: 999,
  },
};

export default ChatHistory;
