
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AnalysisData } from '@shared/analysisSchema';

interface PlanViewProps {
  data: AnalysisData;
}

export default function PlanView({ data }: PlanViewProps) {
  const plan = data.next_month_plan;

  return (
    <div className="space-y-6">
      {/* Focus Themes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Focus Themes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {plan.focus_themes.map((theme, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {theme}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>4-Week Action Plan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.weekly_plan.map((week, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Week {week.week}</CardTitle>
                  {week.owner && (
                    <Badge variant="outline" className="w-fit">
                      Owner: {week.owner}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Goals</h4>
                    <ul className="space-y-1">
                      {week.goals.map((goal, goalIndex) => (
                        <li key={goalIndex} className="flex items-start space-x-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {week.metrics && week.metrics.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Key Metrics</h4>
                      <div className="flex flex-wrap gap-1">
                        {week.metrics.map((metric, metricIndex) => (
                          <Badge key={metricIndex} variant="outline" className="text-xs">
                            {metric}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Key Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          {plan.milestones.length > 0 ? (
            <div className="space-y-3">
              {plan.milestones.map((milestone, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">{milestone.title}</span>
                  <Badge variant="outline">
                    Due: {new Date(milestone.due).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No milestones defined for this period.</p>
          )}
        </CardContent>
      </Card>

      {/* Risks & Mitigations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Risks & Mitigations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {plan.risks_mitigations.length > 0 ? (
            <div className="space-y-4">
              {plan.risks_mitigations.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="space-y-2">
                    <div>
                      <Badge variant="destructive" className="mb-2">Risk</Badge>
                      <p className="text-sm">{item.risk}</p>
                    </div>
                    <div>
                      <Badge variant="secondary" className="mb-2">Mitigation</Badge>
                      <p className="text-sm">{item.mitigation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No risks identified for this period.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
