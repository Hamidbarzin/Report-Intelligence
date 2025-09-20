import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, ArrowRight, FileText, Image, Globe } from "lucide-react";
import { Link } from "wouter";
import type { Report } from "@shared/schema";

interface ReportCardProps {
  report: Report;
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
      case "published": return "bg-accent/10 text-accent";
      case "analyzed": return "bg-chart-2/10 text-chart-2";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fa-IR", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const calculateReadTime = (sizeKb: string) => {
    const kb = parseInt(sizeKb);
    const minutes = Math.max(1, Math.round(kb / 200)); // Rough estimate
    return `${minutes} دقیقه مطالعه`;
  };

  return (
    <Link href={`/report/${report.id}`}>
      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
        data-testid={`card-report-${report.id}`}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                {getFileIcon(primaryFileType)}
              </div>
              <Badge variant="secondary" className="text-xs">
                {primaryFileType.toUpperCase()}
              </Badge>
            </div>
            {report.score && (
              <div className="flex items-center space-x-1">
                <span 
                  className="text-lg font-bold text-accent"
                  data-testid={`text-score-${report.id}`}
                >
                  {parseFloat(report.score).toFixed(1)}
                </span>
                <Star className="w-4 h-4 text-accent fill-current" />
              </div>
            )}
          </div>
          
          <h3 
            className="text-lg font-semibold text-foreground mb-2 line-clamp-2"
            data-testid={`text-title-${report.id}`}
          >
            {report.title}
          </h3>
          
          {report.ai_markdown && (
            <p 
              className="text-sm text-muted-foreground mb-4 line-clamp-3"
              data-testid={`text-summary-${report.id}`}
            >
              {report.ai_markdown.split('\n')[0].slice(0, 150)}...
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <span data-testid={`text-date-${report.id}`}>
              {formatDate(report.upload_date)}
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span data-testid={`text-readtime-${report.id}`}>
                {calculateReadTime(report.size_kb)}
              </span>
            </span>
          </div>
          
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs">
                <Badge className={getStatusColor(report.status)} variant="outline">
                  {report.status === "published" ? "منتشر شده" : 
                   report.status === "analyzed" ? "تحلیل شده" : "بارگذاری شده"}
                </Badge>
                <Badge variant="outline" className="text-muted-foreground">
                  {fileCount} فایل
                </Badge>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
