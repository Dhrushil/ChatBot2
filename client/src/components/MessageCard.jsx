// src/components/MessageCard.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./MessageCard.css";

const MessageCard = ({ text = "", facialExpression = "default", animation = "Idle", audioDuration = 4 }) => {
  const [visibleText, setVisibleText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    if (!text) return;

    const words = text.split(" ");
    setVisibleText("");
    setWordIndex(0);

    const interval = setInterval(() => {
      setWordIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex <= words.length) {
          setVisibleText(words.slice(0, nextIndex).join(" "));
        }
        if (nextIndex >= words.length) clearInterval(interval);
        return nextIndex;
      });
    }, (audioDuration * 1000) / words.length / 1.5); // fast typing

    return () => clearInterval(interval);
  }, [text, audioDuration]);

  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text">{visibleText}</p>
      <div className="meta">
        <span>{facialExpression}</span>
        <span>{animation}</span>
      </div>
    </motion.div>
  );
};

export default MessageCard;
