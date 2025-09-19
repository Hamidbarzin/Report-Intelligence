// This file is server-side only and should not be used in the client
// It's here for organization but will be moved to server-side in actual implementation

import OpenAI from "openai";
import { jsonSafeParse } from "./jsonSafeParse";
import type { AIAnalysisResult } from "@shared/schema";

const openai = new OpenAI({ 
  apiKey: process.env.LLM_API_KEY || process.env.OPENAI_API_KEY 
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
          xKey: { type: "string" },
          yKey: { type: "string" }
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
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              metrics: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["title", "description", "metrics"]
          },
          minItems: 4,
          maxItems: 4
        },
        milestones: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              date: { type: "string" },
              status: { type: "string", enum: ["pending", "completed", "overdue"] }
            },
            required: ["title", "date", "status"]
          }
        },
        risks_mitigations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              mitigation: { type: "string" },
              priority: { type: "string", enum: ["low", "medium", "high"] }
            },
            required: ["title", "mitigation", "priority"]
          }
        }
      },
      required: ["weekly_plan", "milestones", "risks_mitigations"]
    }
  },
  required: ["kpis", "trend_summary", "insights", "score", "charts", "next_month_plan"]
};

export async function analyzeWithAI(corpus: string) {
  try {
    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an expert business intelligence analyst. Analyze the provided document corpus and extract key insights, KPIs, trends, and create actionable recommendations.

          Return your analysis as a JSON object with this exact structure:
          - kpis: Array of key performance indicators with name, value, description, trend (up/down/stable), and percentage
          - trend_summary: Brief summary of overall trends
          - insights: Array of key insights and findings
          - score: Overall report quality score (0-10)
          - charts: Array of chart specifications for data visualization
          - next_month_plan: Object with weekly_plan (4 weeks), milestones, and risks_mitigations

          Focus on actionable insights and realistic recommendations based on the document content.`
        },
        {
          role: "user",
          content: `Please analyze this document corpus and provide insights:\n\n${corpus}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const aiJsonText = response.choices[0].message.content || "{}";
    const aiJson = jsonSafeParse(aiJsonText, AI_ANALYSIS_SCHEMA) as AIAnalysisResult;

    // Generate executive summary
    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-5", 
      messages: [
        {
          role: "system",
          content: "You are a business analyst. Write a concise executive summary in markdown format based on the analysis results."
        },
        {
          role: "user",
          content: `Create an executive summary based on this analysis: ${JSON.stringify(aiJson)}`
        }
      ]
    });

    const aiMarkdown = summaryResponse.choices[0].message.content || "";

    return {
      json: aiJson,
      markdown: aiMarkdown,
      score: aiJson.score || 0
    };

  } catch (error) {
    console.error('AI analysis error:', error);
    throw new Error('Failed to analyze document with AI');
  }
}

export async function analyzeImageWithAI(base64Image: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all text, data, and insights from this image. Focus on numbers, charts, tables, and any business-relevant information."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_completion_tokens: 2048,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error('Image analysis error:', error);
    return "";
  }
}
