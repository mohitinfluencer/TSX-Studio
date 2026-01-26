import { AppShell } from "@/components/app-shell";

export default function ReferralsPage() {
    return (
        <AppShell>
            <div className="p-8 flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-4xl font-black italic mb-4">Referrals & <span className="text-secondary italic">Rewards</span></h1>
                <p className="text-muted-foreground max-w-md">Earn credits by inviting other elite creators. This feature is being finalized for your cluster.</p>
            </div>
        </AppShell>
    );
}
