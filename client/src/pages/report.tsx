import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Calendar, FileText, BarChart3, Brain, Target, TrendingUp, FileSearch } from "lucide-react";
import { jsonSafeParse } from "@/lib/jsonSafeParse";
import SummaryTab from "@/components/SummaryTab";
import KPIsTab from "@/components/KPIsTab";
import ChartsBoard from "@/components/ChartsBoard";
import PlanView from "@/components/PlanView";
import { useToast } from "@/hooks/use-toast";

export default function ReportPage() {
  const { id } = useParams();
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
      </div>
    );
  }

  const analysisData = report.ai_json ? jsonSafeParse(JSON.stringify(report.ai_json)) : null;
  const hasAnalysis = analysisData && report.ai_markdown;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{report.title}</h1>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {report.status === "published" ? "Published" : "Draft"}
          </Badge>
          {!hasAnalysis && (
            <Button
              onClick={() => analyzeMutation.mutate()}
              disabled={analyzeMutation.isPending}
              className="flex items-center gap-2"
            >
              {analyzeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Brain className="h-4 w-4" />
              )}
              Analyze with AI
            </Button>
          )}
        </div>
      </div>

      {hasAnalysis ? (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <FileSearch className="h-4 w-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="kpis" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              KPIs
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Charts
            </TabsTrigger>
            <TabsTrigger value="plan" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Plan
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <SummaryTab markdown={report.ai_markdown} />
          </TabsContent>

          <TabsContent value="kpis">
            <KPIsTab data={analysisData} />
          </TabsContent>

          <TabsContent value="charts">
            <ChartsBoard data={analysisData} />
          </TabsContent>

          <TabsContent value="plan">
            <PlanView data={analysisData} />
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Report Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Size</p>
                    <p>{report.size_kb} KB</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="capitalize">{report.status}</p>
                  </div>
                </div>

                {report.score && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Score</p>
                    <p className="text-2xl font-bold text-blue-600">{report.score}/100</p>
                  </div>
                )}

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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Report Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Size</p>
                <p>{report.size_kb} KB</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="capitalize">{report.status}</p>
              </div>
            </div>

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