import { LayoutDashboard, Users, Store, BarChart3, Settings, Bell, Search, Menu, LogOut, PackageSearch } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";

const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/dashboard/orders", icon: PackageSearch },
    { name: "Customers", href: "/dashboard/customers", icon: Users },
    { name: "Shops", href: "/dashboard/shops", icon: Store },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (c: boolean) => void }) {
    const pathname = usePathname();

    return (
        <div className={cn(
            "flex flex-col h-screen bg-primary border-r border-white/10 transition-all duration-300 z-50",
            collapsed ? "w-20" : "w-64"
        )}>
            <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
                {!collapsed && (
                    <div className="relative w-32 h-10 flex items-center">
                        <Image
                            src="/logo.png"
                            alt="MyPressWala Logo"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    aria-expanded={!collapsed}
                    className={cn(
                        "p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95",
                        collapsed && "mx-auto"
                    )}
                >
                    <Menu className="w-5 h-5" aria-hidden="true" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3" aria-label="Main Navigation">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                aria-current={isActive ? "page" : undefined}
                                className={cn(
                                    "flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all group relative overflow-hidden",
                                    isActive
                                        ? "bg-secondary/20 text-secondary"
                                        : "text-white/70 hover:bg-white/5 hover:text-white active:scale-[0.98]"
                                )}
                                title={collapsed ? item.name : undefined}
                            >
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-r from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity",
                                    isActive && "opacity-100 from-secondary/0 to-secondary/10"
                                )} />
                                <item.icon
                                    className={cn(
                                        "flex-shrink-0 transition-transform group-hover:scale-110 duration-300 relative z-10",
                                        collapsed ? "w-6 h-6 mx-auto" : "w-5 h-5 mr-3",
                                        isActive ? "text-secondary" : "text-white/50 group-hover:text-white"
                                    )}
                                    aria-hidden="true"
                                />
                                {!collapsed && <span className="relative z-10 transition-transform group-hover:translate-x-1">{item.name}</span>}

                                {/* Active indicator line */}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-secondary rounded-r-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-white/10">
                <button
                    aria-label="Logout"
                    className={cn(
                        "flex items-center w-full rounded-lg px-3 py-3 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-red-400 transition-all active:scale-[0.98] group relative overflow-hidden",
                        collapsed ? "justify-center" : ""
                    )}
                >
                    <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/10 transition-colors" />
                    <LogOut className={cn("flex-shrink-0 w-5 h-5 transition-transform group-hover:-translate-x-1 relative z-10", !collapsed && "mr-3")} aria-hidden="true" />
                    {!collapsed && <span className="relative z-10">Logout</span>}
                </button>
            </div>
        </div>
    );
}
