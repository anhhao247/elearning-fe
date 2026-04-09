import { Suspense } from "react"
import LoginContent from "./_components/login-content"

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950" />}>
      <LoginContent />
    </Suspense>
  )
}

