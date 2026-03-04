import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, Activity, Globe } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("creator");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();
  const { t, lang, toggleLang } = useI18n();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        const data = await login(email, password);
        toast.success(t("auth.welcome_back"));
        navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
      } else {
        const data = await register(email, password, name, role);
        toast.success(t("auth.account_created"));
        navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="auth-page">
      {/* Language toggle */}
      <button
        onClick={toggleLang}
        data-testid="lang-toggle-auth"
        className="fixed top-5 right-5 z-50 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/60 backdrop-blur border border-zinc-700/50 text-xs text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
      >
        <Globe className="w-3.5 h-3.5" strokeWidth={1.5} />
        {lang === "en" ? "ES" : "EN"}
      </button>

      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{ background: '#09090b' }}>
        <div className="absolute inset-0"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1654198340681-a2e0fc449f1b?crop=entropy&cs=srgb&fm=jpg&q=85)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3
          }}
        />
        <div className="absolute inset-0 auth-bg-overlay" />
        <div className="relative z-10 px-16 max-w-lg">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-indigo-400" strokeWidth={1.5} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
              VidTrack
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {t("brand.tagline")}
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed">
            {t("brand.description")}
          </p>
          <div className="mt-12 flex gap-8">
            <div>
              <div className="text-3xl font-bold text-white number-display">2</div>
              <div className="text-sm text-zinc-500 mt-1">{t("brand.platforms")}</div>
            </div>
            <div className="w-px bg-zinc-800" />
            <div>
              <div className="text-3xl font-bold text-white number-display">{t("brand.realtime")}</div>
              <div className="text-sm text-zinc-500 mt-1">{t("brand.tracking")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - auth form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ background: '#09090b' }}>
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Activity className="w-4 h-4 text-indigo-400" strokeWidth={1.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
              VidTrack
            </span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {isLogin ? t("auth.signin") : t("auth.signup")}
          </h2>
          <p className="text-zinc-500 mb-8">
            {isLogin ? t("auth.signin.subtitle") : t("auth.signup.subtitle")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div className="space-y-2 animate-fade-in">
                  <Label className="text-zinc-300 text-sm">{t("auth.name")}</Label>
                  <Input
                    data-testid="auth-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("auth.name.placeholder")}
                    required={!isLogin}
                    className="bg-zinc-950/50 border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 h-11 text-white placeholder:text-zinc-600"
                  />
                </div>
                <div className="space-y-2 animate-fade-in stagger-1">
                  <Label className="text-zinc-300 text-sm">{t("auth.role")}</Label>
                  <div className="flex gap-3">
                    <button type="button" data-testid="role-creator-btn" onClick={() => setRole("creator")}
                      className={`flex-1 h-11 rounded-lg text-sm font-medium transition-colors ${role === "creator" ? "bg-indigo-500/15 border border-indigo-500/40 text-indigo-300" : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700"}`}>
                      {t("auth.creator")}
                    </button>
                    <button type="button" data-testid="role-admin-btn" onClick={() => setRole("admin")}
                      className={`flex-1 h-11 rounded-lg text-sm font-medium transition-colors ${role === "admin" ? "bg-indigo-500/15 border border-indigo-500/40 text-indigo-300" : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700"}`}>
                      {t("auth.admin")}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">{t("auth.email")}</Label>
              <Input data-testid="auth-email-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className="bg-zinc-950/50 border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 h-11 text-white placeholder:text-zinc-600" />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">{t("auth.password")}</Label>
              <div className="relative">
                <Input data-testid="auth-password-input" type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required
                  className="bg-zinc-950/50 border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 h-11 text-white placeholder:text-zinc-600 pr-11" />
                <button type="button" data-testid="toggle-password-btn" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" data-testid="auth-submit-btn" disabled={submitting}
              className="w-full h-11 bg-white text-black hover:bg-zinc-200 font-medium active:scale-[0.98] transition-transform">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                  {isLogin ? t("auth.signing_in") : t("auth.creating")}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? t("auth.signin") : t("auth.signup")}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button data-testid="auth-toggle-btn"
              onClick={() => { setIsLogin(!isLogin); setName(""); setRole("creator"); }}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              {isLogin ? t("auth.no_account") : t("auth.has_account")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
