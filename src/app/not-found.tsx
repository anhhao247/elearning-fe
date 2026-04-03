import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Không tìm thấy trang</h2>
      <p className="text-muted-foreground mb-8">Trang bạn yêu cầu không tồn tại hoặc đã bị gỡ bỏ.</p>
      <Button asChild>
        <Link href="/">Trở về trang chủ</Link>
      </Button>
    </div>
  )
}
