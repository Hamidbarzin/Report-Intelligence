import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Star, Download, Share, Eye, FileText, Image, Globe, Calendar, Clock, Target, AlertTriangle, Users, Flag, CheckCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Link } from "wouter";
import ChartsBoard from "./ChartsBoard";
import { getReport } from "@/lib/api";
import type { Report, KPI, WeeklyGoal, Milestone, RiskMitigation } from "@shared/schema";

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
    <div className="space-y-8" data-testid="report-view">
      {/* Report Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link href="/">
            <Button variant="ghost" className="mb-4" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center space-x-4 mb-4">
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-report-title">
              {report.title}
            </h1>
            {report.score && (
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-accent" data-testid="text-report-score">
                  {parseFloat(report.score).toFixed(1)}
                </span>
                <Star className="w-5 h-5 text-accent fill-current" />
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <span data-testid="text-publish-date">
              Published {formatDate(report.upload_date)}
            </span>
            <span data-testid="text-file-count">
              {report.files?.length || 0} files analyzed
            </span>
            <span data-testid="text-file-size">
              {formatFileSize(parseFloat(report.size_kb))}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button data-testid="button-share">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary" data-testid="tab-summary">Summary</TabsTrigger>
          <TabsTrigger value="kpis" data-testid="tab-kpis">KPIs</TabsTrigger>
          <TabsTrigger value="charts" data-testid="tab-charts">Charts</TabsTrigger>
          <TabsTrigger value="plan" data-testid="tab-plan">Action Plan</TabsTrigger>
          <TabsTrigger value="files" data-testid="tab-files">Source Files</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold mb-6">Executive Summary</h2>
              <div 
                className="prose prose-slate max-w-none dark:prose-invert"
                data-testid="content-summary"
                dangerouslySetInnerHTML={{ __html: report.ai_markdown || "No summary available." }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* KPIs Tab */}
        <TabsContent value="kpis" className="space-y-6">
          {report.ai_json?.kpis && report.ai_json.kpis.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="kpis-grid">
              {report.ai_json.kpis.map((kpi: KPI, index: number) => (
                <Card key={index} data-testid={`kpi-card-${index}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-muted-foreground">{kpi.name}</h3>
                      {kpi.trend === "up" && <TrendingUp className="w-5 h-5 text-accent" />}
                      {kpi.trend === "down" && <TrendingDown className="w-5 h-5 text-destructive" />}
                      {kpi.trend === "stable" && <Minus className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
                      <div className="text-sm text-muted-foreground">{kpi.description}</div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-accent h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(100, Math.max(0, kpi.percentage))}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No KPIs available for this report.</p>
            </div>
          )}
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-8">
          {report.ai_json?.charts ? (
            <ChartsBoard charts={report.ai_json.charts} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No charts available for this report.</p>
            </div>
          )}
        </TabsContent>

        {/* Action Plan Tab */}
        <TabsContent value="plan" className="space-y-8">
          {report.ai_json?.next_month_plan ? (
            <Card>
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold mb-6">30-Day Action Plan</h2>
                
                {/* Weekly Plan Grid */}
                {report.ai_json.next_month_plan.weekly_plan && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {report.ai_json.next_month_plan.weekly_plan.map((week: WeeklyGoal[], weekIndex: number) => (
                      <div key={weekIndex} className="space-y-4" data-testid={`week-${weekIndex + 1}`}>
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-primary-foreground">{weekIndex + 1}</span>
                          </div>
                          <h3 className="font-semibold">Week {weekIndex + 1}</h3>
                        </div>
                        
                        <div className="space-y-3">
                          {week.map((goal: WeeklyGoal, goalIndex: number) => (
                            <div key={goalIndex} className="p-3 bg-muted rounded-lg">
                              <h4 className="text-sm font-medium mb-1">{goal.title}</h4>
                              <p className="text-xs text-muted-foreground">{goal.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Milestones & Risks */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Key Milestones */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Key Milestones</h3>
                    <div className="space-y-4" data-testid="milestones-list">
                      {report.ai_json.next_month_plan.milestones?.map((milestone: Milestone, index: number) => (
                        <div key={index} className="flex items-start space-x-3" data-testid={`milestone-${index}`}>
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                            {milestone.completed ? (
                              <CheckCircle className="w-3 h-3 text-primary-foreground" />
                            ) : (
                              <Target className="w-3 h-3 text-primary-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{milestone.title}</h4>
                            <p className="text-xs text-muted-foreground">{milestone.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk Mitigations */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Risk Mitigations</h3>
                    <div className="space-y-4" data-testid="risks-list">
                      {report.ai_json.next_month_plan.risks_mitigations?.map((risk: RiskMitigation, index: number) => (
                        <div 
                          key={index} 
                          className={`p-4 border rounded-lg ${
                            risk.severity === "high" ? "bg-destructive/10 border-destructive/20" :
                            risk.severity === "medium" ? "bg-chart-4/10 border-chart-4/20" :
                            "bg-chart-2/10 border-chart-2/20"
                          }`}
                          data-testid={`risk-${index}`}
                        >
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                              risk.severity === "high" ? "text-destructive" :
                              risk.severity === "medium" ? "text-chart-4" :
                              "text-chart-2"
                            }`} />
                            <div className="flex-1">
                              <h4 className={`font-medium text-sm ${
                                risk.severity === "high" ? "text-destructive" :
                                risk.severity === "medium" ? "text-chart-4" :
                                "text-chart-2"
                              }`}>
                                {risk.title}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">{risk.mitigation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No action plan available for this report.</p>
            </div>
          )}
        </TabsContent>

        {/* Source Files Tab */}
        <TabsContent value="files" className="space-y-6">
          {report.files && report.files.length > 0 ? (
            <div className="space-y-4" data-testid="files-list">
              {report.files.map((file, index) => (
                <Card key={index} data-testid={`file-card-${index}`}>
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
                        <Button variant="ghost" size="sm" data-testid={`button-view-file-${index}`}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" data-testid={`button-download-file-${index}`}>
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
    </div>
  );
}
