import React, { useEffect, useState, useRef } from "react";
import { Box, Typography } from "@mui/material";

const CodeBlock = ({
  code,
  language,
  darkMode,
  theme,
  onTypingComplete,
  disableTypingEffect = false
}) => {
  const [displayedText, setDisplayedText] = useState(disableTypingEffect ? code : "");
  const [isTyping, setIsTyping] = useState(!disableTypingEffect);
  const typingTimerRef = useRef(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (disableTypingEffect) {
      setDisplayedText(code);
      return;
    }

    let currentIndex = 0;
    
    if (isTyping) {
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

  // Style for code block based on dark mode
  const codeStyle = {
    fontFamily: "monospace",
    whiteSpace: "pre-wrap",
    backgroundColor: darkMode ? '#1e1e1e' : '#f5f5f5',
    color: darkMode ? '#d4d4d4' : '#333333',
    padding: 2,
    borderRadius: "6px",
    overflowX: "auto",
    fontSize: "0.9rem",
    lineHeight: 1.5
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={codeStyle}>
        <Typography component="pre" sx={{ fontFamily: "inherit", m: 0 }}>
          {displayedText}
        </Typography>
      </Box>
    </Box>
  );
};

export default CodeBlock;