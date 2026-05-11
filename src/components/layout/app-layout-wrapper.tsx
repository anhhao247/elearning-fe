"use client"

import { usePathname } from "next/navigation"
import { Header } from "./header"
import { Footer } from "./footer"
import { VoiceChatbot } from "../features/voice-chatbot"

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminPath = pathname?.startsWith("/lms") || pathname?.startsWith("/admin")
  const isAuthPath = pathname?.startsWith("/login") || pathname?.startsWith("/register")
  const isLearningPath = pathname?.includes("/courses/learning")
  const isInterviewPath = pathname?.includes("/interview")

  if (isAdminPath) {
    return <main className="flex-1 flex flex-col">{children}</main>
  }

  if (isLearningPath) {
    return (
      <>
        <main className="flex-1 flex flex-col">{children}</main>
        {!isInterviewPath && (
          <div className="hidden sm:block">
            <VoiceChatbot />
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      {!isAuthPath && !isInterviewPath && (
        <div className="hidden sm:block">
           <VoiceChatbot />
        </div>
      )}
      <Footer />
    </>
  )
}
