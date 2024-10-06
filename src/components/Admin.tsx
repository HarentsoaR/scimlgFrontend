"use client";

import { useEffect, useState } from "react";
import { Bell, BarChart2, Users, FileText, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import UserProfile from "../components/UserProfile";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useRouter, useSearchParams } from "next/navigation";
import AdminPublications from "./AdminPublications";
import AdminUsers from "./AdminUsers";
import AdminStatistics from "./AdminStatistics";

export default function Admin() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, user } = useAuth();
    const [currentView, setCurrentView] = useState('statistics');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    useEffect(() => {
        const view = searchParams.get('view');
        if (view) {
            setCurrentView(view);
        }
    }, [searchParams]);

    const renderMainContent = () => {
        switch (currentView) {
            case 'users':
                return <AdminUsers />;
            case 'publications':
                return <AdminPublications />;
            case 'statistics':
            default:
                return <AdminStatistics />;
        }
    };

    const renderSidebar = () => (
        <Card>
            <CardHeader>
                <CardTitle>Admin Panel</CardTitle>
            </CardHeader>
            <CardContent>
                <nav className="flex flex-col space-y-2">
                    <a href="#" className={`flex items-center space-x-2 text-sm ${currentView === 'statistics' ? 'text-primary' : 'text-muted-foreground'}`} onClick={() => setCurrentView('statistics')}>
                        <BarChart2 className="h-4 w-4" />
                        <span>Statistics</span>
                    </a>
                    <a href="#" className={`flex items-center space-x-2 text-sm ${currentView === 'users' ? 'text-primary' : 'text-muted-foreground'}`} onClick={() => setCurrentView('users')}>
                        <Users className="h-4 w-4" />
                        <span>Users</span>
                    </a>
                    <a href="#" className={`flex items-center space-x-2 text-sm ${currentView === 'publications' ? 'text-primary' : 'text-muted-foreground'}`} onClick={() => setCurrentView('publications')}>
                        <FileText className="h-4 w-4" />
                        <span>Publications</span>
                    </a>
                    <a href="#" className={`flex items-center space-x-2 text-sm ${currentView === 'settings' ? 'text-primary' : 'text-muted-foreground'}`} onClick={() => setCurrentView('settings')}>
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                    </a>
                </nav>
            </CardContent>
        </Card>
    );

    return (
        <div className={`min-h-screen bg-background w-full ${isNotificationsOpen ? 'blur' : ''}`}>
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center p-5">
                    <div className="mr-4 hidden md:flex">
                        <span className="hidden font-bold sm:inline-block mr-10">Admin Panel</span>
                        <nav className="flex items-center space-x-6 text-sm font-medium">
                            <a className={`transition-colors hover:text-foreground/80 ${currentView === 'statistics' ? 'text-foreground' : 'text-foreground/60'}`} href="dashboard">Dashboard</a>
                            <a className={`transition-colors hover:text-foreground/80 ${currentView === 'statistics' ? 'text-foreground' : 'text-foreground/60'}`} href="#" onClick={() => setCurrentView('statistics')}>Statistics</a>
                            <a className={`transition-colors hover:text-foreground/80 ${currentView === 'users' ? 'text-foreground' : 'text-foreground/60'}`} href="#" onClick={() => setCurrentView('users')}>Users</a>
                            <a className={`transition-colors hover:text-foreground/80 ${currentView === 'publications' ? 'text-foreground' : 'text-foreground/60'}`} href="#" onClick={() => setCurrentView('publications')}>Publications</a>
                        </nav>
                    </div>
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="mr-2 md:hidden">
                                <Menu className="h-4 w-4" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                            <nav className="flex flex-col space-y-4">
                                <a className={`flex items-center space-x-2 ${currentView === 'statistics' ? 'text-primary' : ''}`} href="#" onClick={() => { setCurrentView('statistics'); setIsMobileMenuOpen(false); }}>
                                    <BarChart2 className="h-4 w-4" />
                                    <span>Statistics</span>
                                </a>
                                <a className={`flex items-center space-x-2 ${currentView === 'users' ? 'text-primary' : ''}`} href="#" onClick={() => { setCurrentView('users'); setIsMobileMenuOpen(false); }}>
                                    <Users className="h-4 w-4" />
                                    <span>Users</span>
                                </a>
                                <a className={`flex items-center space-x-2 ${currentView === 'publications' ? 'text-primary' : ''}`} href="#" onClick={() => { setCurrentView('publications'); setIsMobileMenuOpen(false); }}>
                                    <FileText className="h-4 w-4" />
                                    <span>Publications</span>
                                </a>
                                <a className={`flex items-center space-x-2 ${currentView === 'settings' ? 'text-primary' : ''}`} href="#" onClick={() => { setCurrentView('settings'); setIsMobileMenuOpen(false); }}>
                                    <Settings className="h-4 w-4" />
                                    <span>Settings</span>
                                </a>
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end"> 
                        <UserProfile />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto mt-4 grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
                {/* Sidebar */}
                <aside className="hidden md:block">
                    {renderSidebar()}
                </aside>

                {/* Dynamic Content */}
                <section className="md:col-span-2">
                    {renderMainContent()}
                </section>
            </main>
        </div>
    );
}
