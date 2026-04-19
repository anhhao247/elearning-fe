import { z } from "zod";

export const applyInstructorSchema = z.object({
  headline: z
    .string()
    .min(10, "Headline must be at least 10 characters")
    .max(100, "Headline must not exceed 100 characters"),
  bio: z
    .string()
    .min(50, "Bio must be at least 50 characters"),
  affiliations: z
    .array(z.string().min(1, "Affiliation cannot be empty"))
    .min(1, "At least one affiliation is required"),
  websiteUrl: z
    .string()
    .url("Invalid URL")
    .or(z.literal(""))
    .optional(),
  facebookUrl: z
    .string()
    .url("Invalid URL")
    .or(z.literal(""))
    .optional(),
  twitterUrl: z
    .string()
    .url("Invalid URL")
    .or(z.literal(""))
    .optional(),
  linkedinUrl: z
    .string()
    .url("Invalid URL")
    .or(z.literal(""))
    .optional(),
})

export type ApplyInstructorSchema = z.infer<typeof applyInstructorSchema>
