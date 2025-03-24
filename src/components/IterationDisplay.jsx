import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";

const IterationDisplay = ({ results, loading, theme }) => {
  const [iterations, setIterations] = useState([]);

  useEffect(() => {
    if (results && results.length > 0) {
      const newIterations = results.map((result, index) => {
        let text;
        let color = theme.text.primary;

        if (result.type === "runner" && result.status.includes("Error")) {
          const errorMatch = result.output?.match(/"error_type":\s*"(.*?)"/);
          text = `Error: ${errorMatch ? errorMatch[1] : "Unknown Error"}`;
          color = "red";
        } else if (result.type === "fixer") {
          text = "Fixing Code...";
          color = "green";
        } else if (result.type === "runner" && result.status.includes("success")) {
          text = "Code Executed Successfully";
              color = "green"}
        // } else {
        //   text = "Running Code...";
        // }

        const now = new Date();
        

        return { id: index + 1, text, color };
      });

      setIterations(newIterations);
    }
  }, [results]);

  if (loading && iterations.length === 0) {
    return (
      <Box style={{ textAlign: "center", padding: "20px" }}>
        <CircularProgress size={30} style={{ color: theme.active.text, marginBottom: "10px" }} />
        <Typography variant="body1" style={{ color: theme.text.primary }}>
          Running your code...
        </Typography>
      </Box>
    );
  }

  return (
    <Box style={{ flexGrow: 1, overflowY: "auto", marginBottom: "12px", paddingRight: "8px" }}>
      {iterations.length === 0 ? (
        <Typography style={{ color: theme.text.secondary, textAlign: "center", fontStyle: "italic", padding: "20px" }}>
          No executions yet. Run your code to see results.
        </Typography>
      ) : (
        iterations.map((iteration) => (
          <motion.div 
            key={iteration.id} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}
          >
            <motion.span
              animate={loading ? { opacity: [0, 1, 0] } : { opacity: 1 }}
              transition={loading ? { repeat: Infinity, duration: 1 } : {}}
              style={{ marginBottom: "5px", fontWeight: 500, color: iteration.color }}
            >
              {iteration.text}
            </motion.span>
            <Typography style={{ color: theme.text.secondary, fontSize: "0.8rem" }}>{iteration.timestamp}</Typography>
          </motion.div>
        ))
      )}

      {loading && iterations.length > 0 && (
        <Box style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "10px 0" }}>
          <CircularProgress size={20} style={{ color: theme.active.text, marginRight: "5px" }} />
          <Typography style={{ color: theme.text.secondary, fontSize: "0.8rem" }}>Processing...</Typography>
        </Box>
      )}
    </Box>
  );
};

export default IterationDisplay;