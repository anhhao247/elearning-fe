import { InstructorProfile } from "@/types/instructor"
import { User, Building2, Briefcase, GraduationCap, Award } from "lucide-react"

interface InstructorBioProps {
  profile: InstructorProfile
}

export function InstructorBio({ profile }: InstructorBioProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: About Me */}
      <div className="lg:col-span-8 bg-white rounded-2xl p-8 border shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-slate-700" />
          <h2 className="text-2xl font-bold text-slate-900">About Me</h2>
        </div>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg">
            {profile.bio}
          </p>
        </div>
      </div>

      {/* Right Column: Affiliations & Quick Stats */}
      <div className="lg:col-span-4 space-y-6">
        {/* Affiliations Card */}
        <div className="bg-white rounded-2xl p-6 border shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Affiliations</h3>
          <div className="space-y-4">
            {profile.affiliations.organizations.map((org, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border shadow-sm shrink-0">
                  <Building2 className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 leading-tight">{org}</div>
                  <div className="text-xs text-slate-500 font-medium">Partner Organization</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="bg-[#0a1128] rounded-2xl p-6 shadow-lg text-white">
          <h3 className="text-xl font-bold mb-6">Quick Stats</h3>
          <ul className="space-y-5">
            <li className="flex items-center gap-3 text-sm font-medium text-slate-300">
              <div className="p-1.5 bg-emerald-500/20 rounded-md text-emerald-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <span>10+ Years Professional Experience</span>
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-slate-300">
              <div className="p-1.5 bg-blue-500/20 rounded-md text-blue-400">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span>Mentored 500+ Junior Devs</span>
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-slate-300">
              <div className="p-1.5 bg-violet-500/20 rounded-md text-violet-400">
                <Award className="w-4 h-4" />
              </div>
              <span>Enterprise System Architect</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
