import React, { createContext, useContext, useEffect, useState, useRef } from "react"
import { io } from "socket.io-client"
import { useAuth } from "./AuthProvider"

const SocketContext = createContext(null)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider")
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const { user } = useAuth()
  console.log(user, "++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")

  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const activityIntervalRef = useRef(null)

  // Get Socket.IO server URL from environment
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin

  useEffect(() => {
    console.log("---------------------------------------------------------------------------------------------------------------------------------------------")
    // Only connect if user is authenticated
    if (!user) {
      // Disconnect if socket exists
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    console.log("---------------------------------------------------------------------------------------------------------------------------------------------")

    // Create socket connection with explicit path for nginx
    const newSocket = io(SOCKET_URL, {
      path: "/socket.io", // Must match nginx proxy path
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("✓ Socket.IO connected:", newSocket.id)
      setIsConnected(true)
    })

    newSocket.on("connected", (data) => {
      console.log("✓ Authentication successful:", data)
    })

    newSocket.on("disconnect", (reason) => {
      console.log("✗ Socket.IO disconnected:", reason)
      setIsConnected(false)
    })

    newSocket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error.message)
      setIsConnected(false)
    })

    newSocket.on("error", (error) => {
      console.error("Socket.IO error:", error)
    })

    // Listen for online/offline events (for admin dashboard)
    newSocket.on("user:online", (userData) => {
      console.log("User came online:", userData)
      setOnlineUsers((prev) => {
        // Check if user already exists
        const exists = prev.find((u) => u.userId === userData.userId)
        if (exists) return prev
        return [...prev, userData]
      })
    })

    newSocket.on("user:offline", (userData) => {
      console.log("User went offline:", userData)
      setOnlineUsers((prev) => prev.filter((u) => u.userId !== userData.userId))
    })

    setSocket(newSocket)

    // Setup activity heartbeat (every 30 seconds)
    activityIntervalRef.current = setInterval(() => {
      if (newSocket && newSocket.connected) {
        newSocket.emit("activity")
      }
    }, 30000)

    // Cleanup on unmount
    return () => {
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current)
      }
      if (newSocket) {
        newSocket.disconnect()
      }
    }
  }, [user, SOCKET_URL])

  // Emit custom events
  const emit = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data)
    } else {
      console.warn("Socket not connected. Cannot emit event:", event)
    }
  }

  // Subscribe to custom events
  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback)
      // Return cleanup function
      return () => socket.off(event, callback)
    }
  }

  // Unsubscribe from events
  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback)
    }
  }

  const value = {
    socket,
    isConnected,
    emit,
    on,
    off,
    onlineUsers,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export default SocketProvider
