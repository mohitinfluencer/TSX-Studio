import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    // AUTH_SECRET is required in production, but we might skip it during build 
    // if Next.js tries to pre-render pages that don't actually need it.
    // However, v5 Auth.js generally needs it everywhere.
    AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
    NEXTAUTH_URL: z.string().url(),
    AUTH_TRUST_HOST: z.string().optional().or(z.boolean().optional()).default(true),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
});


export const validateEnv = () => {
    // During build time on Vercel, some variables might not be available 
    // depending on how the project is configured.
    const isBuildTime = process.env.NODE_ENV === 'production' && !!process.env.VERCEL;


    const result = envSchema.safeParse({
        DATABASE_URL: process.env.DATABASE_URL,
        AUTH_SECRET: process.env.AUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    });

    if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        console.error("❌ Invalid environment variables:", errors);

        if (isBuildTime) {
            console.warn("⚠️ Continuing build despite missing env vars. Ensure they are set in Vercel Dashboard for runtime.");
            return null;
        }

        // Critical failure for runtime
        if (!process.env.DATABASE_URL || !process.env.AUTH_SECRET) {
            throw new Error(`Missing critical environment variables: ${JSON.stringify(errors)}`);
        }
    }

    return result.data;
};
