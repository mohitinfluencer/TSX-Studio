import { AppShell } from "@/components/app-shell";
import { ReferralClient } from "@/components/referral-client";

export const metadata = {
    title: "Referrals & Rewards | TSX Studio",
    description: "Earn rendering credits by inviting other elite creators to TSX Studio.",
};

export default function ReferralsPage() {
    return (
        <AppShell>
            <div className="p-8 pb-32">
                <div className="max-w-6xl mx-auto mb-16">
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter">
                        Referrals & <br /><span className="text-primary italic">Rewards.</span>
                    </h1>
                    <p className="text-muted-foreground mt-4 text-lg italic font-medium max-w-xl">
                        Power the studio cluster. Bring in your circle of elite creators and expand your rendering capacity with instant credit rewards.
                    </p>
                </div>

                <ReferralClient />
            </div>
        </AppShell>
    );
}
