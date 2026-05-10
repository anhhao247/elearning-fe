import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { InstructorProfile } from "@/types/instructor"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Users, BookOpen, Link as LinkIcon, CheckCircle2 } from "lucide-react"

interface InstructorHeroProps {
  profile: InstructorProfile
}

// Social icon SVG
function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

export function InstructorHero({ profile }: InstructorHeroProps) {
  const fullName = `${profile.firstName} ${profile.lastName}`
  
  return (
    <div className="bg-white py-12 border-b">
      <div className="page-container">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
          {/* Left: Avatar with Verified Badge */}
          <div className="relative shrink-0">
            <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
              <Avatar className="w-full h-full rounded-none">
                <AvatarImage src={profile.avatar || undefined} alt={fullName} className="object-cover" />
                <AvatarFallback className="text-4xl font-bold bg-slate-100 text-slate-400">
                  {profile.firstName[0]}{profile.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            {/* Verified Badge */}
            <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1.5 rounded-lg shadow-lg border-2 border-white">
              <CheckCircle2 className="w-5 h-5 fill-current text-white" />
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex-1 space-y-6">
            <div className="space-y-1">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none px-3 py-1 mb-2">
                <Star className="w-3 h-3 fill-current mr-1" />
                Senior Instructor
              </Badge>
              <h1 className="text-4xl font-bold text-slate-900 leading-tight">
                {fullName}
              </h1>
              <p className="text-xl text-slate-500 font-medium italic">
                {profile.headline}
              </p>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-x-12 gap-y-6 pt-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                  {profile.totalStudents.toLocaleString()}
                </div>
                <div className="text-sm text-slate-500 font-medium">Total Students</div>
              </div>
              <div className="w-px h-10 bg-slate-200 hidden sm:block" />
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                  {profile.activeCourses}
                </div>
                <div className="text-sm text-slate-500 font-medium">Active Courses</div>
              </div>
              <div className="w-px h-10 bg-slate-200 hidden sm:block" />
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                  {profile.averageRating.toFixed(1)} <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                </div>
                <div className="text-sm text-slate-500 font-medium">Instructor Rating</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              {profile.linkedinUrl && (
                <Button variant="outline" className="h-11 px-6 rounded-lg font-bold border-2" asChild>
                  <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                    <LinkedinIcon className="w-4 h-4 mr-2" />
                    LinkedIn Profile
                  </a>
                </Button>
              )}
              <Button className="h-11 px-8 rounded-lg font-bold bg-[#0a1128] hover:bg-[#0a1128]/90 text-white">
                Follow Instructor
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
