import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { authAPI } from "../lib/api";
import { DashboardLayout } from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, ExternalLink, UserCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export default function CreatorProfile() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [accounts, setAccounts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await authAPI.me();
      setAccounts(res.data.social_accounts || []);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const addAccount = () => {
    setAccounts([...accounts, { name: "", url: "", platform: "tiktok" }]);
  };

  const removeAccount = (index) => {
    setAccounts(accounts.filter((_, i) => i !== index));
  };

  const updateAccount = (index, field, value) => {
    const updated = [...accounts];
    updated[index] = { ...updated[index], [field]: value };
    setAccounts(updated);
  };

  const handleSave = async () => {
    const valid = accounts.filter((a) => a.name.trim() && a.url.trim());
    setSaving(true);
    try {
      await authAPI.updateProfile({ social_accounts: valid });
      toast.success(t("profile.saved"));
      setAccounts(valid);
    } catch (err) {
      toast.error("Failed to save accounts");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div data-testid="creator-profile-page">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {t("profile.title")}
          </h1>
          <p className="text-zinc-500 mt-1">{t("profile.subtitle")}</p>
        </div>

        <div className="max-w-2xl">
          {/* Accounts list */}
          <div className="space-y-4 mb-6">
            {accounts.length === 0 && loaded && (
              <div className="text-center py-12 bg-zinc-900/30 rounded-xl border border-zinc-800/30">
                <UserCircle className="w-10 h-10 text-zinc-600 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-zinc-400 mb-4">{t("profile.no_accounts")}</p>
                <Button onClick={addAccount} data-testid="add-first-account-btn"
                  className="bg-white text-black hover:bg-zinc-200 font-medium active:scale-[0.98] transition-transform">
                  <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  {t("profile.add_account")}
                </Button>
              </div>
            )}

            {accounts.map((account, index) => (
              <div key={index}
                data-testid={`account-row-${index}`}
                className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                  {/* Platform select */}
                  <div className="sm:col-span-3 space-y-2">
                    <Label className="text-zinc-400 text-xs">{t("profile.platform")}</Label>
                    <Select
                      value={account.platform}
                      onValueChange={(val) => updateAccount(index, "platform", val)}
                    >
                      <SelectTrigger
                        data-testid={`account-platform-${index}`}
                        className="bg-zinc-950/50 border-zinc-800 text-white h-10"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Account name */}
                  <div className="sm:col-span-3 space-y-2">
                    <Label className="text-zinc-400 text-xs">{t("profile.account_name")}</Label>
                    <Input
                      data-testid={`account-name-${index}`}
                      value={account.name}
                      onChange={(e) => updateAccount(index, "name", e.target.value)}
                      placeholder={t("profile.account_name_placeholder")}
                      className="bg-zinc-950/50 border-zinc-800 focus:border-indigo-500 h-10 text-white placeholder:text-zinc-600"
                    />
                  </div>

                  {/* Account URL */}
                  <div className="sm:col-span-5 space-y-2">
                    <Label className="text-zinc-400 text-xs">{t("profile.account_url")}</Label>
                    <Input
                      data-testid={`account-url-${index}`}
                      value={account.url}
                      onChange={(e) => updateAccount(index, "url", e.target.value)}
                      placeholder={t("profile.account_url_placeholder")}
                      className="bg-zinc-950/50 border-zinc-800 focus:border-indigo-500 h-10 text-white placeholder:text-zinc-600"
                    />
                  </div>

                  {/* Remove button */}
                  <div className="sm:col-span-1 flex justify-end">
                    <Button variant="ghost" size="sm"
                      data-testid={`remove-account-${index}`}
                      onClick={() => removeAccount(index)}
                      className="h-10 w-10 p-0 text-zinc-500 hover:text-red-400 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          {(accounts.length > 0 || loaded) && accounts.length > 0 && (
            <div className="flex items-center gap-3">
              <Button onClick={addAccount} variant="ghost" data-testid="add-another-account-btn"
                className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                {t("profile.add_account")}
              </Button>
              <div className="flex-1" />
              <Button onClick={handleSave} disabled={saving} data-testid="save-accounts-btn"
                className="bg-white text-black hover:bg-zinc-200 font-medium active:scale-[0.98] transition-transform">
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  t("profile.save")
                )}
              </Button>
            </div>
          )}

          {accounts.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Preview</h3>
              <div className="flex flex-wrap gap-3">
                {accounts.filter(a => a.name && a.url).map((account, i) => (
                  <a key={i} href={account.url} target="_blank" rel="noopener noreferrer"
                    data-testid={`account-preview-${i}`}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      account.platform === "tiktok"
                        ? "platform-tiktok hover:bg-black/40"
                        : "platform-instagram hover:bg-black/40"
                    }`}>
                    <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {account.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
