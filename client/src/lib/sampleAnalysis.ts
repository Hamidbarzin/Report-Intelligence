
// Sample AI output for when you don't have API key/backend
export const sampleAiJson = {
  report_id: "seed",
  timeframe: { start: "2025-08-15", end: "2025-09-15" },
  kpis: [
    { name: "Orders", value: 120, unit: "", target: 150, delta: 15 },
    { name: "On-time %", value: 92, unit: "%", target: 95, delta: 3 },
    { name: "Revenue", value: 42000, unit: "CAD", target: 50000, delta: 8000 }
  ],
  trend_summary: "Growth in orders and revenue; slight gap to targets.",
  insights: [
    { type: "win", text: "Same-day delivery uptake rose 18%" },
    { type: "risk", text: "Driver availability on weekends is tight" }
  ],
  score: 82,
  charts: [
    { title: "Orders per week", type: "line", series: [
      { name: "Orders", points: [
        { x: "2025-08-18", y: 22 },
        { x: "2025-08-25", y: 27 },
        { x: "2025-09-01", y: 31 },
        { x: "2025-09-08", y: 40 }
      ]}
    ]},
    { title: "Revenue", type: "bar", series: [
      { name: "CAD", points: [
        { x: "2025-08-18", y: 9000 },
        { x: "2025-08-25", y: 10000 },
        { x: "2025-09-01", y: 11000 },
        { x: "2025-09-08", y: 12000 }
      ]}
    ]}
  ],
  next_month_plan: {
    focus_themes: ["On-time rate", "B2B partnerships", "Cost per delivery"],
    weekly_plan: [
      { week: 1, goals: ["Audit late routes", "Pilot SMS ETA"], metrics: ["late%", "ETA open%"], owner: "Ops" },
      { week: 2, goals: ["Sign 2 partners", "Bundle pricing"], metrics: ["partners", "ARPU"], owner: "Sales" },
      { week: 3, goals: ["Optimize dispatch"], metrics: ["cost/stop", "utilization%"], owner: "Ops" },
      { week: 4, goals: ["Review targets", "QBR deck"], metrics: ["score", "target gap"], owner: "Exec" }
    ],
    milestones: [{ title: "2 B2B contracts", due: "2025-10-10" }],
    risks_mitigations: [{ risk: "Weekend capacity", mitigation: "Hire 2 PT drivers" }]
  }
};

export const sampleMarkdown = `
### Executive Summary
- Orders and revenue are growing.
- On-time rate close to target; needs attention.
- Opportunities in B2B partnerships and dispatch optimization.

**Top Wins**
- Same-day delivery uptake +18%.

**Key Risks**
- Weekend driver capacity.
`;
