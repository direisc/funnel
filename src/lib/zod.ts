import { z } from "zod"

export const signInSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(3, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
})
export type SignInSchema = z.infer<typeof signInSchema>

export const signUpSchema = z.object({
  name: z.string().nullish(),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(3, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters")
    .nullish(),
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  image: z.string().url().nullish(),
})
export type SignUpSchema = z.infer<typeof signUpSchema>
