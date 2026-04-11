import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 md:px-6 flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} EduPlatform. Tất cả các quyền được bảo lưu.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/terms" className="text-sm font-medium text-muted-foreground hover:underline underline-offset-4">
            Điều khoản
          </Link>
          <Link href="/privacy" className="text-sm font-medium text-muted-foreground hover:underline underline-offset-4">
            Bảo mật
          </Link>
          <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:underline underline-offset-4">
            Liên hệ
          </Link>
        </div>
      </div>
    </footer>
  );
}
