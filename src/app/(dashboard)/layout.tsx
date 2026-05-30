import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { NotificationsProvider } from "@/lib/notifications-context";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationsProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </NotificationsProvider>
  );
}
