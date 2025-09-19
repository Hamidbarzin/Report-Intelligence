import OpenAI from "openai";
import type { AIAnalysis } from "@shared/schema";
import { jsonSafeParse } from "./jsonSafeParse";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.LLM_API_KEY 
});

const AI_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    kpis: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          value: { type: "string" },
          description: { type: "string" },
          trend: { type: "string", enum: ["up", "down", "stable"] },
          percentage: { type: "number" }
        },
        required: ["name", "value", "description", "trend", "percentage"]
      }
    },
    trend_summary: { type: "string" },
    insights: {
      type: "array",
      items: { type: "string" }
    },
    score: { type: "number", minimum: 0, maximum: 10 },
    charts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["line", "bar", "pie", "area"] },
          title: { type: "string" },
          data: { type: "array" },
          xAxisKey: { type: "string" },
          yAxisKey: { type: "string" }
        },
        required: ["type", "title", "data"]
      }
    },
    next_month_plan: {
      type: "object",
      properties: {
        weekly_plan: {
          type: "array",
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                metrics: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["title", "description"]
            }
          }
        },
        milestones: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              date: { type: "string" },
              completed: { type: "boolean" }
            },
            required: ["title", "date", "completed"]
          }
        },
        risks_mitigations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              mitigation: { type: "string" },
              severity: { type: "string", enum: ["high", "medium", "low"] }
            },
            required: ["title", "mitigation", "severity"]
          }
        }
      },
      required: ["weekly_plan", "milestones", "risks_mitigations"]
    }
  },
  required: ["kpis", "trend_summary", "insights", "score", "charts", "next_month_plan"]
};

export async function analyzeDocument(corpus: string): Promise<{ aiJson: AIAnalysis; aiMarkdown: string }> {
  const prompt = `Analyze the following document corpus and provide a comprehensive intelligence report.

Document Content:
${corpus}

Please provide:
1. Executive summary in markdown format
2. Structured JSON analysis following the exact schema

Return your response as JSON with two fields:
- "markdown": Executive summary in markdown format
- "analysis": Structured analysis following the schema

The analysis must include:
- KPIs with quantified metrics and trends
- Trend summary highlighting key patterns
- Strategic insights and recommendations
- Overall quality score (0-10)
- Charts configuration for data visualization
- 30-day action plan with weekly breakdown, milestones, and risk mitigations

Ensure all data points are realistic and actionable based on the provided content.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const result = jsonSafeParse(response.choices[0].message.content || "{}");
    
    if (!result.markdown || !result.analysis) {
      throw new Error("Invalid AI response format");
    }

    return {
      aiJson: result.analysis as AIAnalysis,
      aiMarkdown: result.markdown as string
    };
  } catch (error) {
    console.error("AI analysis failed:", error);
    throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function analyzeImage(base64Image: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all text content from this image. If it contains charts, graphs, or data visualizations, describe the data points, trends, and key metrics shown. Provide a comprehensive text representation of all information visible in the image."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_completion_tokens: 2048
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Image analysis failed:", error);
    throw new Error(`Image analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
