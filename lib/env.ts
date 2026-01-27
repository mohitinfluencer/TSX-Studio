import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    NEXTAUTH_URL: z.string().url().optional(), // Vercel handles this automatically in v5
    AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
});

export const validateEnv = () => {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        console.error("❌ Invalid environment variables:", result.error.flatten().fieldErrors);

        // In production, we don't want to crash the whole app if an optional var is missing,
        // but AUTH_SECRET and DATABASE_URL are non-negotiable.
        if (!process.env.DATABASE_URL || !process.env.AUTH_SECRET) {
            if (process.env.NODE_ENV === "production") {
                // Log but don't throw to avoid total outage if possible, 
                // though Auth will likely fail anyway.
            } else {
                throw new Error("Missing critical environment variables");
            }
        }
        return null;
    }

    return result.data;
};
