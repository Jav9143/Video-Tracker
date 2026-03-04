import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { useLocation, Link } from "react-router-dom";
import { Activity, LayoutDashboard, Video, Users, LogOut, BarChart3, Globe, UserCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { t, lang, toggleLang } = useI18n();
  const location = useLocation();

  const isAdmin = user?.role === "admin";

  const creatorLinks = [
    { to: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { to: "/dashboard/videos", label: t("nav.videos"), icon: Video },
    { to: "/dashboard/accounts", label: t("nav.accounts"), icon: UserCircle },
  ];

  const adminLinks = [
    { to: "/admin", label: t("nav.overview"), icon: BarChart3 },
    { to: "/admin/creators", label: t("nav.creators"), icon: Users },
  ];

  const links = isAdmin ? adminLinks : creatorLinks;

  const isActive = (path) => {
    if (path === "/dashboard" && location.pathname === "/dashboard") return true;
    if (path === "/admin" && location.pathname === "/admin") return true;
    if (path !== "/dashboard" && path !== "/admin" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside data-testid="sidebar"
        className="fixed left-0 top-0 bottom-0 w-64 border-r border-zinc-800 bg-zinc-950/50 backdrop-blur-xl z-40 flex flex-col">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-zinc-800/50">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Activity className="w-4 h-4 text-indigo-400" strokeWidth={1.5} />
          </div>
          <span className="text-lg font-bold tracking-tight text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
            VidTrack
          </span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          <div className="px-3 mb-4">
            <span className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider">
              {isAdmin ? t("nav.administration") : t("nav.content")}
            </span>
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Tooltip key={link.to}>
                <TooltipTrigger asChild>
                  <Link to={link.to}
                    data-testid={`sidebar-link-${link.to.split("/").pop()}`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                      active ? "bg-zinc-800/70 text-white sidebar-link-active" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                    }`}>
                    <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                    {link.label}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="lg:hidden">{link.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Language toggle */}
        <div className="px-3 pb-2">
          <button onClick={toggleLang} data-testid="lang-toggle-sidebar"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors">
            <Globe className="w-[18px] h-[18px]" strokeWidth={1.5} />
            {lang === "en" ? "Español" : "English"}
          </button>
        </div>

        <div className="border-t border-zinc-800/50 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-300">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-zinc-200 truncate">{user?.name}</div>
              <div className="text-xs text-zinc-500 truncate">{user?.email}</div>
            </div>
          </div>
          <button onClick={logout} data-testid="logout-btn"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            {t("nav.signout")}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
};
