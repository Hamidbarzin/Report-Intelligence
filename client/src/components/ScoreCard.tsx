import { Card, CardContent } from "@/components/ui/card";
import { Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreCardProps {
  score: number;
  trend?: "up" | "down" | "stable";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ScoreCard({ score, trend, className, size = "md" }: ScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-accent";
    if (score >= 6) return "text-chart-4";
    if (score >= 4) return "text-chart-3";
    return "text-destructive";
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-accent" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      case "stable":
        return <Minus className="w-4 h-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl"
  };

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span 
              className={cn(
                "font-bold",
                sizeClasses[size],
                getScoreColor(score)
              )}
              data-testid="score-value"
            >
              {score.toFixed(1)}
            </span>
            <Star className={cn(
              "w-5 h-5 fill-current",
              getScoreColor(score)
            )} />
          </div>
          {trend && getTrendIcon(trend)}
        </div>
        <div className="mt-2">
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                score >= 8 ? "bg-accent" :
                score >= 6 ? "bg-chart-4" :
                score >= 4 ? "bg-chart-3" :
                "bg-destructive"
              )}
              style={{ width: `${(score / 10) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Overall Quality Score
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
