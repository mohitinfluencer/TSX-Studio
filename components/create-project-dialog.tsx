"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Project name must be at least 2 characters.",
    }),
    resolution: z.string(),
    fps: z.string(),
});

interface CreateProjectDialogProps {
    onSuccess?: () => void;
    children?: React.ReactNode;
}

export function CreateProjectDialog({ onSuccess, children }: CreateProjectDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            resolution: "1080p",
            fps: "30",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: values.name,
                    resolution: values.resolution,
                    fps: parseInt(values.fps),
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.details || error.error || "Failed to create project");
            }

            const project = await res.json();
            toast.success("Project created! Opening studio...");
            setOpen(false);
            form.reset();
            onSuccess?.();
            router.push(`/studio/${project.id}`);
        } catch (error: any) {
            toast.error(error.message || "Failed to create project");
        }
        setIsLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="h-11 px-6 shadow-lg shadow-primary/20">
                        <Plus className="mr-2 w-4 h-4" /> Create Project
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-white/5 bg-card/90 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                        Enter the details for your new animation studio project.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="My Dynamic Animation" className="bg-background/50 border-white/5" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="resolution"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Resolution</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-background/50 border-white/5">
                                                    <SelectValue placeholder="Select resolution" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-card/90 border-white/5 backdrop-blur-xl">
                                                <SelectItem value="1080p">1080p (9:16)</SelectItem>
                                                <SelectItem value="1080p-landscape">1080p (16:9)</SelectItem>
                                                <SelectItem value="1:1">1:1 Square</SelectItem>
                                                <SelectItem value="4k">4K (9:16)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="fps"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>FPS</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-background/50 border-white/5">
                                                    <SelectValue placeholder="Select FPS" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-card/90 border-white/5 backdrop-blur-xl">
                                                <SelectItem value="30">30 FPS</SelectItem>
                                                <SelectItem value="60">60 FPS</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="submit" className="w-full h-11" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create & Open Studio"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
