import React, { useRef, useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Download from "@mui/icons-material/Download";
import CodeBlock from "./components/CodeBlock";
import SequentialMessageBlocks from "./components/SequentialMessageBlocks";

import {
  Card,
  CardContent,
  Typography,
  TextField,
  Paper,
  IconButton,
  Box,
  Divider,
  Chip,
  Avatar,
  Tooltip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Code,
  PlayArrow,
  History,
  Settings,
  Fullscreen,
  GitHub,
  LightMode,
  DarkMode,
  AttachFile,
} from "@mui/icons-material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { FullscreenExit } from "@mui/icons-material";
import useWebSocket from "./hooks/useWebSocket";
import IterationDisplay from "./components/IterationDisplay";
import Typewriter from "./components/Typewriter";

const CodeEditorUI = () => {
  const [code, setCode] = useState("print('Hello, World!');");
  const [selectedFile, setSelectedFile] = useState(null);
  const [panelSizes, setPanelSizes] = useState({
    leftWidth: 30, // percentage
    rightWidth: 70, // percentage
  });
  const [isDragging, setIsDragging] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const dragHandleRef = useRef(null);
  const containerRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [finalFixedCode, setFinalFixedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [typedCode, setTypedCode] = useState("");
  const [messages, setMessages] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // Hook to detect if user has scrolled up and show scroll-to-bottom button
  useEffect(() => {
    const handleScroll = () => {
      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isScrolledUp = scrollHeight - scrollTop - clientHeight > 50;
        setShowScrollButton(isScrolledUp && messages.length > 2);
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [messages]);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current && messages.length > 0) {
      // Only auto-scroll if user is already at the bottom
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      
      if (isAtBottom || messages.length <= 2) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const { sendMessage, isConnected, error: wsError } = useWebSocket((message) => {
    setResults((prev) => [...prev, message]);
    const extractCode = (code) => {
      return code.replace(/```python/g, "").replace(/```/g, "").trim();
    };
    // Update console output when available
    if (message.fixed_code) {
      console.log(message.output);
      if(message.fixed_code){
        let cleancode = extractCode(message.fixed_code);
        setMessages((prev) => [...prev, cleancode]);
      }
    }
    
    if (message.final_fixed_code) {
      let cleanCode = extractCode(message.final_fixed_code);
      console.log("Cleaned Code:", cleanCode);
      
      setMessages((prev) => [...prev, cleanCode]);
      setFinalFixedCode(cleanCode);
      setLoading(false);
    }
  });

  useEffect(() => {
    console.log("Updated Messages:", messages);
  }, [messages]); // Runs whenever messages state updates
  
  const handleSendCode = () => {
    if (!code.trim()) {
        setError("Code cannot be empty.");
        return;
    }
    setCode("");
    setLoading(true);
    setMessages([])
    setError("");
    setResults([]);
    setFinalFixedCode("");
    sendMessage({ code });
  };

  // Logo paths for light and dark modes
  const logoLight = "https://agileloop.ai/wp-content/uploads/2024/10/agile-light.png"; // Example path for light logo
  const logoDark = "https://agileloop.ai/wp-content/uploads/2024/10/agile.png"; // Original white logo

  const handleFileChange = (event) => {
    const file = event.target.files[0];
  
    if (file && file.name.endsWith(".py")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log("Python file content:\n", e.target.result);
        setCode(e.target.result);
        
      };
      reader.readAsText(file);
    } else {
      alert("Only .py files are allowed.");
      event.target.value = ""; // Reset the file input
    }
  };
  
  
  
  const handleIconClick = () => {
    document.getElementById("fileInput").click();
  };

  const paperRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      paperRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const [language, setLanguage] = useState("python");
  const languages = ["python"];

  // Theme toggle handler
  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  // Theme colors
  const theme = {
    background: darkMode ? "#0d1117" : "#f8f8f8",
    paper: darkMode ? "rgba(13, 17, 23, 0.8)" : "rgba(255, 255, 255, 0.8)",
    secondary: darkMode ? "#161b22" : "#f0f0f0",
    text: {
      primary: darkMode ? "#c9d1d9" : "#24292f",
      secondary: darkMode ? "#8b949e" : "#57606a",
    },
    border: darkMode ? "rgba(48, 54, 61, 0.6)" : "rgba(208, 215, 222, 0.6)",
    active: {
      background: darkMode ? "rgba(56, 139, 253, 0.15)" : "rgba(56, 139, 253, 0.1)",
      border: darkMode ? "rgba(56, 139, 253, 0.4)" : "rgba(56, 139, 253, 0.3)",
      text: darkMode ? "#58a6ff" : "#0969da",
    },
    divider: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    chip: {
      background: darkMode ? "rgba(33, 38, 45, 0.8)" : "rgba(240, 240, 240, 0.8)",
      text: darkMode ? "#8b949e" : "#57606a",
    },
    codeBlock: {
      background: darkMode ? "#0d1117" : "#f6f8fa",
      border: darkMode ? "rgba(48, 54, 61, 0.6)" : "rgba(208, 215, 222, 0.6)",
    },
    logoBackground: darkMode ? "transparent" : "rgba(13, 17, 23, 0.8)",
  };

  // Handle drag start
  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Handle dragging
  const handleDrag = (e) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Enforce min/max constraints
    if (newLeftWidth >= 15 && newLeftWidth <= 85) {
      setPanelSizes({
        leftWidth: newLeftWidth,
        rightWidth: 100 - newLeftWidth,
      });
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Set up global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', handleDragEnd);
    } else {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging]);

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: theme.background,
        padding: "20px",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
        transition: "background-color 0.3s ease",
      }}
    >
      {/* Header */}
      <Box sx={{ marginBottom: "20px" }}>
        <Box 
          sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            background: theme.logoBackground, 
            padding: darkMode ? "0" : "4px 8px",
            borderRadius: "8px",
          }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              marginRight: "10px",
              borderRadius: "6px",
              padding: "0px 8px",
              overflow: "hidden",
            }}>
              <img 
                src={darkMode ? logoDark : logoDark} 
                width={40} 
                height={40} 
                alt="Agile Web Agent" 
                style={{ objectFit: "contain" }}
              />
            </Box>
            <Typography variant="h5" sx={{ color: "white", fontWeight: 600, marginRight: "16px" }}>
              Agile Web Agent
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Tooltip title="GitHub">
              <IconButton sx={{ color: theme.text.secondary }}>
                <GitHub />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton sx={{ color: theme.text.secondary }}>
                <Settings />
              </IconButton>
            </Tooltip>
            <FormControlLabel
              control={
                <Switch 
                  checked={!darkMode}
                  onChange={handleThemeToggle}
                  icon={<DarkMode />}
                  checkedIcon={<LightMode />}
                  sx={{
                    '& .MuiSwitch-switchBase': {
                      color: darkMode ? '#8b949e' : '#f8e3a1',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#f8e3a1',
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: darkMode ? '#30363d' : '#d0d7de',
                    }
                  }}
                />
              }
              label={
                <Box component="span" sx={{ display: "flex", alignItems: "center" }}>
                  {darkMode ? <DarkMode sx={{ color: theme.text.secondary }} /> : <LightMode sx={{ color: theme.text.secondary }} />}
                </Box>
              }
              labelPlacement="start"
            />
          </Box>
        </Box>
        <Divider sx={{ background: theme.divider, mb: 1 }} />
      </Box>

      {/* Main content area with resizable panels */}
      <Box 
        ref={containerRef}
        sx={{
          display: "flex",
          height: "calc(100vh - 100px)",
          position: "relative"
        }}
      >
        {/* Left Panel - Timeline and Input */}
        <Box 
          sx={{
            width: `${panelSizes.leftWidth}%`,
            minWidth: "400px",
            height: "94%",
            paddingRight: "10px",
            transition: isDragging ? "none" : "width 0.1s ease"
          }}
        >
          <Paper
            elevation={4}
            sx={{
              height: "100%",
              borderRadius: "12px",
              padding: "20px",
              background: theme.paper,
              backdropFilter: "blur(10px)",
              border: `1px solid ${theme.border}`,
              display: "flex",
              flexDirection: "column",
              position: "relative",
              transition: "background 0.3s ease, border 0.3s ease",
            }}
          >
            {/* Iterations Section with Timeline styling */}
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: theme.text.secondary, 
                fontWeight: 600, 
                display: "flex", 
                alignItems: "center", 
                mb: 2 
              }}
            >
              <History sx={{ mr: 1, fontSize: 20 }} /> Chat
            </Typography>
            
            {/* Replace static iterations with dynamic component */}
            <IterationDisplay 
              results={results}
              loading={loading}
              theme={theme}
            />

            {/* Code Input - Bottom */}
            <Box sx={{ mt: "auto" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle1" sx={{ color: theme.text.secondary, fontWeight: 600 }}>
                  Editor
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {languages.slice(0, 3).map((lang) => (
                    <Chip 
                      key={lang}
                      label={lang} 
                      size="small" 
                      onClick={() => setLanguage(lang)}
                      sx={{ 
                        bgcolor: language === lang ? theme.active.background : theme.chip.background,
                        color: language === lang ? theme.active.text : theme.chip.text,
                        border: language === lang 
                          ? `1px solid ${theme.active.border}`
                          : `1px solid ${theme.border}`,
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: theme.active.background,
                        }
                      }} 
                    />
                  ))}
                  <Tooltip title="More languages">
                    <Chip 
                      label="+" 
                      size="small" 
                      sx={{ 
                        bgcolor: theme.chip.background,
                        color: theme.chip.text,
                        border: `1px solid ${theme.border}`,
                        cursor: "pointer"
                      }} 
                    />
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{ position: 'relative' }}>
              <TextField
  fullWidth
  multiline
  minRows={5}
  maxRows={5}
  value={code}
  position="relative"
  variant="outlined"
  onChange={(e) => setCode(e.target.value)}
  placeholder="Type your code here..."
  sx={{
    mb: 2,
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      color: theme.text.primary,
      fontFamily: "'Fira Code', monospace",
      fontSize: "0.9rem",
      background: theme.secondary,
      transition: "background 0.3s ease",
      overflow: "hidden",
      "& textarea": {
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "-webkit-box",
        WebkitLineClamp: 5,
        WebkitBoxOrient: "vertical"
      },
      "& fieldset": {
        borderColor: theme.border
      },
      "&:hover fieldset": {
        borderColor: theme.active.border
      },
      "&.Mui-focused fieldset": {
        borderColor: theme.active.text
      }
    }
  }}
