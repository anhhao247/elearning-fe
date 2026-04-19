import { use } from "react"
import { AiInterview } from "@/components/features/ai-interview"

export default function InterviewRoutePage({
  params,
}: {
  params: Promise<{ slug: string; contentId: string }>
}) {
  const unwrappedParams = use(params)
  
  return <AiInterview slug={unwrappedParams.slug} contentId={Number(unwrappedParams.contentId)} />
}
