import { FolderOpen } from "lucide-react"

interface ComingSoonProps {
  title: string
}

export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">
          Manage your {title.toLowerCase()} here.
        </p>
      </div>
      
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl bg-white/50 backdrop-blur-sm min-h-[400px] text-center">
        <div className="bg-amber-50 p-4 rounded-2xl mb-6">
          <FolderOpen size={48} className="text-amber-500" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">{title} content is coming soon</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We are currently working on this feature. This section will allow you to manage your {title.toLowerCase()} effectively.
        </p>
      </div>
    </div>
  )
}
