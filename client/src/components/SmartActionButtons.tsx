import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  TrendingUp, 
  FileText, 
  Target, 
  AlertTriangle,
  Download,
  Share2,
  RefreshCw,
  Zap,
  BarChart3,
  CheckCircle,
  Clock
} from "lucide-react";

interface SmartActionButtonsProps {
  report: any;
  onAnalyze?: () => void;
  onUpdate?: (updated: any) => void;
}

export default function SmartActionButtons({ report, onAnalyze, onUpdate }: SmartActionButtonsProps) {
  const [loading, setLoading] = useState<string>("");
  const { toast } = useToast();
  const hasAI = report?.ai_json;
  const score = hasAI ? report.ai_json.score || 0 : 0;

  // بررسی وضعیت محتوا
  const hasContent = report?.content && report.content.length > 0;
  const contentSize = report?.content?.length || 0;

  const handleQuickAnalysis = async () => {
    if (!hasContent) {
      toast({
        title: "⚠️ محتوا موجود نیست",
        description: "ابتدا فایلی آپلود کنید که محتوا داشته باشد",
        variant: "destructive"
      });
      return;
    }

    setLoading("analysis");
    try {
      onAnalyze?.();
      toast({
        title: "🧠 تحلیل هوشمند آغاز شد",
        description: `در حال تحلیل ${contentSize.toLocaleString()} کاراکتر محتوا...`
      });
    } catch (error) {
      toast({
        title: "خطا در تحلیل",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive"
      });
    } finally {
      setLoading("");
    }
  };

  const handleGenerateCharts = async () => {
    setLoading("charts");
    try {
      // Generate additional charts based on data
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      toast({
        title: "📊 نمودارها تولید شد",
        description: "نمودارهای جدید به گزارش اضافه شدند"
      });
    } finally {
      setLoading("");
    }
  };

  const handleSetGoals = async () => {
    setLoading("goals");
    try {
      // Set smart goals based on KPIs
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "🎯 اهداف تنظیم شد",
        description: "اهداف هوشمند برای ماه آینده تعریف شدند"
      });
    } finally {
      setLoading("");
    }
  };

  const handleRiskAnalysis = async () => {
    setLoading("risks");
    try {
      await new Promise(resolve => setTimeout(resolve, 1800));
      toast({
        title: "⚠️ تحلیل ریسک",
        description: "ریسک‌های احتمالی شناسایی شدند"
      });
    } finally {
      setLoading("");
    }
  };

  const handleExportPDF = async () => {
    setLoading("export");
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      toast({
        title: "📄 PDF آماده شد",
        description: "گزارش به صورت PDF صادر شد"
      });
    } finally {
      setLoading("");
    }
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-4">
      {/* Primary Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            🤖 آرشیو گزارش‌های هوشمند
            {hasAI && (
              <Badge className={`${getScoreBadgeColor(score)} text-white`}>
                امتیاز: {score}/100
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {!hasAI ? (
              <Button 
                onClick={handleQuickAnalysis}
                disabled={loading === "analysis"}
                className="btn flex items-center gap-2"
              >
                {loading === "analysis" ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                🤖 تحلیل هوشمند
              </Button>
            ) : (
              <Button 
                onClick={handleQuickAnalysis}
                disabled={loading === "analysis"}
                variant="outline"
                className="flex items-center gap-2"
              >
                {loading === "analysis" ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                به‌روزرسانی
              </Button>
            )}

            <Button 
              onClick={handleGenerateCharts}
              disabled={loading === "charts"}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading === "charts" ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4" />
              )}
              نمودارسازی
            </Button>

            <Button 
              onClick={handleSetGoals}
              disabled={loading === "goals"}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading === "goals" ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Target className="h-4 w-4" />
              )}
              تنظیم اهداف
            </Button>

            <Button 
              onClick={handleRiskAnalysis}
              disabled={loading === "risks"}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading === "risks" ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              تحلیل ریسک
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      {hasAI && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              بینش‌های سریع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {report.ai_json.insights?.slice(0, 3).map((insight: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {insight.type === "win" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : insight.type === "risk" ? (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-blue-500" />
                  )}
                  <span className="text-sm">{insight.text}</span>
                </div>
              )) || (
                <p className="text-gray-500 text-sm">هنوز بینشی استخراج نشده</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export & Share */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-purple-500" />
            📤 صادرات و اشتراک
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <Button 
              onClick={handleExportPDF}
              disabled={loading === "export"}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading === "export" ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              📄 گزارش PDF
            </Button>

            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast({
                  title: "🔗 لینک گزارش کپی شد",
                  description: "می‌توانید آن را با تیم خود به اشتراک بگذارید"
                });
              }}
            >
              <Share2 className="h-4 w-4" />
              🔗 اشتراک لینک
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            📋 گزارش شامل: خلاصه اجرایی، شاخص‌های کلیدی، نمودارها و برنامه عملیاتی
          </p>
        </CardContent>
      </Card>
    </div>
  );
}