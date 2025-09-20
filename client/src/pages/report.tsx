import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Star, Download, Share, Eye, FileText, Image, Globe, Calendar, Clock, Target, AlertTriangle, Users, Flag, CheckCircle, TrendingUp, TrendingDown, Minus, Brain, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import ChartsBoard from "@/components/ChartsBoard";
import SummaryTab from "@/components/SummaryTab";
import KPIsTab from "@/components/KPIsTab";
import PlanView from "@/components/PlanView";
import AIAnalyzeTabs from "@/components/AIAnalyzeTabs";
import { jsonSafeParse } from "@/lib/jsonSafeParse";
import SmartActionButtons from "@/components/SmartActionButtons";
import FloatingActionButton from "@/components/FloatingActionButton";

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("summary");
  const [currentReport, setCurrentReport] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: fetchedReport, isLoading, error } = useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      const response = await fetch(`/api/report/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch report");
      }
      return response.json();
    },
    enabled: !!id
  });

  // Handle report data updates
  useEffect(() => {
    if (fetchedReport && !currentReport) {
      setCurrentReport(fetchedReport);
    }
  }, [fetchedReport, currentReport]);

  const report = currentReport || fetchedReport;
  // State to hold the report data, used by SmartActionButtons
  const [reportState, setReportState] = useState<any>(report);

  const handleReportUpdate = (updatedReport: any) => {
    setCurrentReport(updatedReport);
    setReportState(updatedReport); // Update reportState as well
    queryClient.setQueryData(["report", id], updatedReport);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Report Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          The report you're looking for doesn't exist or isn't published.
        </p>
        <Link href="/">
          <Button className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const analysisData = report.ai_json || null;
  const hasAnalysis = analysisData && typeof analysisData === 'object';

  // Check if user is admin to show analyze button
  const { data: userInfo } = useQuery({
    queryKey: ["user-info"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/me");
        if (!response.ok) return { role: "public" };
        return response.json();
      } catch {
        return { role: "public" };
      }
    }
  });
  const isAdmin = userInfo?.role === "admin";

  const getFileIcon = (type: string) => {
    switch (type) {
      case "html": return <Globe className="w-5 h-5" />;
      case "image": return <Image className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const formatFileSize = (sizeKb: number) => {
    if (sizeKb < 1024) return `${sizeKb} KB`;
    return `${(sizeKb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Report Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-center space-x-4 mb-4">
            <h1 className="text-3xl font-bold">{report.title}</h1>
            {report.score && (
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-accent">
                  {parseFloat(report.score).toFixed(1)}
                </span>
                <Star className="w-5 h-5 text-accent fill-current" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {report.status === "published" ? "Published" : "Draft"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button>
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Debug Info - برای بررسی وضعیت */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">🔍 اطلاعات دیباگ (حالت توسعه)</h3>
            <div className="text-xs text-yellow-700 space-y-1">
              <p><strong>ID گزارش:</strong> {report.id}</p>
              <p><strong>عنوان:</strong> {report.title}</p>
              <p><strong>حجم محتوا:</strong> {report.content?.length || 0} کاراکتر</p>
              <p><strong>نوع فایل:</strong> {report.files?.[0]?.type || 'نامشخص'}</p>
              <p><strong>وضعیت AI:</strong> {report.ai_json ? '✅ تحلیل شده' : '❌ تحلیل نشده'}</p>
              <p><strong>امتیاز:</strong> {report.score || 0}/100</p>
              <p><strong>آخرین بروزرسانی:</strong> {new Date(report.upload_date).toLocaleString('fa-IR')}</p>
              {report.content && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-yellow-600">نمایش 200 کاراکتر اول محتوا</summary>
                  <pre className="mt-2 p-2 bg-white rounded text-xs overflow-x-auto">
                    {report.content.substring(0, 200)}...
                  </pre>
                </details>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis Component */}
      <AIAnalyzeTabs report={report} onUpdate={handleReportUpdate} />

      {/* Smart Action Buttons */}
      <div className="mb-8">
        <SmartActionButtons
          report={reportState}
          onAnalyze={() => {
            // Trigger AI analysis from AIAnalyzeTabs
            const analyzeButton = document.querySelector('[data-analyze-button]') as HTMLButtonElement;
            analyzeButton?.click();
          }}
          onUpdate={setReportState}
        />
      </div>

      {/* Source Files Section */}
      {report.files && report.files.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Source Files</h3>
            <div className="space-y-4">
              {report.files.map((file: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {getFileIcon(file.type)}
                    </div>
                    <div>
                      <h4 className="font-medium">{file.file_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {file.type.toUpperCase()} • {formatFileSize(file.size_kb)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* نمایش محتوای گزارش */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            📋 محتوای گزارش
          </h3>
          
          {(report.extracted_text || report.content) ? (
            <div className="space-y-4">
              {/* نمایش خام محتوا */}
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">
                  {(report.extracted_text || report.content).substring(0, 2000)}
                  {(report.extracted_text || report.content).length > 2000 && "..."}
                </pre>
              </div>
              
              {/* نمایش ایمن متن (بدون HTML برای جلوگیری از XSS) */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">محتوای استخراج شده:</h4>
                <div className="bg-white p-4 rounded border max-h-64 overflow-y-auto">
                  <div className="whitespace-pre-wrap text-sm leading-6">
                    {(report.extracted_text || report.content)
                      .replace(/<[^>]+>/g, ' ') // حذف تمام تگ‌های HTML
                      .replace(/&nbsp;/g, ' ')
                      .replace(/&amp;/g, '&')
                      .replace(/&lt;/g, '<')
                      .replace(/&gt;/g, '>')
                      .replace(/&quot;/g, '"')
                      .replace(/&#39;/g, "'")
                      .replace(/\s+/g, ' ')
                      .trim()
                    }
                  </div>
                </div>
              </div>
              
              {/* اطلاعات فایل */}
              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <p><strong>حجم محتوا:</strong> {(report.extracted_text || report.content).length.toLocaleString()} کاراکتر</p>
                <p><strong>نوع فایل:</strong> {report.files?.[0]?.type || 'نامشخص'}</p>
                <p><strong>وضعیت:</strong> 
                  <span className="text-green-600 font-medium"> ✅ محتوا با موفقیت استخراج شده</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="action-urgent">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ محتوا خالی است</h3>
              <div className="text-sm text-red-600 space-y-2">
                <p><strong>مشکلات احتمالی:</strong></p>
                <p>🔍 فایل به درستی parse نشده</p>
                <p>🔤 مشکل Encoding (باید UTF-8 باشد)</p>
                <p>📄 فایل خراب یا ناقص</p>
                <p>💾 مشکل در ذخیره‌سازی دیتابیس</p>
                
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <p><strong>🛠️ راه‌حل‌های پیشنهادی:</strong></p>
                  <p>• فایل HTML را مجدداً آپلود کنید</p>
                  <p>• از فایل‌های کوچک‌تر (زیر 1MB) استفاده کنید</p>
                  <p>• Console browser را چک کنید</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <FloatingActionButton
        onAction={(action) => {
          switch(action) {
            case "analyze":
              const analyzeButton = document.querySelector('[data-analyze-button]') as HTMLButtonElement;
              analyzeButton?.click();
              break;
            case "charts":
              console.log("Generate charts");
              break;
            case "goals":
              console.log("Set goals");
              break;
            case "export":
              console.log("Export PDF");
              break;
          }
        }}
      />
    </div>
  );
}