/>
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    bottom: '24px', 
                    right: '12px', 
                    display: 'flex', 
                    gap: '8px',
                    zIndex: 10
                  }}
                >
                  <input
  type="file"
  id="fileInput"
  style={{ display: "none" }}
  accept=".py"
  onChange={handleFileChange}
/>

                  <Tooltip title="Attach File">
                    <IconButton 
                      size="small" 
                      onClick={handleIconClick}
                      sx={{ 
                        bgcolor: theme.chip.background,
                        color: theme.chip.text,
                        "&:hover": { 
                          bgcolor: theme.active.background,
                          color: theme.active.text
                        }
                      }}
                    >
                      <AttachFile fontSize="medium" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Enter">
                    <IconButton 
                      onClick={handleSendCode}
                      size="small" 
                      sx={{ 
                        bgcolor: theme.chip.background,
                        color: theme.chip.text,
                        "&:hover": { 
                          bgcolor: theme.active.background,
                          color: theme.active.text
                        }
                      }}
                    >
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Resizable Divider */}
        <Box
          ref={dragHandleRef}
          sx={{
            position: "relative",
            width: "10px",
            margin: "0 -5px",
            cursor: "col-resize",
            zIndex: 100,
          }}
          onMouseDown={handleDragStart}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              height: "50px",
              width: "6px",
              backgroundColor: isDragging ? theme.active.text : theme.border,
              borderRadius: "3px",
              transition: "background-color 0.2s",
              "&:hover": {
                backgroundColor: theme.active.text
              }
            }}
          />
        </Box>

        {/* Right Side - Code Output */}
        <Box 
          sx={{
            width: `${panelSizes.rightWidth}%`,
            height: "100%",
            paddingLeft: "10px",
            transition: isDragging ? "none" : "width 0.1s ease"
          }}
        >
          <Paper
            ref={paperRef}
            elevation={4}
            sx={{
              height: "100%",
              borderRadius: "12px",
              backgroundColor: theme.secondary,
              border: `1px solid ${theme.border}`,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              transition: "background-color 0.3s ease, border 0.3s ease",
            }}
          >
            {/* Output Header */}
            <Box 
              sx={{ 
                p: 2, 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                borderBottom: `1px solid ${theme.border}` 
              }}
            >
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: theme.text.primary, 
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center" 
                }}
              >
                <Code sx={{ mr: 1, fontSize: 20 }} /> 
                Output 
                <Chip 
                  size="small" 
                  label={language} 
                  sx={{ 
                    ml: 1, 
                    bgcolor: theme.chip.background, 
                    color: theme.chip.text 
                  }} 
                />
              </Typography>

              {/* Fullscreen Button */}
              <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                <IconButton size="small" sx={{ color: theme.text.secondary }} onClick={handleFullscreenToggle}>
                  {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
              </Tooltip>
            </Box>

            {/* Code Output Container with Improved Scrolling */}
            <Box 
              ref={messagesContainerRef}
              sx={{ 
                position: "relative",
                display: "flex", 
                flexDirection: "column", 
                gap: 2,
                height: "calc(100% - 120px)", 
                overflowY: "auto",
                padding: "16px",
                transition: "all 0.3s ease",
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
                  borderRadius: "4px",
                  "&:hover": {
                    background: darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
                  }
                }
              }}
            >
              <SequentialMessageBlocks 
  messages={messages} 
  darkMode={darkMode} 
  theme={theme} 
