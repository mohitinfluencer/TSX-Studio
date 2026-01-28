import React, { useState, useEffect } from 'react';
import {
    Cpu,
    Settings,
    Activity,
    ShieldCheck,
    Zap,
    Layout,
    HardDrive,
    ExternalLink
} from 'lucide-react';

const App: React.FC = () => {
    const [systemInfo, setSystemInfo] = useState<any>(null);
    const [showNotice, setShowNotice] = useState(false);

    useEffect(() => {
        const fetchInfo = async () => {
            if ((window as any).electronAPI) {
                const info = await (window as any).electronAPI.checkSystem();
                setSystemInfo(info);
            }
        };
        fetchInfo();

        // Check for first-run notice
        const hasSeenNotice = localStorage.getItem('tsx-has-seen-notice');
        if (!hasSeenNotice) {
            setShowNotice(true);
        }
    }, []);

    const dismissNotice = (permanently = false) => {
        if (permanently) {
            localStorage.setItem('tsx-has-seen-notice', 'true');
        }
        setShowNotice(false);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">TSX STUDIO</h1>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1 opacity-50">Local Engine v1.0.0</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                        <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-wider">Engine: Active</div>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-6 space-y-4 hover:bg-white/[0.04] transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Cpu className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Processor</p>
                            <h3 className="text-lg font-bold truncate pr-2">{systemInfo?.cpu || 'Detecting...'}</h3>
                        </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-6 space-y-4 hover:bg-white/[0.04] transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Cores Active</p>
                            <h3 className="text-lg font-bold">{systemInfo?.cores || '0'} Threads</h3>
                        </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-6 space-y-4 hover:bg-white/[0.04] transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <HardDrive className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">System Memory</p>
                            <h3 className="text-lg font-bold">{systemInfo?.memoryTotalGB || '0'} GB RAM</h3>
                        </div>
                    </div>
                </div>

                {/* Status Section */}
                <div className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black italic tracking-tight">BRIDGE CONNECTION</h2>
                            <p className="text-xs text-muted-foreground font-medium">Native hardware acceleration is enabled and ready.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50">Local Services</h4>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-sm font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                    Remotion Bundler & Renderer
                                </li>
                                <li className="flex items-center gap-3 text-sm font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                    FFmpeg / FFprobe Pipeline
                                </li>
                                <li className="flex items-center gap-3 text-sm font-medium text-white/40">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                                    Local Whisper AI (Coming Soon)
                                </li>
                            </ul>
                        </div>

                        <div className="bg-black/40 rounded-2xl p-6 border border-white/5 flex flex-col justify-center items-center text-center space-y-4">
                            <Layout className="w-8 h-8 text-white/20" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                To start designing, open your studio in the browser or connect this engine to your cloud account.
                            </p>
                            <button
                                onClick={() => window.open('http://localhost:3000', '_blank')}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Open Web Dashboard <ExternalLink className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="pt-12 text-center">
                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.3em] opacity-20">
                        Handcrafted for Professional Video Automation
                    </p>
                </footer>

                {/* First-time Windows Notice Modal */}
                {showNotice && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-[#0A0A0B] border border-white/10 rounded-[32px] p-8 max-w-sm w-full shadow-2xl space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                    <ShieldCheck className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-black italic tracking-tight uppercase leading-none">First-time <br /> Notice</h3>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[13px] text-white/60 leading-relaxed font-medium">
                                    Windows may show a security prompt for new apps.
                                    <span className="text-white font-bold ml-1">TSX Studio runs fully offline</span> and does not access your data.
                                </p>
                                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                                    <p className="text-[10px] font-medium text-blue-400/80 leading-relaxed">
                                        Click <span className="text-white font-bold">"More info"</span> → <span className="text-white font-bold">"Run anyway"</span> to continue safely.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2 flex flex-col gap-2">
                                <button
                                    onClick={() => dismissNotice(true)}
                                    className="w-full h-12 bg-white text-black font-black italic uppercase text-[10px] tracking-widest rounded-xl hover:bg-neutral-200 transition-all active:scale-95"
                                >
                                    Don't show this again
                                </button>
                                <button
                                    onClick={() => dismissNotice(false)}
                                    className="w-full h-10 bg-transparent text-white/40 font-bold uppercase text-[9px] tracking-widest rounded-xl hover:text-white transition-colors"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
