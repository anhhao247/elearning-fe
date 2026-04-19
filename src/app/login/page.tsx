import { Suspense } from "react"
import LoginContentWrapper from "./_components/login-content"

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LoginContentWrapper />
    </Suspense>
  )
}
