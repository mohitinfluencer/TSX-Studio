import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Layout, Type, Smile, BarChart3, Clock, ArrowUpRight } from "lucide-react";

const templates = [
    {
        id: "viral-captions",
        name: "Viral Captions",
        description: "Multi-line dynamic captions with pop animations.",
        type: "Overlay",
        icon: <Type className="w-5 h-5" />,
        color: "from-blue-500/20 to-indigo-500/20",
        tags: ["Social Media", "Video"]
    },
    {
        id: "word-highlight",
        name: "Word Highlight",
        description: "Sync captions where each word pops as it is spoken.",
        type: "Captions",
        icon: <Sparkles className="w-5 h-5" />,
        color: "from-amber-500/20 to-orange-500/20",
        tags: ["Dynamic", "Text"]
    },
    {
        id: "lower-third",
        name: "Modern Lower Third",
        description: "Professional glassmorphic identification bars.",
        type: "Overlay",
        icon: <Layout className="w-5 h-5" />,
        color: "from-emerald-500/20 to-teal-500/20",
        tags: ["Professional", "Identity"]
    },
    {
        id: "emoji-pop",
        name: "Emoji Pop Overlays",
        description: "React to moments with floating, animated emojis.",
        type: "Overlay",
        icon: <Smile className="w-5 h-5" />,
        color: "from-pink-500/20 to-rose-500/20",
        tags: ["Interactive", "Fun"]
    },
    {
        id: "data-charts",
        name: "Simple Charts",
        description: "Animated bars and lines representing live data.",
        type: "Graphics",
        icon: <BarChart3 className="w-5 h-5" />,
        color: "from-violet-500/20 to-purple-500/20",
        tags: ["Data", "Visualization"]
    },
    {
        id: "progress-bars",
        name: "Viral Progress Bars",
        description: "Highly visible top/bottom progress tracking.",
        type: "Overlay",
        icon: <Clock className="w-5 h-5" />,
        color: "from-slate-500/20 to-grey-500/20",
        tags: ["Retention", "UI"]
    }
];

export default function TemplatesPage() {
    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Templates Library</h1>
                <p className="text-muted-foreground">Start with a professional base and customize with your code.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                    <Card key={template.id} className="group border-white/5 bg-card/30 backdrop-blur-xl hover:border-primary/20 transition-all overflow-hidden">
                        <div className={`aspect-video bg-gradient-to-br ${template.color} flex items-center justify-center`}>
                            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                {template.icon}
                            </div>
                        </div>
                        <CardHeader className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="text-[10px] uppercase border-white/10 text-muted-foreground">
                                    {template.type}
                                </Badge>
                                <div className="flex gap-1">
                                    {template.tags.map(tag => (
                                        <span key={tag} className="text-[10px] text-primary/60 font-medium">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <CardTitle className="text-xl font-bold">{template.name}</CardTitle>
                            <CardDescription className="text-sm leading-relaxed mt-2">
                                {template.description}
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="px-6 pb-6 pt-0">
                            <Button className="w-full gap-2 h-10 font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors" variant="outline">
                                Use Template <ArrowUpRight className="w-4 h-4 ml-auto" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Suggest a template CTA */}
            <div className="mt-12 p-8 rounded-2xl border border-white/5 bg-primary/5 text-center">
                <h3 className="text-lg font-bold mb-2">Need a specific template?</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                    We are constantly adding new starter files. Tell us what you want to see next in the library.
                </p>
                <Button variant="link" className="text-primary font-bold">Suggest a Template</Button>
            </div>
        </div>
    );
}
