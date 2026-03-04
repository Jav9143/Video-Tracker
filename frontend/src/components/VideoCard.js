import { useState } from "react";
import { videosAPI, adminAPI } from "../lib/api";
import { useI18n } from "../contexts/I18nContext";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { Eye, Heart, MessageCircle, Share2, RefreshCw, Trash2, ExternalLink, Clock, CalendarDays, DollarSign, CheckCircle2, Timer, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

const formatNumber = (num) => {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const formatDate = (dateStr, lang) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { day: "numeric", month: "short", year: "numeric" });
};

function getTrackingInfo(video, t) {
  if (!video.published_date) {
    return { status: "no_date", daysLeft: null, label: t("video.no_date") };
  }

  if (video.payment_status === "paid") {
    return { status: "paid", daysLeft: 0, label: t("video.paid") };
  }

  const pubDate = new Date(video.published_date);
  const now = new Date();
  const diffMs = now - pubDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const daysLeft = 7 - diffDays;

  if (daysLeft > 0) {
    return {
      status: "tracking",
      daysLeft,
      label: `${daysLeft} ${daysLeft === 1 ? t("video.day_left") : t("video.days_left")}`,
    };
  }

  return { status: "pending", daysLeft: 0, label: t("video.pending_payment") };
}

function calculatePayment(video, cpm) {
  if (!cpm || cpm <= 0) return 0;
  return (video.views / 1000) * cpm;
}

