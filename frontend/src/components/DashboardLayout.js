import { Sidebar } from "./Sidebar";
import { Toaster } from "./ui/sonner";

export const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen" style={{ background: '#09090b' }}>
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-6 md:p-8 lg:p-12">
          {children}
        </div>
      </main>
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
};
