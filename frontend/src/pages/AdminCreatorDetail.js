import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useI18n } from "../contexts/I18nContext";
import { adminAPI } from "../lib/api";
import { DashboardLayout } from "../components/DashboardLayout";
import { VideoCard } from "../components/VideoCard";
import { ArrowLeft, Eye, Heart, MessageCircle, Video, Mail, DollarSign, Loader2, ExternalLink } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";

export default function AdminCreatorDetail() {
  const { creatorId } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const [creator, setCreator] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cpmValue, setCpmValue] = useState("");
  const [savingCpm, setSavingCpm] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await adminAPI.getCreatorVideos(creatorId);
      setCreator(res.data.creator);
      setVideos(res.data.videos);
      setCpmValue((res.data.creator?.cpm || 0).toString());
    } catch (err) {
      console.error("Failed to fetch creator data", err);
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const cpm = creator?.cpm || 0;
  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
  const totalLikes = videos.reduce((sum, v) => sum + (v.likes || 0), 0);
  const totalComments = videos.reduce((sum, v) => sum + (v.comments || 0), 0);
  const totalPayout = (totalViews / 1000) * cpm;
  const pendingPayout = videos
    .filter((v) => v.payment_status !== "paid")
    .reduce((sum, v) => sum + ((v.views || 0) / 1000) * cpm, 0);

  const saveCpm = async () => {
    setSavingCpm(true);
    try {
      await adminAPI.setCPM(creatorId, parseFloat(cpmValue) || 0);
      toast.success(t("creators.cpm_updated"));
      fetchData();
    } catch (err) {
      toast.error("Failed to update CPM");
    } finally {
      setSavingCpm(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-8 w-32 bg-zinc-800/50 rounded skeleton-pulse" />
          <div className="h-32 bg-zinc-900/50 rounded-xl skeleton-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div data-testid="admin-creator-detail">
        <button onClick={() => navigate("/admin/creators")} data-testid="back-to-creators-btn"
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          {t("detail.back")}
        </button>

        {/* Creator info header */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-bold text-zinc-300">
                {creator?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {creator?.name}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-zinc-500">
                  <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {creator?.email}
                </div>
                {/* Social accounts */}
                {creator?.social_accounts?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {creator.social_accounts.map((acc, i) => (
                      <a key={i} href={acc.url} target="_blank" rel="noopener noreferrer"
                        data-testid={`creator-social-${i}`}
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                          acc.platform === "tiktok" ? "platform-tiktok hover:bg-black/40" : "platform-instagram hover:bg-black/40"
                        }`}>
                        <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                        {acc.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CPM Setting */}
            <div className="bg-zinc-800/40 rounded-lg p-4 border border-zinc-800/50 min-w-[200px]">
              <Label className="text-xs text-zinc-500 mb-2 block">{t("detail.cpm_setting")}</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <Input
                    data-testid="detail-cpm-input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={cpmValue}
                    onChange={(e) => setCpmValue(e.target.value)}
                    className="bg-zinc-950/50 border-zinc-700 focus:border-indigo-500 h-9 text-white text-sm pl-8"
                  />
                </div>
                <Button onClick={saveCpm} disabled={savingCpm} data-testid="detail-save-cpm-btn"
                  className="h-9 px-3 bg-white text-black hover:bg-zinc-200 text-sm font-medium active:scale-[0.98] transition-transform">
                  {savingCpm ? <Loader2 className="w-4 h-4 animate-spin" /> : t("creators.save")}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-zinc-800/40 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Video className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
                <span className="text-xs text-zinc-500">{t("detail.videos_count")}</span>
              </div>
              <div className="text-xl font-bold text-white number-display">{videos.length}</div>
            </div>
            <div className="bg-zinc-800/40 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4 text-indigo-400" strokeWidth={1.5} />
                <span className="text-xs text-zinc-500">{t("video.views")}</span>
              </div>
              <div className="text-xl font-bold text-white number-display">{totalViews.toLocaleString()}</div>
            </div>
            <div className="bg-zinc-800/40 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-pink-400" strokeWidth={1.5} />
                <span className="text-xs text-zinc-500">{t("video.likes")}</span>
              </div>
              <div className="text-xl font-bold text-white number-display">{totalLikes.toLocaleString()}</div>
            </div>
            <div className="bg-zinc-800/40 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                <span className="text-xs text-zinc-500">{t("video.comments")}</span>
              </div>
              <div className="text-xl font-bold text-white number-display">{totalComments.toLocaleString()}</div>
            </div>
            <div className="bg-zinc-800/40 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-400" strokeWidth={1.5} />
                <span className="text-xs text-zinc-500">{t("detail.total_payout")}</span>
              </div>
              <div className="text-xl font-bold text-white number-display">${totalPayout.toFixed(2)}</div>
            </div>
            <div className="bg-zinc-800/40 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
                <span className="text-xs text-zinc-500">{t("detail.pending_payout")}</span>
              </div>
              <div className="text-xl font-bold text-amber-300 number-display">${pendingPayout.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Videos */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {t("detail.videos_count")} ({videos.length})
          </h2>
          {videos.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/30 rounded-xl border border-zinc-800/30">
              <Video className="w-10 h-10 text-zinc-600 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-zinc-400">{t("detail.no_videos")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} onRefresh={fetchData} onDelete={fetchData} cpm={cpm} isAdmin={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
