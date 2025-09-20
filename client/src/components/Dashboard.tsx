import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportCard } from "./ReportCard";
import { Search, SortDesc, FileText, TrendingUp, Calendar, Brain } from "lucide-react";
import { getPublishedReports } from "@/lib/api";
import type { Report } from "@shared/schema";

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("all");

  const { data: reports = [], isLoading, error } = useQuery({
    queryKey: ["/api/list"],
    queryFn: getPublishedReports
  });

  const filteredReports = reports.filter((report: Report) => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (report.ai_markdown && report.ai_markdown.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterBy === "all" || 
                         (filterBy === "high-score" && report.score && parseFloat(report.score) >= 80) ||
                         (filterBy === "recent" && new Date(report.upload_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesFilter;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    switch (sortBy) {
      case "score":
        return (parseFloat(b.score || "0") - parseFloat(a.score || "0"));
      case "title":
        return a.title.localeCompare(b.title);
      default: // "recent"
        return new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime();
    }
  });

  const stats = {
    totalReports: reports.length,
    avgScore: reports.length > 0 ? 
      (reports.reduce((sum: number, r: Report) => sum + parseFloat(r.score || "0"), 0) / reports.length).toFixed(1) : "0",
    thisMonth: reports.filter((r: Report) => 
      new Date(r.upload_date).getMonth() === new Date().getMonth()
    ).length,
    aiStatus: "Active"
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Published Reports</h1>
            <p className="text-muted-foreground mt-2">AI-analyzed intelligence reports from our research team</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-48 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load reports. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="dashboard">
      {/* Dashboard Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Published Reports</h1>
          <p className="text-muted-foreground mt-2">AI-analyzed intelligence reports from our research team</p>
        </div>
        
        {/* Filters & Search */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
              data-testid="input-search"
            />
          </div>
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-48" data-testid="select-filter">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="high-score">High Score (80+)</SelectItem>
              <SelectItem value="recent">Recent (7 days)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40" data-testid="select-sort">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="score">Score</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-total-reports">
                  {stats.totalReports}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
            </div>
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
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-this-month">
                  {stats.thisMonth}
                </p>
              </div>
              <div className="w-10 h-10 bg-chart-3/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">AI Analysis</p>
                <p className="text-2xl font-bold text-accent" data-testid="stat-ai-status">
                  {stats.aiStatus}
                </p>
              </div>
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Grid */}
      {sortedReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="reports-grid">
          {sortedReports.map((report: Report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery || filterBy !== "all" 
              ? "No reports match your search criteria." 
              : "No published reports available."}
          </p>
        </div>
      )}

      {/* Load More Button - for future pagination */}
      {sortedReports.length > 9 && (
        <div className="flex justify-center pt-8">
          <Button variant="outline" data-testid="button-load-more">
            Load More Reports
          </Button>
        </div>
      )}
    </div>
  );
}
