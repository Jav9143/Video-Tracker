import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../contexts/I18nContext";
import { adminAPI } from "../lib/api";
import { DashboardLayout } from "../components/DashboardLayout";
import { Eye, Heart, Video, ChevronRight, Users, Search, DollarSign } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";

const formatNumber = (num) => {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

export default function AdminCreators() {
  const { t, lang } = useI18n();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cpmDialog, setCpmDialog] = useState(null);
  const [cpmValue, setCpmValue] = useState("");
  const [savingCpm, setSavingCpm] = useState(false);
  const navigate = useNavigate();

  const fetchCreators = useCallback(async () => {
    try {
      const res = await adminAPI.getCreators();
      setCreators(res.data);
    } catch (err) {
      console.error("Failed to fetch creators", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCreators(); }, [fetchCreators]);

  const filtered = creators.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  const openCpmDialog = (creator, e) => {
    e.stopPropagation();
    setCpmDialog(creator);
    setCpmValue(creator.cpm?.toString() || "0");
  };

  const saveCpm = async () => {
    if (!cpmDialog) return;
    setSavingCpm(true);
    try {
      await adminAPI.setCPM(cpmDialog.id, parseFloat(cpmValue) || 0);
      toast.success(t("creators.cpm_updated"));
      setCpmDialog(null);
      fetchCreators();
    } catch (err) {
      toast.error("Failed to update CPM");
    } finally {
      setSavingCpm(false);
    }
  };

  return (
    <DashboardLayout>
      <div data-testid="admin-creators-page">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t("creators.title")}
            </h1>
            <p className="text-zinc-500 mt-1">{t("creators.subtitle")}</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input data-testid="creator-search-input" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={t("creators.search")}
              className="bg-zinc-950/50 border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 h-10 text-white placeholder:text-zinc-600 pl-10" />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-zinc-900/50 rounded-lg skeleton-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 rounded-xl border border-zinc-800/30">
            <Users className="w-10 h-10 text-zinc-600 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-zinc-400">{search ? t("creators.no_match") : t("creators.no_creators")}</p>
          </div>
        ) : (
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800/50 hover:bg-transparent">
                  <TableHead className="text-zinc-500 font-medium">{t("nav.creators")}</TableHead>
                  <TableHead className="text-zinc-500 font-medium">{t("nav.videos")}</TableHead>
                  <TableHead className="text-zinc-500 font-medium">{t("video.views")}</TableHead>
                  <TableHead className="text-zinc-500 font-medium">{t("video.likes")}</TableHead>
                  <TableHead className="text-zinc-500 font-medium">{t("creators.cpm")}</TableHead>
                  <TableHead className="text-zinc-500 font-medium">{t("creators.joined")}</TableHead>
                  <TableHead className="text-zinc-500 font-medium w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((creator) => (
                  <TableRow key={creator.id} data-testid={`creator-row-${creator.id}`}
                    onClick={() => navigate(`/admin/creator/${creator.id}`)}
                    className="border-zinc-800/30 table-row-hover cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-300">
                          {creator.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-zinc-200">{creator.name}</div>
                          <div className="text-xs text-zinc-500">{creator.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-zinc-300">
                        <Video className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />
                        {creator.stats?.total_videos || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-zinc-300">
                        <Eye className="w-3.5 h-3.5 text-indigo-400" strokeWidth={1.5} />
                        {formatNumber(creator.stats?.total_views)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-zinc-300">
                        <Heart className="w-3.5 h-3.5 text-pink-400" strokeWidth={1.5} />
                        {formatNumber(creator.stats?.total_likes)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={(e) => openCpmDialog(creator, e)}
                        data-testid={`set-cpm-${creator.id}`}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/50 transition-colors"
                      >
                        <DollarSign className="w-3 h-3" strokeWidth={1.5} />
                        {(creator.cpm || 0).toFixed(2)}
                      </button>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-500">
                      {new Date(creator.created_at).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="w-4 h-4 text-zinc-600" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* CPM Dialog */}
      <Dialog open={!!cpmDialog} onOpenChange={() => setCpmDialog(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t("creators.set_cpm")}
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-sm">
              {cpmDialog?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">{t("creators.cpm_label")}</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  data-testid="cpm-input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={cpmValue}
                  onChange={(e) => setCpmValue(e.target.value)}
                  className="bg-zinc-950/50 border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 h-11 text-white pl-10"
                />
              </div>
            </div>
            <Button
              onClick={saveCpm}
              disabled={savingCpm}
              data-testid="save-cpm-btn"
              className="w-full h-11 bg-white text-black hover:bg-zinc-200 font-medium active:scale-[0.98] transition-transform"
            >
              {savingCpm ? "Saving..." : t("creators.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
