"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function ReferralTracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const refCode = searchParams.get("ref");
        if (refCode) {
            // Store the referral code in a cookie for 30 days
            document.cookie = `tsx_referral_code=${refCode}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
            console.log("Referral captured:", refCode);
        }
    }, [searchParams]);

    return null;
}
