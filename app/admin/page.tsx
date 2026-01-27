import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ShieldAlert,
    Activity,
    Database,
    Terminal,
    Search,
    MonitorPlay,
    Settings,
    AlertTriangle
} from "lucide-react";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
    const session = await auth();

    // Real check: session.user.role === 'ADMIN'
    // For demo, we just allow the first user or check email
    // if (session?.user?.email !== 'admin@tsxstudio.com') redirect('/');

    const stats = {
        totalJobs: await db.renderJob.count(),
        activeJobs: await db.renderJob.count({ where: { status: "RUNNING" } }),
        failedJobs: await db.renderJob.count({ where: { status: "FAILED" } }),
        totalUsers: await db.user.count(),
    };

    const recentJobs = await db.renderJob.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
            user: true,
            project: true,
        },
    });

    return (
        <AppShell>
            <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-destructive flex items-center gap-2">
                            <ShieldAlert className="w-8 h-8" /> System Control Center
                        </h1>
                        <p className="text-muted-foreground">Internal oversight for TSX Studio clusters and billing integrity.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="border-white/5 bg-card/30 font-bold uppercase text-[10px] tracking-widest gap-2">
                            <Terminal className="w-3 h-3" /> Logs
                        </Button>
                        <Button variant="outline" className="border-white/5 bg-card/30 font-bold uppercase text-[10px] tracking-widest gap-2">
                            <Settings className="w-3 h-3" /> Config
                        </Button>
                    </div>
                </div>

                {/* System Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <AdminStatCard title="Global Renders" value={stats.totalJobs} icon={<MonitorPlay className="w-4 h-4" />} />
                    <AdminStatCard title="Active Cluster" value={stats.activeJobs} icon={<Activity className="w-4 h-4 text-green-400" />} />
                    <AdminStatCard title="System Errors" value={stats.failedJobs} icon={<AlertTriangle className="w-4 h-4 text-destructive" />} trend="danger" />
                    <AdminStatCard title="User Registry" value={stats.totalUsers} icon={<Database className="w-4 h-4" />} />
                </div>

                {/* Global Job Queue */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold tracking-tight uppercase text-[12px] tracking-widest font-black italic">Live Cluster Queue</h2>
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Network Operational</span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-card/30 backdrop-blur-xl overflow-hidden">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-[10px] uppercase font-black tracking-widest">User</TableHead>
                                    <TableHead className="text-[10px] uppercase font-black tracking-widest">Job Type</TableHead>
                                    <TableHead className="text-[10px] uppercase font-black tracking-widest">Status</TableHead>
                                    <TableHead className="text-[10px] uppercase font-black tracking-widest">Cluster Node</TableHead>
                                    <TableHead className="text-[10px] uppercase font-black tracking-widest text-right">Activity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentJobs.map((job: any) => (
                                    <TableRow key={job.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10" />
                                                <span className="text-xs font-bold uppercase tracking-tight truncate max-w-[120px]">{job.user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-[9px] uppercase font-bold border-white/10">
                                                {job.outputFormat} • {job.resolution}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <AdminStatusBadge status={job.status} />
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[10px] font-mono text-muted-foreground uppercase">NODE-USEAST-1A</span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Search className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}

function AdminStatCard({ title, value, icon, trend = "neutral" }: { title: string, value: number, icon: React.ReactNode, trend?: "neutral" | "danger" }) {
    return (
        <Card className="border-white/5 bg-card/10 border-l-2 border-l-white/20">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</span>
                    <div className="text-muted-foreground">{icon}</div>
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-black italic">{value}</span>
                    {trend === "danger" && value > 0 && <span className="text-[10px] font-bold text-destructive mb-1 uppercase tracking-tighter italic">Warning</span>}
                </div>
            </CardContent>
        </Card>
    );
}

function AdminStatusBadge({ status }: { status: string }) {
    switch (status) {
        case "QUEUED":
            return <Badge variant="secondary" className="text-[9px] uppercase font-black tracking-widest">Queued</Badge>;
        case "RUNNING":
            return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px] uppercase font-black tracking-widest">Active</Badge>;
        case "SUCCEEDED":
            return <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[9px] uppercase font-black tracking-widest">Success</Badge>;
        case "FAILED":
            return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[9px] uppercase font-black tracking-widest">System Error</Badge>;
        default:
            return <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest">{status}</Badge>;
    }
}
