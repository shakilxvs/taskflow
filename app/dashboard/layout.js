import { AppProvider } from "@/context/AppContext";
import AuthGuard from "@/components/ui/AuthGuard";

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <AppProvider>
        {children}
      </AppProvider>
    </AuthGuard>
  );
}
