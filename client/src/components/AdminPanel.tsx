import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUploader } from "./FileUploader";
import { LogOut, Eye, Brain, Globe, Trash2, FileText, Image, Upload, Calendar, Star, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { logout, getAdminReports, analyzeReport, publishReport, deleteReport, invalidateReports } from "@/lib/api";
import type { Report } from "@shared/schema";

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedReports, setSelectedReports] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery<Report[]>({
    queryKey: ["/api/admin/reports"],
    queryFn: getAdminReports
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      setLocation("/");
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: analyzeReport,
    onSuccess: () => {
      invalidateReports();
      toast({
        title: "Success",
        description: "Report analyzed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const publishMutation = useMutation({
    mutationFn: publishReport,
    onSuccess: () => {
      invalidateReports();
      toast({
        title: "Success",
        description: "Report published successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Publish Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      invalidateReports();
      toast({
        title: "Success",
        description: "Report deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleUploadComplete = (reportId: number) => {
    invalidateReports();
    setActiveTab("manage");
    toast({
      title: "Upload Complete",
      description: "Report uploaded successfully. You can now analyze it.",
    });
  };

  const handleAnalyze = (reportId: number) => {
    analyzeMutation.mutate(reportId.toString());
  };

  const handlePublish = (reportId: number) => {
    publishMutation.mutate(reportId.toString());
  };

  const handleDelete = (reportId: number) => {
    if (confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      deleteMutation.mutate(reportId.toString());
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-accent/10 text-accent">Published</Badge>;
      case "analyzed":
        return <Badge className="bg-chart-2/10 text-chart-2">Analyzed</Badge>;
      case "uploaded":
        return <Badge variant="outline">Uploaded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFileIcon = (files: any[]) => {
    if (!files || files.length === 0) return <FileText className="w-4 h-4 text-primary" />;
    const type = files[0].type;
    switch (type) {
      case "html": return <Globe className="w-4 h-4 text-chart-2" />;
      case "image": return <Image className="w-4 h-4 text-chart-3" />;
      default: return <FileText className="w-4 h-4 text-primary" />;
    }
  };

  const filteredReports = reports.filter((report: Report) => 
    statusFilter === "all" || report.status === statusFilter
  );

  const stats = {
    totalUploads: reports.length,
    aiProcessed: reports.filter((r: Report) => r.status === "analyzed" || r.status === "published").length,
    published: reports.filter((r: Report) => r.status === "published").length,
    avgScore: reports.length > 0 ? 
      (reports
        .filter((r: Report) => r.score)
        .reduce((sum: number, r: Report) => sum + parseFloat(r.score || "0"), 0) / 
       reports.filter((r: Report) => r.score).length || 1).toFixed(1) : "0"
  };

  return (
    <div className="space-y-8" data-testid="admin-panel">
      {/* Admin Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">Manage reports, upload new files, and control publishing</p>
        </div>
        <Button 
          variant="destructive" 
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>

      {/* Admin Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" data-testid="tab-upload">Upload</TabsTrigger>
          <TabsTrigger value="manage" data-testid="tab-manage">Manage Reports</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-8">
          <FileUploader onUploadComplete={handleUploadComplete} />
        </TabsContent>

        {/* Manage Reports Tab */}
        <TabsContent value="manage" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">All Reports</h2>
            <div className="flex items-center space-x-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48" data-testid="select-status-filter">
                  <SelectValue placeholder="Filter by status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="uploaded">Uploaded</SelectItem>
                  <SelectItem value="analyzed">Analyzed</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reports Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">Loading reports...</p>
                </div>
              ) : filteredReports.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox />
                      </TableHead>
                      <TableHead>Report</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report: Report) => (
                      <TableRow key={report.id} data-testid={`row-report-${report.id}`}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              {getFileIcon(report.files || [])}
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{report.title}</h4>
                              <p className="text-xs text-muted-foreground">
                                {report.files?.length || 0} files • {Math.round(parseFloat(report.size_kb) / 1024 * 10) / 10} MB
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(report.status)}
                        </TableCell>
                        <TableCell>
                          {report.score ? (
                            <div className="flex items-center space-x-1">
                              <span className="font-medium">{parseFloat(report.score).toFixed(1)}</span>
                              <Star className="w-3 h-3 text-accent fill-current" />
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(report.upload_date).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => window.open(`/report/${report.id}`, '_blank')}
                              data-testid={`button-view-${report.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleAnalyze(report.id)}
                              disabled={analyzeMutation.isPending}
                              data-testid={`button-analyze-${report.id}`}
                            >
                              <Brain className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handlePublish(report.id)}
                              disabled={report.status !== "analyzed" || publishMutation.isPending}
                              data-testid={`button-publish-${report.id}`}
                            >
                              <Globe className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete(report.id)}
                              disabled={deleteMutation.isPending}
                              className="text-destructive hover:text-destructive"
                              data-testid={`button-delete-${report.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">
                    {statusFilter === "all" ? "No reports found." : `No ${statusFilter} reports found.`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-8">
          <h2 className="text-xl font-semibold">System Analytics</h2>
          
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Uploads</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-total-uploads">
                      {stats.totalUploads}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">AI Processed</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-ai-processed">
                      {stats.aiProcessed}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-chart-2" />
                  </div>
                </div>
                <p className="text-xs text-chart-2 mt-2">
                  {reports.length > 0 ? Math.round((stats.aiProcessed / reports.length) * 100) : 0}% success rate
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Published</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-published">
                      {stats.published}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {reports.length > 0 ? Math.round((stats.published / reports.length) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-avg-score">
                      {stats.avgScore}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-chart-4/10 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-chart-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
