import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { videosAPI } from "../lib/api";
import { DashboardLayout } from "../components/DashboardLayout";
import { AddVideoDialog } from "../components/AddVideoDialog";
import { VideoCard } from "../components/VideoCard";
import { Eye, Heart, MessageCircle, Video, Activity } from "lucide-react";

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

export default function CreatorDashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [videos, setVideos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [videosRes, statsRes] = await Promise.all([videosAPI.getAll(), videosAPI.getStats()]);
      setVideos(videosRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <DashboardLayout>
      <div data-testid="creator-dashboard">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white" style={{ fontFamily: 'Manrope, sans-serif' }}
              data-testid="dashboard-title">
              {t("dashboard.title")}
            </h1>
            <p className="text-zinc-500 mt-1">{t("dashboard.welcome")} {user?.name}</p>
          </div>
          <AddVideoDialog onVideoAdded={fetchData} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard icon={Eye} label={t("dashboard.total_views")} value={stats?.total_views || 0} color="bg-indigo-500/15 text-indigo-400" delay="stagger-1" />
          <StatCard icon={Heart} label={t("dashboard.total_likes")} value={stats?.total_likes || 0} color="bg-pink-500/15 text-pink-400" delay="stagger-2" />
          <StatCard icon={MessageCircle} label={t("dashboard.total_comments")} value={stats?.total_comments || 0} color="bg-emerald-500/15 text-emerald-400" delay="stagger-3" />
          <StatCard icon={Video} label={t("dashboard.videos_tracked")} value={stats?.total_videos || 0} color="bg-amber-500/15 text-amber-400" delay="stagger-4" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold tracking-tight text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t("dashboard.your_videos")}
            </h2>
            <span className="text-sm text-zinc-500">{videos.length} {videos.length !== 1 ? t("common.videos") : t("common.video")}</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => <div key={i} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5 h-52 skeleton-pulse" />)}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/30 rounded-xl border border-zinc-800/30">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
                <Activity className="w-7 h-7 text-zinc-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-medium text-zinc-300 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {t("dashboard.no_videos")}
              </h3>
              <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">{t("dashboard.no_videos_desc")}</p>
              <AddVideoDialog onVideoAdded={fetchData} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} onRefresh={fetchData} onDelete={fetchData} cpm={user?.cpm || 0} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
