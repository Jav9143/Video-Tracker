import { createContext, useContext, useState, useEffect } from "react";

const translations = {
  en: {
    // Auth
    "auth.signin": "Sign in",
    "auth.signup": "Create account",
    "auth.signin.subtitle": "Enter your credentials to access your dashboard",
    "auth.signup.subtitle": "Set up your VidTrack account",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.name": "Name",
    "auth.name.placeholder": "Your name",
    "auth.role": "Role",
    "auth.creator": "Creator",
    "auth.admin": "Admin",
    "auth.no_account": "Don't have an account? Sign up",
    "auth.has_account": "Already have an account? Sign in",
    "auth.signing_in": "Signing in...",
    "auth.creating": "Creating account...",
    "auth.welcome_back": "Welcome back!",
    "auth.account_created": "Account created!",

    // Branding
    "brand.tagline": "Track your content performance",
    "brand.description": "Monitor TikTok and Instagram videos in real time. Get insights on views, likes, and engagement across all your content.",
    "brand.platforms": "Platforms",
    "brand.realtime": "Real-time",
    "brand.tracking": "Tracking",

    // Sidebar
    "nav.dashboard": "Dashboard",
    "nav.videos": "Videos",
    "nav.overview": "Overview",
    "nav.creators": "Creators",
    "nav.content": "Content",
    "nav.administration": "Administration",
    "nav.signout": "Sign out",
    "nav.language": "Language",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.welcome": "Welcome back,",
    "dashboard.total_views": "Total Views",
    "dashboard.total_likes": "Total Likes",
    "dashboard.total_comments": "Total Comments",
    "dashboard.videos_tracked": "Videos Tracked",
    "dashboard.your_videos": "Your Videos",
    "dashboard.no_videos": "No videos yet",
    "dashboard.no_videos_desc": "Start tracking your TikTok and Instagram videos to see performance metrics here.",

    // Videos page
    "videos.title": "Videos",
    "videos.subtitle": "Manage and track all your content",
    "videos.search": "Search videos...",
    "videos.all": "All",
    "videos.no_match": "No videos match your filters",
    "videos.no_videos": "No videos yet",

    // Video card
    "video.views": "Views",
    "video.likes": "Likes",
    "video.comments": "Comments",
    "video.shares": "Shares",
    "video.tracked": "Tracked:",
    "video.refresh": "Refresh",
    "video.updating": "Updating...",
    "video.refresh_metrics": "Refresh metrics",
    "video.open_original": "Open original",
    "video.delete": "Delete",
    "video.metrics_updated": "Metrics updated!",
    "video.published": "Published:",
    "video.no_date": "No date set",
    "video.days_left": "days left",
    "video.day_left": "day left",
    "video.pending_payment": "Pending payment",
    "video.paid": "Paid",
    "video.tracking": "Tracking",
    "video.payment": "Payment:",
    "video.mark_paid": "Mark as paid",
    "video.mark_pending": "Mark as pending",

    // Add video dialog
    "add.title": "Track a new video",
    "add.description": "Paste a TikTok or Instagram video URL to start tracking",
    "add.url_label": "Video URL",
    "add.url_placeholder": "https://www.tiktok.com/@user/video/...",
    "add.url_only": "Only TikTok and Instagram URLs are supported",
    "add.hint": "Paste the full URL of a TikTok or Instagram video. We'll automatically track views, likes, and engagement metrics.",
    "add.cancel": "Cancel",
    "add.submit": "Start Tracking",
    "add.adding": "Adding...",
    "add.success": "Video added and tracking started!",
    "add.button": "Add Video",
    "add.published_date": "Publication date",
    "add.published_date_hint": "When was this video published on the social network?",

    // Admin
    "admin.title": "Admin Overview",
    "admin.subtitle": "Agency-wide performance metrics",
    "admin.total_creators": "Total Creators",
    "admin.total_videos": "Total Videos",
    "admin.total_views": "Total Views",
    "admin.total_likes": "Total Likes",
    "admin.platform_breakdown": "Platform Breakdown",
    "admin.top_creators": "Top Creators by Views",
    "admin.no_data": "No data yet",
    "admin.no_creators": "No creators yet",
    "admin.videos_label": "videos",

    // Admin creators
    "creators.title": "Creators",
    "creators.subtitle": "View and manage all content creators",
    "creators.search": "Search creators...",
    "creators.no_match": "No creators match your search",
    "creators.no_creators": "No creators registered yet",
    "creators.joined": "Joined",
    "creators.cpm": "CPM",
    "creators.set_cpm": "Set CPM",
    "creators.cpm_updated": "CPM updated!",
    "creators.cpm_label": "CPM ($/1000 views)",
    "creators.save": "Save",

    // Admin creator detail
    "detail.back": "Back to creators",
    "detail.videos_count": "Videos",
    "detail.no_videos": "This creator hasn't added any videos yet",
    "detail.cpm_setting": "CPM Setting",
    "detail.current_cpm": "Current CPM:",
    "detail.total_payout": "Total Payout",
    "detail.pending_payout": "Pending Payout",

    // Common
    "common.video": "video",
    "common.videos": "videos",

    // Profile / Social Accounts
    "profile.title": "My Accounts",
    "profile.subtitle": "Add your social media accounts",
    "profile.account_name": "Account name",
    "profile.account_name_placeholder": "@username",
    "profile.account_url": "Account URL",
    "profile.account_url_placeholder": "https://tiktok.com/@username",
    "profile.platform": "Platform",
    "profile.add_account": "Add account",
    "profile.remove": "Remove",
    "profile.save": "Save",
    "profile.saved": "Accounts saved!",
    "profile.no_accounts": "No accounts added yet",
    "nav.accounts": "My Accounts",
  },
  es: {
    // Auth
    "auth.signin": "Iniciar sesión",
    "auth.signup": "Crear cuenta",
    "auth.signin.subtitle": "Ingresa tus credenciales para acceder a tu panel",
    "auth.signup.subtitle": "Configura tu cuenta de VidTrack",
    "auth.email": "Correo electrónico",
    "auth.password": "Contraseña",
    "auth.name": "Nombre",
    "auth.name.placeholder": "Tu nombre",
    "auth.role": "Rol",
    "auth.creator": "Creador",
    "auth.admin": "Admin",
    "auth.no_account": "¿No tienes cuenta? Regístrate",
    "auth.has_account": "¿Ya tienes cuenta? Inicia sesión",
    "auth.signing_in": "Iniciando sesión...",
    "auth.creating": "Creando cuenta...",
    "auth.welcome_back": "¡Bienvenido de nuevo!",
    "auth.account_created": "¡Cuenta creada!",

    // Branding
    "brand.tagline": "Trackea el rendimiento de tu contenido",
    "brand.description": "Monitoriza videos de TikTok e Instagram en tiempo real. Obtén información sobre vistas, likes y engagement de todo tu contenido.",
    "brand.platforms": "Plataformas",
    "brand.realtime": "Tiempo real",
    "brand.tracking": "Tracking",

    // Sidebar
    "nav.dashboard": "Panel",
    "nav.videos": "Videos",
    "nav.overview": "Vista general",
    "nav.creators": "Creadores",
    "nav.content": "Contenido",
    "nav.administration": "Administración",
    "nav.signout": "Cerrar sesión",
    "nav.language": "Idioma",

    // Dashboard
    "dashboard.title": "Panel",
    "dashboard.welcome": "Bienvenido,",
    "dashboard.total_views": "Vistas totales",
    "dashboard.total_likes": "Likes totales",
    "dashboard.total_comments": "Comentarios totales",
    "dashboard.videos_tracked": "Videos trackeados",
    "dashboard.your_videos": "Tus Videos",
    "dashboard.no_videos": "Sin videos aún",
    "dashboard.no_videos_desc": "Empieza a trackear tus videos de TikTok e Instagram para ver las métricas aquí.",

    // Videos page
    "videos.title": "Videos",
    "videos.subtitle": "Gestiona y trackea todo tu contenido",
    "videos.search": "Buscar videos...",
    "videos.all": "Todos",
    "videos.no_match": "No hay videos que coincidan con tus filtros",
    "videos.no_videos": "Sin videos aún",

    // Video card
    "video.views": "Vistas",
    "video.likes": "Likes",
    "video.comments": "Comentarios",
    "video.shares": "Compartidos",
    "video.tracked": "Trackeado:",
    "video.refresh": "Actualizar",
    "video.updating": "Actualizando...",
    "video.refresh_metrics": "Actualizar métricas",
    "video.open_original": "Abrir original",
    "video.delete": "Eliminar",
    "video.metrics_updated": "¡Métricas actualizadas!",
    "video.published": "Publicado:",
    "video.no_date": "Sin fecha",
    "video.days_left": "días restantes",
    "video.day_left": "día restante",
    "video.pending_payment": "Pendiente de pago",
    "video.paid": "Pagado",
    "video.tracking": "Trackeando",
    "video.payment": "Pago:",
    "video.mark_paid": "Marcar como pagado",
    "video.mark_pending": "Marcar como pendiente",

    // Add video dialog
    "add.title": "Trackear un nuevo video",
    "add.description": "Pega la URL de un video de TikTok o Instagram para comenzar el tracking",
    "add.url_label": "URL del video",
    "add.url_placeholder": "https://www.tiktok.com/@user/video/...",
    "add.url_only": "Solo se admiten URLs de TikTok e Instagram",
    "add.hint": "Pega la URL completa de un video de TikTok o Instagram. Trackearemos automáticamente las vistas, likes y métricas de engagement.",
    "add.cancel": "Cancelar",
    "add.submit": "Comenzar Tracking",
    "add.adding": "Añadiendo...",
    "add.success": "¡Video añadido y tracking iniciado!",
    "add.button": "Añadir Video",
    "add.published_date": "Fecha de publicación",
    "add.published_date_hint": "¿Cuándo se publicó este video en la red social?",

    // Admin
    "admin.title": "Vista General Admin",
    "admin.subtitle": "Métricas de rendimiento de la agencia",
    "admin.total_creators": "Total Creadores",
    "admin.total_videos": "Total Videos",
    "admin.total_views": "Vistas Totales",
    "admin.total_likes": "Likes Totales",
    "admin.platform_breakdown": "Desglose por Plataforma",
    "admin.top_creators": "Top Creadores por Vistas",
    "admin.no_data": "Sin datos aún",
    "admin.no_creators": "Sin creadores aún",
    "admin.videos_label": "videos",

    // Admin creators
    "creators.title": "Creadores",
    "creators.subtitle": "Ver y gestionar todos los creadores de contenido",
    "creators.search": "Buscar creadores...",
    "creators.no_match": "No hay creadores que coincidan con tu búsqueda",
    "creators.no_creators": "No hay creadores registrados aún",
    "creators.joined": "Registro",
    "creators.cpm": "CPM",
    "creators.set_cpm": "Establecer CPM",
    "creators.cpm_updated": "¡CPM actualizado!",
    "creators.cpm_label": "CPM ($/1000 vistas)",
    "creators.save": "Guardar",

    // Admin creator detail
    "detail.back": "Volver a creadores",
    "detail.videos_count": "Videos",
    "detail.no_videos": "Este creador aún no ha añadido videos",
    "detail.cpm_setting": "Configuración CPM",
    "detail.current_cpm": "CPM actual:",
    "detail.total_payout": "Pago Total",
    "detail.pending_payout": "Pago Pendiente",

    // Common
    "common.video": "video",
    "common.videos": "videos",

    // Profile / Social Accounts
    "profile.title": "Mis Cuentas",
    "profile.subtitle": "Añade tus cuentas de redes sociales",
    "profile.account_name": "Nombre de cuenta",
    "profile.account_name_placeholder": "@usuario",
    "profile.account_url": "URL de la cuenta",
    "profile.account_url_placeholder": "https://tiktok.com/@usuario",
    "profile.platform": "Plataforma",
    "profile.add_account": "Añadir cuenta",
    "profile.remove": "Eliminar",
    "profile.save": "Guardar",
    "profile.saved": "¡Cuentas guardadas!",
    "profile.no_accounts": "Sin cuentas añadidas",
    "nav.accounts": "Mis Cuentas",
  },
};

function getDeviceLanguage() {
  const lang = navigator.language || navigator.userLanguage || "en";
  return lang.startsWith("es") ? "es" : "en";
}

const I18nContext = createContext(null);

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem("vidtrack_lang");
    return saved || getDeviceLanguage();
  });

  useEffect(() => {
    localStorage.setItem("vidtrack_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => {
    return translations[lang]?.[key] || translations["en"]?.[key] || key;
  };

  const toggleLang = () => {
    setLang((prev) => (prev === "en" ? "es" : "en"));
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};
