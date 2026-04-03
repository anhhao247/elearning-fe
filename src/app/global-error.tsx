'use client'

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
          <h2 className="text-2xl font-bold mb-4">Đã có lỗi xảy ra!</h2>
          <p className="text-muted-foreground mb-6">{error.message || "Một lỗi không mong muốn đã xảy ra."}</p>
          <Button onClick={() => reset()}>
            Thử lại
          </Button>
        </div>
      </body>
    </html>
  )
}
