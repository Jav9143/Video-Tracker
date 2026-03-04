import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { videosAPI } from "../lib/api";
import { useI18n } from "../contexts/I18nContext";
import { toast } from "sonner";
import { Plus, Link as LinkIcon, Loader2, Calendar } from "lucide-react";

export const AddVideoDialog = ({ onVideoAdded }) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [publishedDate, setPublishedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  const detectPlatform = (url) => {
    if (url.includes("tiktok.com")) return "tiktok";
    if (url.includes("instagram.com")) return "instagram";
    return null;
  };

  const platform = detectPlatform(url);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    if (!platform) {
      toast.error(t("add.url_only"));
      return;
    }

    setLoading(true);
    try {
      const pubDate = new Date(publishedDate).toISOString();
      await videosAPI.add(url, pubDate);
      toast.success(t("add.success"));
      setUrl("");
      setPublishedDate(() => new Date().toISOString().split("T")[0]);
      setOpen(false);
      onVideoAdded?.();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="add-video-btn"
          className="bg-white text-black hover:bg-zinc-200 font-medium active:scale-[0.98] transition-transform">
          <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
          {t("add.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {t("add.title")}
          </DialogTitle>
          <DialogDescription className="text-zinc-500 text-sm">
            {t("add.description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          <div className="space-y-2">
            <Label className="text-zinc-300 text-sm">{t("add.url_label")}</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input data-testid="video-url-input" value={url} onChange={(e) => setUrl(e.target.value)}
                placeholder={t("add.url_placeholder")}
                className="bg-zinc-950/50 border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 h-11 text-white placeholder:text-zinc-600 pl-10"
                required />
            </div>
            {url && (
              <div className="flex items-center gap-2 mt-2">
                {platform ? (
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                    platform === "tiktok" ? "platform-tiktok" : "platform-instagram"
                  }`}>
                    {platform === "tiktok" ? "TikTok" : "Instagram"}
                  </span>
                ) : (
                  <span className="text-xs text-red-400">{t("add.url_only")}</span>
                )}
              </div>
            )}
          </div>

          {/* Published date */}
          <div className="space-y-2">
            <Label className="text-zinc-300 text-sm">{t("add.published_date")}</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                data-testid="video-published-date-input"
                type="date"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
                required
                className="bg-zinc-950/50 border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 h-11 text-white placeholder:text-zinc-600 pl-10 [color-scheme:dark]"
              />
            </div>
            <p className="text-xs text-zinc-600">{t("add.published_date_hint")}</p>
          </div>

          <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-800/50">
            <p className="text-xs text-zinc-500 leading-relaxed">{t("add.hint")}</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}
              className="flex-1 h-11 text-zinc-400 hover:text-white hover:bg-zinc-800" data-testid="cancel-add-video-btn">
              {t("add.cancel")}
            </Button>
            <Button type="submit" disabled={loading || !platform}
              className="flex-1 h-11 bg-white text-black hover:bg-zinc-200 font-medium disabled:opacity-50 active:scale-[0.98] transition-transform"
              data-testid="submit-video-btn">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("add.adding")}
                </span>
              ) : (
                t("add.submit")
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
