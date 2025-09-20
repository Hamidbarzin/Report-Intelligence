import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Search, Filter, BarChart3, TrendingUp, FileText, Clock, Star } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

interface AnalysisReport {
  id: number;
  title: string;
  upload_date: string;
  status: string;
  score?: string;
  ai_json?: any;
  ai_markdown?: string;
}

export default function AnalysisPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["analysis-reports"],
    queryFn: async () => {
      const response = await fetch("/api/list");
      if (!response.ok) throw new Error("Failed to fetch reports");
      return response.json();
    }
  });

  // Filter and sort reports
  const filteredReports = reports
    .filter((report: AnalysisReport) => {
      const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || 
        (filterStatus === "analyzed" && report.ai_json) ||
        (filterStatus === "pending" && !report.ai_json);
      return matchesSearch && matchesStatus;
    })
    .sort((a: AnalysisReport, b: AnalysisReport) => 
      new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime()
    );

  const analyzedReports = filteredReports.filter((r: AnalysisReport) => r.ai_json);
  const pendingReports = filteredReports.filter((r: AnalysisReport) => !r.ai_json);

  const getStatusBadge = (report: AnalysisReport) => {
    if (report.ai_json) {
      return <Badge className="bg-green-100 text-green-800">تحلیل شده</Badge>;
    }
    return <Badge variant="secondary">در انتظار تحلیل</Badge>;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "yyyy/MM/dd HH:mm");
  };

  const ReportCard = ({ report }: { report: AnalysisReport }) => (
    <Card key={report.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">{report.title}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(report.upload_date)}
              </div>
              {report.score && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {parseFloat(report.score).toFixed(1)}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(report)}
            <Link href={`/report/${report.id}`}>
              <Button size="sm" variant="outline" data-testid={`view-report-${report.id}`}>
                <FileText className="w-4 h-4 mr-2" />
                مشاهده گزارش
              </Button>
            </Link>
          </div>
        </div>
        
        {report.ai_json && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-blue-800">
                  {report.ai_json.kpis?.length || 0}
                </div>
                <div className="text-blue-600">شاخص کلیدی</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-800">
                  {report.ai_json.charts?.length || 0}
                </div>
                <div className="text-blue-600">نمودار</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-800">
                  {report.ai_json.insights?.length || 0}
                </div>
                <div className="text-blue-600">بینش</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">آرشیو تحلیل‌ها</h1>
          <p className="text-muted-foreground mt-2">
            مدیریت و مشاهده تمام تحلیل‌های هوشمند
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            {reports.length} گزارش
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="جستجو در عنوان گزارش‌ها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-input"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md"
                data-testid="filter-status"
              >
                <option value="all">همه</option>
                <option value="analyzed">تحلیل شده</option>
                <option value="pending">در انتظار</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" data-testid="tab-all">
            همه ({filteredReports.length})
          </TabsTrigger>
          <TabsTrigger value="analyzed" data-testid="tab-analyzed">
            تحلیل شده ({analyzedReports.length})
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">
            در انتظار ({pendingReports.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">هیچ گزارشی یافت نشد</h3>
                <p className="text-muted-foreground">
                  گزارشی که با معیارهای جستجو مطابقت داشته باشد وجود ندارد.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analyzed" className="space-y-4">
          {analyzedReports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">هنوز تحلیلی انجام نشده</h3>
                <p className="text-muted-foreground">
                  گزارش‌هایی که تحلیل شده‌اند در اینجا نمایش داده می‌شوند.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {analyzedReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingReports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">همه گزارش‌ها تحلیل شده‌اند</h3>
                <p className="text-muted-foreground">
                  تمام گزارش‌ها تحلیل شده و آماده مشاهده هستند.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}