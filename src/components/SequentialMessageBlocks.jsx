import React, { useState, useEffect } from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import { CodeBlock } from "./CodeBlock"; 

const SequentialMessageBlocks = ({ messages, darkMode, theme }) => {
  const [visibleIndex, setVisibleIndex] = useState(0);
  
  // Reset when messages change
  useEffect(() => {
    setVisibleIndex(0);
  }, [messages.length]);
  
  // This function will be called when each code block finishes typing
  const handleTypingComplete = (index) => {
    if (index < messages.length - 1) {
      setVisibleIndex(index + 1);
    }
  };
  
  return (
    <Box>
      {/* Render visible blocks */}
      {messages.slice(0, visibleIndex + 1).map((msg, index) => {
        const isFinalOutput = index === messages.length - 1;
        const isCurrentlyTyping = index === visibleIndex;
        
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
            {/* Label above each code block */}
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
            />
          </Box>
        );
      })}
      
      {/* Skeleton loader for the next block - only show if we haven't reached the end */}
      {visibleIndex < messages.length - 1 && (
        <Box
          sx={{
            mb: 3,
            borderLeft: visibleIndex + 1 === messages.length - 1 
              ? "4px solid #4CAF50" 
              : "4px solid #FFA500",
            opacity: 0.7
          }}
        >
          <Typography 
            variant="subtitle2" 
            sx={{
              fontWeight: "bold", 
              color: visibleIndex + 1 === messages.length - 1 ? "#4CAF50" : "#FFA500", 
              mb: 1,
              marginLeft: "15px"
            }}
          >
            {visibleIndex + 1 === messages.length - 1 
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