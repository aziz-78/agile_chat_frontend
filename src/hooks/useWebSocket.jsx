import { useEffect, useRef, useState } from "react";

const url = import.meta.env.VITE_SOCKET_URL;
console.log("WebSocket URL:", url);

const useWebSocket = (onMessage) => {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const ws = useRef(null);

    useEffect(() => {
        ws.current = new WebSocket(url);
    
        ws.current.onopen = () => {
            console.log("WebSocket Connected");
            console.log(ws.current.readyState);
            
            setIsConnected(true);
        };
    
        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("WebSocket Message:", data);
                
                onMessage(data);
            } catch (err) {
                console.error("Error parsing WebSocket message:", err);
            }
        };
    
        ws.current.onerror = (err) => {
            console.error("WebSocket Error:", err);
            setError("WebSocket connection error.");
        };
    
        ws.current.onclose = () => {
            console.log("WebSocket Disconnected");
            setIsConnected(false);
        };
    
        // ✅ Cleanup function: Close WebSocket when component unmounts or `url` changes
        // return () => {
        //     console.log("Cleaning up WebSocket connection...");
        //     if (ws.current) {
        //         ws.current.close();
        //     }
        // };
    }, [url]);  // ✅ Re-runs only when `url` changes
    

    const sendMessage = (message) => {
        console.log(ws.current);
        console.log(ws.current.readyState);
        console.log(WebSocket.OPEN);
        
        
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message));
        } else {
            console.error("WebSocket is not connected.");
        }
    };

    return { sendMessage, isConnected, error };
};

export default useWebSocket;
