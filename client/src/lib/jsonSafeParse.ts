export function jsonSafeParse(jsonString: string): any {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    // Attempt to repair common JSON issues
    let repaired = jsonString.trim();
    
    // Remove potential markdown code block markers
    repaired = repaired.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    
    // Fix trailing commas
    repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
    
    // Fix missing quotes around keys
    repaired = repaired.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
    
    // Try parsing again
    try {
      return JSON.parse(repaired);
    } catch (secondError) {
      console.error("JSON parsing failed even after repair attempts:", secondError);
      console.error("Original string:", jsonString);
      console.error("Repaired string:", repaired);
      throw new Error("Failed to parse JSON response from AI");
    }
  }
}

function getDefaultAnalysisData() {
  return {
    report_id: "unknown",
    timeframe: { start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] },
    kpis: [],
    trend_summary: "Analysis data not available",
    insights: [],
    score: 0,
    charts: [],
    next_month_plan: {
      focus_themes: [],
      weekly_plan: [
        { week: 1, goals: [], metrics: [], owner: "" },
        { week: 2, goals: [], metrics: [], owner: "" },
        { week: 3, goals: [], metrics: [], owner: "" },
        { week: 4, goals: [], metrics: [], owner: "" }
      ],
      milestones: [],
      risks_mitigations: []
    }
  };
}
