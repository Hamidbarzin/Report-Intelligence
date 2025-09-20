
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
import { jsonSafeParse } from "@/lib/jsonSafeParse";

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("summary");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: report, isLoading, error } = useQuery({
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

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/analyze/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to analyze report");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Analysis Complete",
        description: "Report has been analyzed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["report", id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
  const isAdmin = document.cookie.includes('ri_admin');

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
            {isAdmin && (
              <Button
                onClick={() => analyzeMutation.mutate()}
                disabled={analyzeMutation.isPending}
                className="flex items-center gap-2"
                variant={hasAnalysis ? "outline" : "default"}
              >
                {analyzeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                {hasAnalysis ? "Re-analyze with AI" : "Analyze with AI"}
              </Button>
            )}
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

      {hasAnalysis ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="kpis">KPIs</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="plan">Action Plan</TabsTrigger>
            <TabsTrigger value="files">Source Files</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            <SummaryTab markdown={report.ai_markdown} />
          </TabsContent>

          <TabsContent value="kpis" className="space-y-6">
            <KPIsTab data={analysisData} />
          </TabsContent>

          <TabsContent value="charts" className="space-y-8">
            <ChartsBoard data={analysisData} />
          </TabsContent>

          <TabsContent value="plan" className="space-y-8">
            <PlanView data={analysisData?.next_month_plan} />
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            {report.files && report.files.length > 0 ? (
              <div className="space-y-4">
                {report.files.map((file: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            {getFileIcon(file.type)}
                          </div>
                          <div>
                            <h3 className="font-medium">{file.file_name}</h3>
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No source files available for this report.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-8">
            {report.files && report.files.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Files</p>
                <div className="space-y-2">
                  {report.files.map((file: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{file.file_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {file.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Analysis Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This report hasn't been analyzed yet. Click the button above to run AI analysis.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
