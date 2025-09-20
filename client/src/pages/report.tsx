import { useState } from "react";
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
    enabled: !!id,
    onSuccess: (data) => {
      if (!currentReport) {
        setCurrentReport(data);
      }
    }
  });

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

  const analysisData = report.ai_json ? jsonSafeParse(JSON.stringify(report.ai_json)) : null;
  const hasAnalysis = analysisData && report.ai_markdown;

  // Check if user is admin to show analyze button
  const isAdmin = document.cookie.includes('ri_admin') || document.cookie.includes('admin_token');

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

      {/* محتوای اصلی گزارش */}
      {report.content && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              📋 محتوای گزارش
            </h3>
            <div 
              className="prose prose-slate max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: report.content }}
            />
          </CardContent>
        </Card>
      )}

      {/* اگر محتوا خالی است */}
      {!report.content && (
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <div className="action-urgent bg-red-50 border border-red-200 rounded-lg p-6">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ محتوا یافت نشد</h3>
              <p className="text-red-600 mb-4">محتوای فایل HTML به درستی استخراج نشده است.</p>
              <div className="text-sm text-red-500 space-y-1">
                <p>• بررسی کنید فایل HTML به درستی آپلود شده باشد</p>
                <p>• Encoding فایل باید UTF-8 باشد</p>
                <p>• فایل نباید خراب یا ناقص باشد</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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