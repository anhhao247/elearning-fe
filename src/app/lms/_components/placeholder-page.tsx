export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-slate-500">Manage your {title.toLowerCase()} here.</p>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <div className="h-8 w-8 text-slate-300">📁</div>
        </div>
        <h2 className="text-xl font-semibold mb-2">{title} content is coming soon</h2>
        <p className="text-slate-500 max-w-sm">
          We are currently working on this feature. This section will allow you to manage your {title.toLowerCase()} effectively.
        </p>
      </div>
    </div>
  )
}
