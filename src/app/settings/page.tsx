import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { User, Shield, Bell, Palette, Trash2, Save } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="p-8 space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account and studio preferences.</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-card/50 border border-white/5 p-1">
                    <TabsTrigger value="profile" className="gap-2"><User className="w-4 h-4" /> Profile</TabsTrigger>
                    <TabsTrigger value="preferences" className="gap-2"><Palette className="w-4 h-4" /> Preferences</TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2"><Bell className="w-4 h-4" /> Notifications</TabsTrigger>
                    <TabsTrigger value="security" className="gap-2"><Shield className="w-4 h-4" /> Security</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                    <Card className="border-white/5 bg-card/30 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal details and public profile.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input defaultValue="John" className="bg-background/50 border-white/5" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input defaultValue="Doe" className="bg-background/50 border-white/5" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input defaultValue="john@example.com" disabled className="bg-white/5 border-white/5 text-muted-foreground" />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t border-white/5 pt-6 bg-white/5">
                            <Button className="ml-auto gap-2">
                                <Save className="w-4 h-4" /> Save Changes
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-6">
                    <Card className="border-white/5 bg-card/30 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle>Studio Defaults</CardTitle>
                            <CardDescription>Set default values for new project creation.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Default Resolution</p>
                                    <p className="text-xs text-muted-foreground">The standard quality for new projects.</p>
                                </div>
                                <Select defaultValue="1080p">
                                    <SelectTrigger className="w-40 bg-background/50 border-white/5">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card/90 backdrop-blur-xl border-white/5">
                                        <SelectItem value="720p">720p (HD)</SelectItem>
                                        <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                                        <SelectItem value="4k">4K (Ultra HD)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Separator className="bg-white/5" />
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Auto-format on Save</p>
                                    <p className="text-xs text-muted-foreground">Automatically run Prettier when saving a version.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator className="bg-white/5" />
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Dark Mode Appearance</p>
                                    <p className="text-xs text-muted-foreground">Toggle between studio themes.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                    <Card className="border-destructive/20 bg-destructive/5">
                        <CardHeader>
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                            <CardDescription>Permanently delete your account and all projects.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Deleting your account will remove all project history, versions, and assets. This action is irreversible.
                            </p>
                            <Button variant="destructive" className="gap-2">
                                <Trash2 className="w-4 h-4" /> Delete Account
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
