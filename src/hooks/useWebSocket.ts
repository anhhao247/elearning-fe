"use client"

import { useEffect, useRef, useCallback } from "react"
import { Client, IMessage } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { useAuthStore } from "@/store/useAuthStore"
import { useNotificationStore } from "@/store/useNotificationStore"
import { toast } from "sonner"

export const useWebSocket = () => {
  const { accessToken, user, _hasHydrated } = useAuthStore()
  const { addNotification } = useNotificationStore()
  const clientRef = useRef<Client | null>(null)
  const isConnectingRef = useRef(false)

  const connect = useCallback(() => {
    // Wait for hydration and valid auth
    if (!_hasHydrated || !accessToken || !user || isConnectingRef.current) {
      return
    }

    if (clientRef.current?.active) {
      return
    }

    isConnectingRef.current = true

    const client = new Client({
      // SỬA LỖI: Sử dụng factory để khởi tạo SockJS
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      
      // Khuyên dùng: Tắt heartbeat của StompJS khi dùng SockJS 
      // vì SockJS có cơ chế heartbeat riêng
      heartbeatIncoming: 0,
      heartbeatOutgoing: 0,
      
      reconnectDelay: 5000,
      
      onConnect: () => {
        console.log("WebSocket Connected successfully")
        isConnectingRef.current = false
        
        client.subscribe("/user/queue/notifications", (message: IMessage) => {
          if (message.body) {
            try {
              const data = JSON.parse(message.body)
              addNotification(data)
              toast.success(data.title || "Thông báo mới", {
                description: data.message,
              })
            } catch (error) {
              console.error("Error parsing notification message:", error)
            }
          }
        })
      },
      
      onStompError: (frame) => {
        console.error("STOMP Broker Error:", frame.headers["message"])
        console.error("Details:", frame.body)
        isConnectingRef.current = false
      },
      
      onWebSocketError: (event) => {
        // Chỉ log lỗi nếu không phải do chủ động ngắt kết nối
        if (isConnectingRef.current) {
          // console.error("WebSocket Connection Error:", event)
        }
      },

      onWebSocketClose: () => {
        // console.log("WebSocket Connection Closed")
        isConnectingRef.current = false
      }
    })

    client.activate()
    clientRef.current = client
  }, [_hasHydrated, accessToken, user, addNotification])

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      console.log("Deactivating WebSocket client...")
      clientRef.current.deactivate()
      clientRef.current = null
      isConnectingRef.current = false
    }
  }, [])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return { 
    client: clientRef.current,
    isConnected: clientRef.current?.active || false
  }
}
