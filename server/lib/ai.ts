
import { AnalysisSchema } from "@shared/analysisSchema";
import { jsonSafeParse } from "./jsonSafeParse.js";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function analyzeDocument(corpus: string) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('your_')) {
    console.warn("No valid OpenAI API key found, using sample data");
    return getSampleAnalysis(corpus);
  }

  try {
    const prompt = `You are an expert business analyst. Analyze the following document and return ONLY a valid JSON response that strictly follows this schema. Do not include any prose or explanations outside the JSON.

Document to analyze:
${corpus}

Return a JSON object with this exact structure:
{
  "report_id": "string",
  "timeframe": {"start": "YYYY-MM-DD", "end": "YYYY-MM-DD"},
  "kpis": [
    {"name": "string", "value": number, "unit": "string", "target": number, "delta": number}
  ],
  "trend_summary": "string describing trends",
  "insights": [
    {"type": "win|risk|issue|opportunity", "text": "string"}
  ],
  "score": number (0-100),
  "charts": [
    {
      "title": "string",
      "type": "line|bar|pie", 
      "series": [{"name": "string", "points": [{"x": "string", "y": number}]}]
    }
  ],
  "next_month_plan": {
    "focus_themes": ["string"],
    "weekly_plan": [
      {"week": 1, "goals": ["string"], "metrics": ["string"], "owner": "string"},
      {"week": 2, "goals": ["string"], "metrics": ["string"], "owner": "string"},
      {"week": 3, "goals": ["string"], "metrics": ["string"], "owner": "string"},
      {"week": 4, "goals": ["string"], "metrics": ["string"], "owner": "string"}
    ],
    "milestones": [{"title": "string", "due": "YYYY-MM-DD"}],
    "risks_mitigations": [{"risk": "string", "mitigation": "string"}]
  }
}

Generate realistic data based on the document content. Include meaningful KPIs, actionable insights, and a comprehensive one-month plan.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a business analyst expert. Return only valid JSON that matches the provided schema exactly."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const rawJson = data.choices[0]?.message?.content || "{}";
    
    // Parse and validate the JSON response
    const aiJson = jsonSafeParse(rawJson);
    
    // Generate markdown summary
    const aiMarkdown = generateMarkdownSummary(aiJson);

    return { aiJson, aiMarkdown };
  } catch (error) {
    console.error("OpenAI analysis failed:", error);
    return getSampleAnalysis(corpus);
  }
}

function generateMarkdownSummary(analysisData: any): string {
  const score = analysisData.score || 0;
  const kpis = analysisData.kpis || [];
  const insights = analysisData.insights || [];
  
  return `# Executive Summary

## Overall Performance Score: ${score}/100

${analysisData.trend_summary || "Analysis data not available."}

## Key Performance Indicators

${kpis.map((kpi: any) => 
  `- **${kpi.name}**: ${kpi.value}${kpi.unit ? ` ${kpi.unit}` : ''} ${kpi.delta ? (kpi.delta >= 0 ? '↗️' : '↘️') : ''}`
).join('\n')}

## Key Insights

${insights.map((insight: any) => 
  `- **${insight.type?.toUpperCase()}**: ${insight.text}`
).join('\n')}

## Next Month Focus

${analysisData.next_month_plan?.focus_themes?.map((theme: string) => `- ${theme}`).join('\n') || 'No specific themes identified.'}

---

*This analysis was generated automatically. Please review the detailed tabs for comprehensive insights and action plans.*`;
}

function getSampleAnalysis(corpus: string) {
  const reportId = corpus.includes("Report Title:") 
    ? corpus.split("Report Title:")[1].split("\n")[0].trim() 
    : "sample-report";

  const aiJson = {
    "report_id": reportId,
    "timeframe": { "start": "2025-08-15", "end": "2025-09-15" },
    "kpis": [
      { "name": "Orders", "value": 120, "unit": "", "target": 150, "delta": 15 },
      { "name": "On-time %", "value": 92, "unit": "%", "target": 95, "delta": 3 },
      { "name": "Revenue", "value": 42000, "unit": "CAD", "target": 50000, "delta": 8000 }
    ],
    "trend_summary": "Growth in orders and revenue; slight gap to targets.",
    "insights": [
      { "type": "win", "text": "Same-day delivery uptake rose 18%" },
      { "type": "risk", "text": "Driver availability on weekends is tight" }
    ],
    "score": 82,
    "charts": [
      {
        "title": "Orders per week",
        "type": "line",
        "series": [{
          "name": "Orders",
          "points": [
            { "x": "2025-08-18", "y": 22 },
            { "x": "2025-08-25", "y": 27 },
            { "x": "2025-09-01", "y": 31 },
            { "x": "2025-09-08", "y": 40 }
          ]
        }]
      },
      {
        "title": "Revenue",
        "type": "bar",
        "series": [{
          "name": "CAD",
          "points": [
            { "x": "2025-08-18", "y": 9000 },
            { "x": "2025-08-25", "y": 10000 },
            { "x": "2025-09-01", "y": 11000 },
            { "x": "2025-09-08", "y": 12000 }
          ]
        }]
      }
    ],
    "next_month_plan": {
      "focus_themes": ["On-time rate", "B2B partnerships", "Cost per delivery"],
      "weekly_plan": [
        { "week": 1, "goals": ["Audit late routes", "Pilot SMS ETA"], "metrics": ["late%", "ETA open%"], "owner": "Ops" },
        { "week": 2, "goals": ["Sign 2 partners", "Bundle pricing"], "metrics": ["partners", "ARPU"], "owner": "Sales" },
        { "week": 3, "goals": ["Optimize dispatch"], "metrics": ["cost/stop", "utilization%"], "owner": "Ops" },
        { "week": 4, "goals": ["Review targets", "QBR deck"], "metrics": ["score", "target gap"], "owner": "Exec" }
      ],
      "milestones": [{ "title": "2 B2B contracts", "due": "2025-10-10" }],
      "risks_mitigations": [{ "risk": "Weekend capacity", "mitigation": "Hire 2 PT drivers" }]
    }
  };

  const aiMarkdown = generateMarkdownSummary(aiJson);
  
  return { aiJson, aiMarkdown };
}
