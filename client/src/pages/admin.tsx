import { useQuery } from "@tanstack/react-query";
import { AdminPanel } from "@/components/AdminPanel";
import { AdminLogin } from "@/components/AdminLogin";
import { getCurrentUser } from "@/lib/api";

export default function AdminPage() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/me"],
    queryFn: getCurrentUser
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user?.role === "admin") {
    return <AdminPanel />;
  }

  return <AdminLogin />;
}
