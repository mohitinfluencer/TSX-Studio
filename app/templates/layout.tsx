import { AppShell } from "@/components/app-shell";

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
    return <AppShell>{children}</AppShell>;
}
