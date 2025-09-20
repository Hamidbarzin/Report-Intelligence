
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, AlertCircle, Target } from 'lucide-react';
import { AnalysisData } from '@shared/analysisSchema';

interface KPIsTabProps {
  data: AnalysisData;
}

export default function KPIsTab({ data }: KPIsTabProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'win': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'risk': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'issue': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'opportunity': return <Target className="w-4 h-4 text-blue-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">امتیاز عملکرد کلی</h3>
              <p className="text-sm text-muted-foreground">بر اساس تمام KPI ها و اهداف</p>
            </div>
            <div className={`w-20 h-20 rounded-full ${getScoreColor(data.score)} flex items-center justify-center`}>
              <span className="text-2xl font-bold text-white">{data.score}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.kpis.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">{kpi.name}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {kpi.value.toLocaleString()}{kpi.unit && ` ${kpi.unit}`}
                  </span>
                  {kpi.delta !== undefined && (
                    <div className={`flex items-center ${kpi.delta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {kpi.delta >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="ml-1 text-sm font-medium">
                        {kpi.delta >= 0 ? '+' : ''}{kpi.delta.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                {kpi.target !== undefined && (
                  <div className="text-xs text-muted-foreground">
                    Target: {kpi.target.toLocaleString()}{kpi.unit && ` ${kpi.unit}`}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trend Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Trend Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{data.trend_summary}</p>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <Badge variant="outline" className="mb-1 capitalize">
                    {insight.type}
                  </Badge>
                  <p className="text-sm">{insight.text}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
