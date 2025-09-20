
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle } from "lucide-react";
import { miniMD } from "@/lib/miniMarkdown";
import { sampleAiJson, sampleMarkdown } from "@/lib/sampleAnalysis";
import { useToast } from "@/hooks/use-toast";

// Try to import Recharts if available, otherwise graceful fallback
let Recharts: any = null;
try { 
  Recharts = require("recharts"); 
} catch (_) { 
  Recharts = null; 
}

// Helper to prepare recharts data
const toRecharts = (series: any[]) =>
  series.map(s => ({
    name: s.name,
    data: s.points.map((p: any) => ({ x: p.x, y: p.y }))
  }));

interface AIAnalyzeTabsProps {
  report: any;
  onUpdate?: (updated: any) => void;
}

export default function AIAnalyzeTabs({ report, onUpdate }: AIAnalyzeTabsProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const ai = report?.ai_json || null;
  const md = report?.ai_markdown || "";

  const runAnalyze = async () => {
    try {
      setLoading(true);
      
      // Try real backend first
      try {
        const response = await fetch(`/api/analyze/${report.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          const updated = { 
            ...report, 
            ai_json: result.ai_json, 
            ai_markdown: result.ai_markdown, 
            score: result.score?.toString() || "0" 
          };
          onUpdate?.(updated);
          toast({
            title: "Analysis Complete",
            description: "Report has been analyzed successfully.",
          });
          return;
        }
      } catch (e) {
        console.log("Backend not available, using sample data");
      }

      // Fallback to sample data
      const updated = { 
        ...report, 
        ai_json: sampleAiJson, 
        ai_markdown: sampleMarkdown, 
        score: sampleAiJson.score?.toString() || "0" 
      };
      onUpdate?.(updated);
      
      toast({
        title: "Analysis Complete (Demo)",
        description: "Using sample analysis data for demonstration.",
      });
      
    } catch (e: any) {
      toast({
        title: "Analysis Failed",
        description: e?.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {!ai && (
        <Button
          onClick={runAnalyze}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Brain className="h-4 w-4" />
          )}
          {loading ? "Analyzing..." : "Run AI Analysis"}
        </Button>
      )}

      {ai && (
        <div className="mt-4">
          <Tabs defaultValue="summary">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Executive Summary</TabsTrigger>
              <TabsTrigger value="kpis">KPIs & Score</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="plan">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div
                    className="prose prose-slate max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: miniMD(md) }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="kpis" className="space-y-4">
              <KPIsView ai={ai} />
            </TabsContent>

            <TabsContent value="charts" className="space-y-4">
              {Recharts ? (
                <ChartsView ai={ai} />
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                      Install recharts for chart visualization: <code>npm i recharts</code>
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="plan" className="space-y-4">
              <PlanView plan={ai.next_month_plan} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

// KPIs & Score View
function KPIsView({ ai }: { ai: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground">Progress Score:</span>
        <Badge className="text-lg px-3 py-1">
          {ai.score ?? 0}/100
        </Badge>
      </div>

      {ai.trend_summary && (
        <p className="text-muted-foreground">{ai.trend_summary}</p>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {ai.kpis?.map((k: any, idx: number) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">{k.name}</div>
              <div className="text-2xl font-bold">
                {k.value} {k.unit || ""}
              </div>
              <div className="text-sm text-muted-foreground">
                Target: {k.target ?? "-"}
              </div>
              <div className={`text-sm flex items-center gap-1 ${k.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {k.delta >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                Change: {k.delta}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {ai.insights?.length && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Key Insights</h3>
            <div className="space-y-2">
              {ai.insights.map((x: any, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  {x.type === 'win' ? (
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  )}
                  <span className="text-sm">
                    <Badge variant="outline" className="text-xs mr-2">
                      {x.type}
                    </Badge>
                    {x.text}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Charts View
function ChartsView({ ai }: { ai: any }) {
  if (!Recharts) return null;
  
  const { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = Recharts;
  
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {ai.charts?.map((c: any, idx: number) => {
        const series = toRecharts(c.series);
        const data = series[0]?.data ?? [];
        
        if (c.type === 'line') {
          return (
            <Card key={idx}>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">{c.title}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="x" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="y" 
                        name={series[0]?.name || 'Series'}
                        stroke="#8884d8" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          );
        }
        
        if (c.type === 'bar') {
          return (
            <Card key={idx}>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">{c.title}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="x" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="y" 
                        name={series[0]?.name || 'Series'}
                        fill="#8884d8" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          );
        }
        
        return null;
      })}
    </div>
  );
}

// Action Plan View
function PlanView({ plan }: { plan: any }) {
  if (!plan) return (
    <Card>
      <CardContent className="p-6">
        <p className="text-muted-foreground">No action plan available.</p>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Focus Themes</h3>
          <div className="flex flex-wrap gap-2">
            {plan.focus_themes?.map((theme: string, i: number) => (
              <Badge key={i} variant="secondary">{theme}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Weekly Plan</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {plan.weekly_plan?.map((w: any, i: number) => (
              <Card key={i} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>Week {w.week}</Badge>
                    <span className="text-sm text-muted-foreground">Owner: {w.owner || "-"}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-sm">Goals:</span>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {w.goals?.map((g: string, j: number) => <li key={j}>{g}</li>)}
                      </ul>
                    </div>
                    
                    <div>
                      <span className="font-medium text-sm">Metrics:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {w.metrics?.map((m: string, j: number) => (
                          <Badge key={j} variant="outline" className="text-xs">{m}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Milestones</h3>
            <div className="space-y-2">
              {plan.milestones?.map((m: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">{m.title}</span>
                  <Badge variant="outline" className="text-xs">{m.due}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Risks & Mitigations</h3>
            <div className="space-y-2">
              {plan.risks_mitigations?.map((r: any, i: number) => (
                <div key={i} className="text-sm">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div>
                      <span className="text-muted-foreground">{r.risk}</span>
                      <span className="mx-2">→</span>
                      <span>{r.mitigation}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
