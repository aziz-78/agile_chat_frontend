import React, { useState, useEffect, useRef } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { ContentCopy, Download } from "@mui/icons-material";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";

// Individual CodeBlock component
const CodeBlock = ({ code, language, darkMode, theme, onTypingComplete }) => {
  const [typedCode, setTypedCode] = useState("");
  
  // Typewriter effect
  useEffect(() => {
    // Only proceed if we have code to animate
    if (!code) {
      setTypedCode("");
      if (onTypingComplete) onTypingComplete();
      return;
    }
    
    // Reset typed code immediately
    setTypedCode("");
    
    let currentIndex = 0;
    let intervalId = null;
    
    // Start a new typing interval
    const typingSpeed = 15; // ms per character
    
    // Define the typing function
    const typeNextCharacter = () => {
      if (currentIndex < code.length) {
        // Use substring to ensure we have the correct part of the string
        const textToShow = code.substring(0, currentIndex + 1);
        setTypedCode(textToShow);
        currentIndex++;
      } else {
        // Animation complete, clear interval
        clearInterval(intervalId);
        // Signal that typing is complete
        if (onTypingComplete) onTypingComplete();
      }
    };
    
    // Start the interval
    intervalId = setInterval(typeNextCharacter, typingSpeed);
    
    // Clean up function
    return () => {
      clearInterval(intervalId);
    };
  }, [code, onTypingComplete]);

  // Copy to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  // Download as file
  const handleDownloadFile = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "code.py";
    link.click();
  };

  return (
    <Box sx={{ flexGrow: 1, overflow: "auto", p: 2, position: "relative", mb: 2 }}>
      {/* Copy & Download Buttons */}
      <Box sx={{ position: "absolute", top: 28, right: 24, display: "flex" }}>
        <Tooltip title="Copy to Clipboard">
          <IconButton size="small" sx={{ color: theme.text.secondary }} onClick={handleCopyToClipboard}>
            <ContentCopy fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Download as Python File">
          <IconButton size="small" sx={{ color: theme.text.secondary }} onClick={handleDownloadFile}>
            <Download fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Code Block */}
      <SyntaxHighlighter
        language={language}
        style={darkMode ? vscDarkPlus : vs}
        wrapLines={true}
        showLineNumbers={true}
        customStyle={{
          margin: 0,
          borderRadius: "6px",
          fontSize: "0.9rem",
          backgroundColor: theme.codeBlock.background,
          border: `1px solid ${theme.codeBlock.border}`,
          minHeight: "20px",
          transition: "background-color 0.3s ease, border 0.3s ease",
        }}
      >
        {typedCode}
      </SyntaxHighlighter>
    </Box>
  );
};

// Parent component to manage sequential display of code blocks
const SequentialCodeBlocks = ({ codeBlocks, language, darkMode, theme }) => {
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  
  const handleTypingComplete = () => {
    // Move to the next block when current one completes
    if (currentBlockIndex < codeBlocks.length - 1) {
      setCurrentBlockIndex(currentBlockIndex + 1);
    }
  };
  
  return (
    <Box>
      {codeBlocks.slice(0, currentBlockIndex + 1).map((codeBlock, index) => (
        <CodeBlock
          key={index}
          code={codeBlock}
          language={language}
          darkMode={darkMode}
          theme={theme}
          onTypingComplete={index === currentBlockIndex ? handleTypingComplete : undefined}
        />
      ))}
    </Box>
  );
};

export default SequentialCodeBlocks;
// Also export the individual CodeBlock for standalone use
export { CodeBlock };