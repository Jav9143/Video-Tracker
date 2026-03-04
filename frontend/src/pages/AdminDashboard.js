import { useState, useEffect, useCallback } from "react";
import { useI18n } from "../contexts/I18nContext";
import { adminAPI } from "../lib/api";
import { DashboardLayout } from "../components/DashboardLayout";
import { Eye, Heart, Users, Video } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <div className={`stat-card bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5 animate-fade-in ${delay}`}>
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" strokeWidth={1.5} />
      </div>
      <span className="text-sm text-zinc-400">{label}</span>
    </div>
    <div className="text-2xl font-bold text-white number-display" style={{ fontFamily: 'Manrope, sans-serif' }}>
      {typeof value === "number" ? value.toLocaleString() : value}
    </div>
  </div>
);

const PLATFORM_COLORS = { tiktok: "#ff0050", instagram: "#e1306c" };

export default function AdminDashboard() {
  const { t } = useI18n();
  const [stats, setStats] = useState(null);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, creatorsRes] = await Promise.all([adminAPI.getStats(), adminAPI.getCreators()]);
      setStats(statsRes.data);
      setCreators(creatorsRes.data);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const platformData = stats?.platforms
    ? Object.entries(stats.platforms).map(([name, data]) => ({
        name: name === "tiktok" ? "TikTok" : "Instagram",
        videos: data.count,
        views: data.views,
        likes: data.likes,
        fill: PLATFORM_COLORS[name] || "#6366f1",
      }))
    : [];

  const topCreators = [...creators]
    .sort((a, b) => (b.stats?.total_views || 0) - (a.stats?.total_views || 0))
    .slice(0, 5)
    .map((c) => ({ name: c.name, views: c.stats?.total_views || 0, videos: c.stats?.total_videos || 0 }));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-10 w-48 bg-zinc-800/50 rounded-lg skeleton-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-zinc-900/50 rounded-xl skeleton-pulse" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div data-testid="admin-dashboard">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {t("admin.title")}
          </h1>
          <p className="text-zinc-500 mt-1">{t("admin.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard icon={Users} label={t("admin.total_creators")} value={stats?.total_creators || 0} color="bg-indigo-500/15 text-indigo-400" delay="stagger-1" />
          <StatCard icon={Video} label={t("admin.total_videos")} value={stats?.total_videos || 0} color="bg-amber-500/15 text-amber-400" delay="stagger-2" />
          <StatCard icon={Eye} label={t("admin.total_views")} value={stats?.total_views || 0} color="bg-emerald-500/15 text-emerald-400" delay="stagger-3" />
          <StatCard icon={Heart} label={t("admin.total_likes")} value={stats?.total_likes || 0} color="bg-pink-500/15 text-pink-400" delay="stagger-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t("admin.platform_breakdown")}
            </h3>
            {platformData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={platformData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="videos" nameKey="name" stroke="none">
                    {platformData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa' }} itemStyle={{ color: '#a1a1aa' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-zinc-500 text-sm">{t("admin.no_data")}</div>
            )}
            <div className="flex justify-center gap-6 mt-2">
              {platformData.map((p) => (
                <div key={p.name} className="flex items-center gap-2 text-sm text-zinc-400">
                  <div className="w-3 h-3 rounded-full" style={{ background: p.fill }} />
                  {p.name}: {p.videos} {t("admin.videos_label")}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t("admin.top_creators")}
            </h3>
            {topCreators.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topCreators} layout="vertical" margin={{ left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis type="number" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} width={80} />
                  <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa' }} itemStyle={{ color: '#a1a1aa' }} />
                  <Bar dataKey="views" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-zinc-500 text-sm">{t("admin.no_creators")}</div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
