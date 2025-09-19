
export const AnalysisSchema = {
  "type": "object",
  "required": ["report_id","timeframe","kpis","trend_summary","insights","score","charts","next_month_plan"],
  "properties": {
    "report_id": {"type":"string"},
    "timeframe": {"type":"object","properties":{"start":{"type":"string"},"end":{"type":"string"}}},
    "kpis": {
      "type":"array",
      "items":{"type":"object","required":["name","value"],"properties":{
        "name":{"type":"string"},
        "value":{"type":"number"},
        "unit":{"type":"string"},
        "target":{"type":"number"},
        "delta":{"type":"number"}
      }}
    },
    "trend_summary":{"type":"string"},
    "insights":{"type":"array","items":{"type":"object","properties":{
      "type":{"type":"string","enum":["win","risk","issue","opportunity"]},
      "text":{"type":"string"}
    }}},
    "score":{"type":"number","minimum":0,"maximum":100},
    "charts":{
      "type":"array",
      "items":{"type":"object","required":["title","type","series"],"properties":{
        "title":{"type":"string"},
        "type":{"type":"string","enum":["line","bar","pie"]},
        "series":{"type":"array","items":{
          "type":"object","required":["name","points"],
          "properties":{"name":{"type":"string"},"points":{"type":"array","items":{
            "type":"object","required":["x","y"],
            "properties":{"x":{"type":"string"},"y":{"type":"number"}}
          }}}
        }}
      }}
    },
    "next_month_plan":{
      "type":"object",
      "required":["focus_themes","weekly_plan","milestones","risks_mitigations"],
      "properties":{
        "focus_themes":{"type":"array","items":{"type":"string"}},
        "weekly_plan":{"type":"array","minItems":4,"maxItems":4,"items":{"type":"object","properties":{
          "week":{"type":"number"},
          "goals":{"type":"array","items":{"type":"string"}},
          "metrics":{"type":"array","items":{"type":"string"}},
          "owner":{"type":"string"}
        }}},
        "milestones":{"type":"array","items":{"type":"object","properties":{
          "title":{"type":"string"},
          "due":{"type":"string"}
        }}},
        "risks_mitigations":{"type":"array","items":{"type":"object","properties":{
          "risk":{"type":"string"},
          "mitigation":{"type":"string"}
        }}}
      }
    }
  }
};

export interface AnalysisData {
  report_id: string;
  timeframe: {
    start: string;
    end: string;
  };
  kpis: Array<{
    name: string;
    value: number;
    unit?: string;
    target?: number;
    delta?: number;
  }>;
  trend_summary: string;
  insights: Array<{
    type: "win" | "risk" | "issue" | "opportunity";
    text: string;
  }>;
  score: number;
  charts: Array<{
    title: string;
    type: "line" | "bar" | "pie";
    series: Array<{
      name: string;
      points: Array<{
        x: string;
        y: number;
      }>;
    }>;
  }>;
  next_month_plan: {
    focus_themes: string[];
    weekly_plan: Array<{
      week: number;
      goals: string[];
      metrics: string[];
      owner: string;
    }>;
    milestones: Array<{
      title: string;
      due: string;
    }>;
    risks_mitigations: Array<{
      risk: string;
      mitigation: string;
    }>;
  };
}
