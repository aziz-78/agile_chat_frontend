import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";

const CodeBlock = ({
  code,
  language,
  darkMode,
  theme,
  onTypingComplete,
  disableTypingEffect = false,
}) => {
  const [displayedText, setDisplayedText] = useState(disableTypingEffect ? code : "");
  const [isTyping, setIsTyping] = useState(!disableTypingEffect);
  const typingTimerRef = useRef(null);
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
    if (disableTypingEffect) {
      setDisplayedText(code);
      setIsTyping(false);
    } else {
      setDisplayedText("");
      setIsTyping(true);
    }
  }, [code, disableTypingEffect]);

  useEffect(() => {
    if (disableTypingEffect) {
      setDisplayedText(code);
      return;
    }

    let currentIndex = 0;

    if (isTyping) {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }

      typingTimerRef.current = setInterval(() => {
        if (currentIndex < code.length) {
          setDisplayedText(code.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingTimerRef.current);
          setIsTyping(false);
          if (onTypingComplete && !completedRef.current) {
            completedRef.current = true;
            onTypingComplete();
          }
        }
      }, 15);
    }

    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }
    };
  }, [code, isTyping, disableTypingEffect, onTypingComplete]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      //alert("Code copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "code.py";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ position: "relative", p: 2, borderRadius: "6px", overflow: "hidden", backgroundColor: darkMode ? "#1e1e1e" : "#f5f5f5" }}>
      {/* Icons at the top-right corner */}
      <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 1, zIndex: 10 }}>
        <Tooltip title="Copy Code">
          <IconButton size="small" onClick={handleCopy} sx={{ color: darkMode ? "#ffffff" : "#333333" }}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Download Code">
          <IconButton size="small" onClick={handleDownload} sx={{ color: darkMode ? "#ffffff" : "#333333" }}>
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Code Display */}
      <Typography
        component="pre"
        sx={{
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          color: darkMode ? "#d4d4d4" : "#333333",
          fontSize: "0.9rem",
          lineHeight: 1.5,
          m: 0,
          p: 2
        }}
      >
        {displayedText}
      </Typography>
    </Box>
  );
};

export default CodeBlock;