export const VideoCard = ({ video, onRefresh, onDelete, cpm = 0, isAdmin = false }) => {
  const [refreshing, setRefreshing] = useState(false);
  const { t, lang } = useI18n();
  const { user } = useAuth();

  const trackingInfo = getTrackingInfo(video, t);
  const paymentAmount = calculatePayment(video, cpm);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await videosAPI.refresh(video.id);
      toast.success(t("video.metrics_updated"));
      onRefresh?.();
    } catch (err) {
      toast.error("Failed to refresh metrics");
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await videosAPI.delete(video.id);
      toast.success("Video removed");
      onDelete?.();
    } catch (err) {
      toast.error("Failed to delete video");
    }
  };

  const handleMarkPaid = async () => {
    try {
      await adminAPI.setPaymentStatus(video.id, "paid");
      toast.success(t("video.paid"));
      onRefresh?.();
    } catch (err) {
      toast.error("Failed to update payment");
    }
  };

  const handleMarkPending = async () => {
    try {
      await adminAPI.setPaymentStatus(video.id, "pending");
      toast.success(t("video.pending_payment"));
      onRefresh?.();
    } catch (err) {
      toast.error("Failed to update payment");
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div data-testid={`video-card-${video.id}`}
        className="group relative bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors">
        <div className="p-5">
          {/* Header row */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {video.thumbnail_url ? (
                <img src={video.thumbnail_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-zinc-800 flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5 text-zinc-600" />
                </div>
              )}
              <div className="min-w-0">
                <h4 className="text-sm font-medium text-zinc-200 truncate max-w-[200px]">
                  {video.title || "Untitled Video"}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                    video.platform === "tiktok" ? "platform-tiktok" : "platform-instagram"
                  }`}>
                    {video.platform === "tiktok" ? "TikTok" : "Instagram"}
                  </span>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-300"
                  data-testid={`video-menu-${video.id}`}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300">
                <DropdownMenuItem onClick={handleRefresh} className="hover:bg-zinc-800 cursor-pointer"
                  data-testid={`refresh-video-${video.id}`}>
                  <RefreshCw className="w-4 h-4 mr-2" /> {t("video.refresh_metrics")}
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-zinc-800 cursor-pointer">
                  <a href={video.url} target="_blank" rel="noopener noreferrer" data-testid={`open-video-${video.id}`}>
                    <ExternalLink className="w-4 h-4 mr-2" /> {t("video.open_original")}
                  </a>
                </DropdownMenuItem>
                {isAdmin && trackingInfo.status === "pending" && (
                  <>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem onClick={handleMarkPaid} className="hover:bg-emerald-500/10 text-emerald-400 cursor-pointer"
                      data-testid={`mark-paid-${video.id}`}>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> {t("video.mark_paid")}
                    </DropdownMenuItem>
                  </>
                )}
                {isAdmin && trackingInfo.status === "paid" && (
                  <>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem onClick={handleMarkPending} className="hover:bg-amber-500/10 text-amber-400 cursor-pointer"
                      data-testid={`mark-pending-${video.id}`}>
                      <AlertCircle className="w-4 h-4 mr-2" /> {t("video.mark_pending")}
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem onClick={handleDelete} className="hover:bg-red-500/10 text-red-400 cursor-pointer"
                  data-testid={`delete-video-${video.id}`}>
                  <Trash2 className="w-4 h-4 mr-2" /> {t("video.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-4 gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-zinc-800/40 rounded-lg px-3 py-2.5 text-center">
                  <Eye className="w-3.5 h-3.5 text-indigo-400 mx-auto mb-1" strokeWidth={1.5} />
                  <div className="text-sm font-semibold text-white number-display">{formatNumber(video.views)}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{t("video.views")}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>{video.views?.toLocaleString() || 0} {t("video.views").toLowerCase()}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-zinc-800/40 rounded-lg px-3 py-2.5 text-center">
                  <Heart className="w-3.5 h-3.5 text-pink-400 mx-auto mb-1" strokeWidth={1.5} />
                  <div className="text-sm font-semibold text-white number-display">{formatNumber(video.likes)}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{t("video.likes")}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>{video.likes?.toLocaleString() || 0} {t("video.likes").toLowerCase()}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-zinc-800/40 rounded-lg px-3 py-2.5 text-center">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" strokeWidth={1.5} />
                  <div className="text-sm font-semibold text-white number-display">{formatNumber(video.comments)}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{t("video.comments")}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>{video.comments?.toLocaleString() || 0}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-zinc-800/40 rounded-lg px-3 py-2.5 text-center">
                  <Share2 className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" strokeWidth={1.5} />
                  <div className="text-sm font-semibold text-white number-display">{formatNumber(video.shares)}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{t("video.shares")}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>{video.shares?.toLocaleString() || 0}</TooltipContent>
            </Tooltip>
          </div>

          {/* Published date + Payment status row */}
          <div className="mt-4 pt-3 border-t border-zinc-800/50 space-y-2.5">
            {/* Published date */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <CalendarDays className="w-3 h-3" strokeWidth={1.5} />
                <span>{t("video.published")} {video.published_date ? formatDate(video.published_date, lang) : t("video.no_date")}</span>
              </div>
              {/* Tracking countdown or status */}
              <div className="flex items-center gap-1.5">
                {trackingInfo.status === "tracking" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    <Timer className="w-3 h-3" strokeWidth={1.5} />
                    {trackingInfo.label}
                  </span>
                )}
                {trackingInfo.status === "pending" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30"
                    data-testid={`payment-pending-${video.id}`}>
                    <AlertCircle className="w-3 h-3" strokeWidth={1.5} />
                    {trackingInfo.label}
                  </span>
                )}
                {trackingInfo.status === "paid" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    data-testid={`payment-paid-${video.id}`}>
                    <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />
                    {trackingInfo.label}
                  </span>
                )}
                {trackingInfo.status === "no_date" && (
                  <span className="text-[10px] text-zinc-600">{t("video.no_date")}</span>
                )}
              </div>
            </div>

            {/* Payment amount */}
            {cpm > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <DollarSign className="w-3 h-3" strokeWidth={1.5} />
                  <span>{t("video.payment")} <span className="text-white font-semibold number-display">${paymentAmount.toFixed(2)}</span></span>
                </div>
                <span className="text-[10px] text-zinc-600">CPM: ${cpm.toFixed(2)}</span>
              </div>
            )}

            {/* Last tracked + refresh */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Clock className="w-3 h-3" strokeWidth={1.5} />
                <span>{t("video.tracked")} {formatDate(video.last_tracked_at, lang)}</span>
              </div>
              <button onClick={handleRefresh} disabled={refreshing} data-testid={`quick-refresh-${video.id}`}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-indigo-400 transition-colors disabled:opacity-50">
                <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} strokeWidth={1.5} />
                {refreshing ? t("video.updating") : t("video.refresh")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
