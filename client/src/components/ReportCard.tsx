import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, ArrowRight, FileText, Image, Globe } from "lucide-react";
import { Link } from "wouter";
import type { ReportType } from "@shared/schema";

interface ReportCardProps {
  report: ReportType;
}

export function ReportCard({ report }: ReportCardProps) {
  const fileCount = report.files?.length || 0;
  const primaryFileType = report.files?.[0]?.type || "pdf";
  
  const getFileIcon = (type: string) => {
    switch (type) {
      case "html": return <Globe className="w-4 h-4" />;
      case "image": return <Image className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-emerald-900/30 text-emerald-200 border-emerald-800/50";
      case "analyzed": return "bg-blue-900/30 text-blue-200 border-blue-800/50";
      default: return "bg-muted text-gray-300 border-border";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fa-IR", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatDateTime = (date: string) => {
    const d = new Date(date);
    return {
      date: d.toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }),
      time: d.toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit"
      })
    };
  };

  const calculateReadTime = (sizeKb: string) => {
    const kb = parseInt(sizeKb);
    const minutes = Math.max(1, Math.round(kb / 200)); // Rough estimate
    return `${minutes} دقیقه مطالعه`;
  };

  return (
    <Link href={`/report/${report.id}`}>
      <Card 
        className="cursor-pointer hover:shadow-xl transition-all duration-300 bg-card border border-border shadow-lg hover:shadow-2xl hover:-translate-y-1 rounded-2xl"
        data-testid={`card-report-${report.id}`}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl flex items-center justify-center border border-blue-800/30">
                <div className="text-blue-300">
                  {getFileIcon(primaryFileType)}
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                {primaryFileType.toUpperCase()}
              </Badge>
            </div>
            {report.score && (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-900/30 to-green-900/30 px-3 py-2 rounded-xl border border-emerald-800/50">
                <Star className="w-5 h-5 text-emerald-200 fill-current" />
                <span 
                  className="text-lg font-bold text-emerald-100"
                  data-testid={`text-score-${report.id}`}
                >
                  {parseFloat(report.score).toFixed(1)}
                </span>
              </div>
            )}
          </div>
          
          <h3 
            className="text-xl font-bold text-foreground mb-3 line-clamp-2 leading-tight"
            data-testid={`text-title-${report.id}`}
          >
            {report.title}
          </h3>
          
          {report.ai_markdown && (
            <p 
              className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed"
              data-testid={`text-summary-${report.id}`}
            >
              {report.ai_markdown.split('\n')[0].slice(0, 150)}...
            </p>
          )}
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span data-testid={`text-readtime-${report.id}`}>
                  {calculateReadTime(report.size_kb)}
                </span>
              </span>
            </div>
            <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl p-4 space-y-2 border border-blue-800/30">
              <div className="text-xs font-semibold text-blue-200 uppercase tracking-wide">
                تاریخ بارگذاری
              </div>
              <div className="text-sm font-medium text-gray-200" data-testid={`text-date-${report.id}`}>
                {formatDateTime(report.upload_date).date}
              </div>
              <div className="text-xs text-blue-300 font-medium" data-testid={`text-time-${report.id}`}>
                ساعت: {formatDateTime(report.upload_date).time}
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge className={`${getStatusColor(report.status)} px-3 py-1 rounded-full font-medium`} variant="outline">
                  {report.status === "published" ? "منتشر شده" : 
                   report.status === "analyzed" ? "تحلیل شده" : "بارگذاری شده"}
                </Badge>
                <Badge variant="outline" className="text-muted-foreground bg-muted px-3 py-1 rounded-full font-medium">
                  {fileCount} فایل
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-blue-300">
                <span className="text-xs font-medium">مشاهده</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
