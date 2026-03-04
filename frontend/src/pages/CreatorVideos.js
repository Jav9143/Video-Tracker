import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { videosAPI } from "../lib/api";
import { DashboardLayout } from "../components/DashboardLayout";
import { AddVideoDialog } from "../components/AddVideoDialog";
import { VideoCard } from "../components/VideoCard";
import { Video, Search } from "lucide-react";
import { Input } from "../components/ui/input";

export default function CreatorVideos() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");

  const fetchVideos = useCallback(async () => {
    try {
      const res = await videosAPI.getAll();
      setVideos(res.data);
    } catch (err) {
      console.error("Failed to fetch videos", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const filtered = videos.filter((v) => {
    const matchSearch = !search || (v.title || "").toLowerCase().includes(search.toLowerCase()) || v.url.toLowerCase().includes(search.toLowerCase());
    const matchPlatform = platformFilter === "all" || v.platform === platformFilter;
    return matchSearch && matchPlatform;
  });

  return (
    <DashboardLayout>
      <div data-testid="creator-videos-page">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t("videos.title")}
            </h1>
            <p className="text-zinc-500 mt-1">{t("videos.subtitle")}</p>
          </div>
          <AddVideoDialog onVideoAdded={fetchVideos} />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input data-testid="video-search-input" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={t("videos.search")}
              className="bg-zinc-950/50 border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 h-10 text-white placeholder:text-zinc-600 pl-10" />
          </div>
          <div className="flex gap-2">
            {["all", "tiktok", "instagram"].map((p) => (
              <button key={p} data-testid={`filter-${p}`} onClick={() => setPlatformFilter(p)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  platformFilter === p ? "bg-zinc-800 text-white border border-zinc-700" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"
                }`}>
                {p === "all" ? t("videos.all") : p === "tiktok" ? "TikTok" : "Instagram"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5 h-52 skeleton-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 rounded-xl border border-zinc-800/30">
            <Video className="w-10 h-10 text-zinc-600 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-zinc-400">{search || platformFilter !== "all" ? t("videos.no_match") : t("videos.no_videos")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((video) => (
              <VideoCard key={video.id} video={video} onRefresh={fetchVideos} onDelete={fetchVideos} cpm={user?.cpm || 0} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