/>
              
              {/* Animated placeholder when loading */}
              {loading && (
                <Box 
                  sx={{
                    p: 2,
                    borderRadius: "8px",
                    border: `1px solid ${theme.border}`,
                    background: theme.codeBlock.background,
                    opacity: 0.7
                  }}
                >
                  <Box 
                    sx={{ 
                      height: "20px", 
                      width: "60%", 
                      background: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                      borderRadius: "4px",
                      animation: "pulse 1.5s infinite ease-in-out",
                      "@keyframes pulse": {
                        "0%": { opacity: 0.6 },
                        "50%": { opacity: 0.3 },
                        "100%": { opacity: 0.6 }
                      }
                    }} 
                  />
                </Box>
              )}
            </Box>
            
            {/* Scroll to bottom button - only visible when needed */}
            {showScrollButton && (
              <Tooltip title="Scroll to bottom">
                <IconButton
                  onClick={scrollToBottom}
                  sx={{
                    position: "absolute",
                    bottom: "80px", // Position above console
                    right: "16px",
                    backgroundColor: theme.active.background,
                    color: theme.active.text,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                    "&:hover": {
                      backgroundColor: theme.active.border,
                    },
                    zIndex: 10,
                  }}
                >
                  <ArrowDownwardIcon />
                </IconButton>
              </Tooltip>
            )}

            {/* Console Output */}
            {/* <Box 
              sx={{ 
                p: 2, 
                borderTop: `1px solid ${theme.border}`,
                bgcolor: theme.secondary,
                transition: "background-color 0.3s ease",
              }}
            >
              <Typography variant="subtitle2" sx={{ color: theme.text.secondary, mb: 1 }}>
                Console
              </Typography>
              <Box 
                sx={{ 
                  p: 2, 
                  backgroundColor: theme.codeBlock.background, 
                  borderRadius: "6px", 
                  fontFamily: "'Fira Code', monospace",
                  fontSize: "0.9rem",
                  color: darkMode ? "#a5d6ff" : "#0969da",
                  border: `1px solid ${theme.codeBlock.border}`,
                  transition: "background-color 0.3s ease, border 0.3s ease, color 0.3s ease",
                }}
              >
                {"> "}Hello, World!
              </Box>
            </Box> */}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default CodeEditorUI;