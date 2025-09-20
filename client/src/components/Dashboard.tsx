import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportCard } from "./ReportCard";
import { Search, SortDesc, FileText, TrendingUp, Calendar, Brain } from "lucide-react";
import { getPublishedReports } from "@/lib/api";
import type { ReportType } from "@shared/schema";

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("all");

  const { data: reports = [], isLoading, error } = useQuery({
    queryKey: ["/api/reports"],
    queryFn: async () => {
      const response = await fetch("/api/reports");
      if (!response.ok) throw new Error("Failed to fetch reports");
      return response.json();
    }
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 bg-gradient-to-r from-card to-secondary p-8 rounded-3xl border border-border">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">داشبورد گزارش‌های هوشمند</h1>
          <p className="text-muted-foreground mt-3 text-lg">گزارش‌های تحلیل شده با هوش مصنوعی از تیم تحقیقات ما</p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-blue-300" />
            <Input
              placeholder="جستجو در گزارش‌ها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 w-72 h-12 rounded-xl border-border focus:border-blue-400 focus:ring-blue-400/20 bg-card/80 backdrop-blur-sm text-foreground placeholder:text-muted-foreground"
              data-testid="input-search"
            />
          </div>
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-52 h-12 rounded-xl border-border focus:border-blue-400 focus:ring-blue-400/20 bg-card/80 backdrop-blur-sm" data-testid="select-filter">
              <SelectValue placeholder="فیلتر بر اساس..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه گزارش‌ها</SelectItem>
              <SelectItem value="high-score">امتیاز بالا (80+)</SelectItem>
              <SelectItem value="recent">اخیر (7 روز)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44 h-12 rounded-xl border-border focus:border-blue-400 focus:ring-blue-400/20 bg-card/80 backdrop-blur-sm" data-testid="select-sort">
              <SelectValue placeholder="مرتب‌سازی بر اساس..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">جدیدترین</SelectItem>
              <SelectItem value="score">امتیاز</SelectItem>
              <SelectItem value="title">عنوان</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-800/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-200 uppercase tracking-wide">کل گزارش‌ها</p>
                <p className="text-3xl font-bold text-blue-100 mt-2" data-testid="stat-total-reports">
                  {stats.totalReports}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/20 to-green-900/20 border-emerald-800/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-200 uppercase tracking-wide">میانگین امتیاز</p>
                <p className="text-3xl font-bold text-emerald-100 mt-2" data-testid="stat-avg-score">
                  {stats.avgScore}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-900/30 to-green-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-800/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-200 uppercase tracking-wide">این ماه</p>
                <p className="text-3xl font-bold text-purple-100 mt-2" data-testid="stat-this-month">
                  {stats.thisMonth}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/20 to-yellow-900/20 border-orange-800/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-200 uppercase tracking-wide">تحلیل هوش مصنوعی</p>
                <p className="text-3xl font-bold text-orange-100 mt-2" data-testid="stat-ai-status">
                  فعال
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-900/30 to-yellow-900/30 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-orange-300" />
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
              ? "هیچ گزارشی با معیارهای جستجوی شما یافت نشد."
              : "هیچ گزارش منتشر شده‌ای در دسترس نیست."}
          </p>
        </div>
      )}

      {/* Load More Button - for future pagination */}
      {sortedReports.length > 9 && (
        <div className="flex justify-center pt-8">
          <Button variant="outline" data-testid="button-load-more">
            نمایش گزارش‌های بیشتر
          </Button>
        </div>
      )}
    </div>
  );
}