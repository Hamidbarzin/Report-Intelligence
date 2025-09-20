import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/lib/api";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      toast({
        title: "موفقیت",
        description: "با موفقیت وارد شدید",
      });
      setLocation("/admin");
    },
    onError: (error: Error) => {
      toast({
        title: "ورود ناموفق",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast({
        title: "خطا",
        description: "لطفا رمز عبور را وارد کنید",
        variant: "destructive"
      });
      return;
    }
    loginMutation.mutate(password);
  };

  return (
    <div className="max-w-md mx-auto mt-20" data-testid="admin-login">
      <Card>
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">ورود مدیر</h1>
            <p className="text-muted-foreground mt-2">برای ادامه، اطلاعات مدیر خود را وارد کنید</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="password">رمز عبور</Label>
              <Input
                id="password"
                type="password"
                placeholder="رمز عبور مدیر را وارد کنید"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-password"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loginMutation.isPending}
              data-testid="button-login"
            >
              {loginMutation.isPending ? "در حال ورود..." : "ورود"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/")}
              data-testid="button-back-dashboard"
            >
              ← بازگشت به داشبورد
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}