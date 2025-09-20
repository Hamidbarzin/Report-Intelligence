import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Star, 
  Download, 
  Share, 
  Eye, 
  FileText, 
  Image, 
  Globe, 
  Calendar, 
  Clock, 
  Target, 
  AlertTriangle, 
  Users, 
  Flag, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  Minus 
} from "lucide-react";
import { Link } from "wouter";
import ChartsBoard from "./ChartsBoard";
import { getReport } from "@/lib/api";
import type { Report } from "@/types";

export function ReportView() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("summary");

  const { data: report, isLoading, error } = useQuery({
    queryKey: ["/api/report", id],
    queryFn: () => getReport(id!),
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Card className="animate-pulse">
          <CardContent className="p-8">
            <div className="h-32 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load report. Please try again.</p>
        <Link href="/">
          <Button className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return <ReportViewContent report={report} activeTab={activeTab} setActiveTab={setActiveTab} />;
}

interface ReportViewContentProps {
  report: Report;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

function ReportViewContent({ report, activeTab, setActiveTab }: ReportViewContentProps) {
  const getFileIcon = (type: string) => {
    switch (type) {
      case "html": return <Globe className="w-4 h-4" />;
      case "image": return <Image className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              بازگشت
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{report.title}</h1>
            <p className="text-muted-foreground mt-2">{report.summary}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            دانلود
          </Button>
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            اشتراک
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">خلاصه</TabsTrigger>
          <TabsTrigger value="kpis">شاخص‌ها</TabsTrigger>
          <TabsTrigger value="trends">روندها</TabsTrigger>
          <TabsTrigger value="files">فایل‌ها</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">خلاصه گزارش</h3>
              <p className="text-muted-foreground leading-relaxed">
                {report.summary}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.kpis.map((kpi, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{kpi.key}</p>
                      <p className="text-2xl font-bold">{kpi.value}</p>
                    </div>
                    {kpi.unit && (
                      <Badge variant="secondary">{kpi.unit}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <ChartsBoard />
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          {report.files && report.files.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.files.map((file, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div className="flex-1">
                        <p className="font-medium">{file.file_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size_kb / 1024).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">هیچ فایلی یافت نشد</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}