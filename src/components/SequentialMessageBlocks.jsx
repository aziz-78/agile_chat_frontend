import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import  CodeBlock  from "./CodeBlock"; 

const SequentialMessageBlocks = ({ messages, darkMode, theme }) => {
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const prevMessagesRef = useRef([]);
  const isTypingRef = useRef([]);

  useEffect(() => {
    // Check if messages have changed
    if (JSON.stringify(messages) !== JSON.stringify(prevMessagesRef.current)) {
      console.log("Messages changed:", messages);
      prevMessagesRef.current = [...messages]; // Make a copy of messages
      
      // Reset typing status for all messages
      if (messages.length === 0) {
        isTypingRef.current = [];
        setVisibleIndex(0);
        setDisplayedMessages([]);
        return;
      }
      
      // Initialize typing status
      isTypingRef.current = Array(messages.length).fill(false);
      isTypingRef.current[0] = true; // Start typing the first message
      
      setVisibleIndex(0);
      setDisplayedMessages([...messages]); // Set all messages
    }
  }, [messages]);

  const handleTypingComplete = (index) => {
    // Mark this message as completed
    isTypingRef.current[index] = false;
    
    // Move to next message if there is one
    if (index < displayedMessages.length - 1) {
      isTypingRef.current[index + 1] = true;
      setVisibleIndex(index + 1);
    }
  };

  return (
    <Box>
      {displayedMessages.map((msg, index) => {
        const isFinalOutput = index === displayedMessages.length - 1;
        const isCurrentlyTyping = index === visibleIndex && isTypingRef.current[index];
        const shouldDisplay = index <= visibleIndex;
        
        if (!shouldDisplay) return null;
        
        return (
          <Box 
            key={index} 
            sx={{
              opacity: 0.9,
              mb: 3, 
              transition: "all 0.2s ease",
              "&:hover": {
                opacity: 1,
                transform: "translateY(-2px)",
                boxShadow: darkMode 
                  ? "0 4px 8px rgba(0, 0, 0, 0.25)" 
                  : "0 4px 8px rgba(0, 0, 0, 0.15)"
              },
              borderLeft: isFinalOutput 
                ? "4px solid #4CAF50" 
                : "4px solid #FFA500"
            }}
          >
            <Typography 
              variant="subtitle2" 
              sx={{
                fontWeight: "bold", 
                color: isFinalOutput ? "#4CAF50" : "#FFA500", 
                mb: 1,
                marginLeft: "15px"
              }}
            >
              {isFinalOutput ? "✅ Final Fixed Output" : `🔄 Code Fix - Iteration ${index + 1}`}
            </Typography>

            <CodeBlock 
              code={msg} 
              language="python" 
              darkMode={darkMode} 
              theme={theme} 
              onTypingComplete={isCurrentlyTyping ? () => handleTypingComplete(index) : undefined}
              disableTypingEffect={!isCurrentlyTyping} 
            />
          </Box>
        );
      })}
      
      {visibleIndex < displayedMessages.length - 1 && (
        <Box
          sx={{
            mb: 3,
            borderLeft: visibleIndex + 1 === displayedMessages.length - 1 
              ? "4px solid #4CAF50" 
              : "4px solid #FFA500",
            opacity: 0.7
          }}
        >
          <Typography 
            variant="subtitle2" 
            sx={{
              fontWeight: "bold", 
              color: visibleIndex + 1 === displayedMessages.length - 1 ? "#4CAF50" : "#FFA500", 
              mb: 1,
              marginLeft: "15px"
            }}
          >
            {visibleIndex + 1 === displayedMessages.length - 1 
              ? "✅ Final Fixed Output" 
              : `🔄 Code Fix - Iteration ${visibleIndex + 2}`}
          </Typography>
          
          <Box sx={{ p: 2 }}>
            <Skeleton 
              variant="rectangular" 
              height={150} 
              width="100%" 
              animation="wave"
              sx={{ 
                borderRadius: "6px",
                bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' 
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SequentialMessageBlocks;
