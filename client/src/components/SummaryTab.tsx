
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryTabProps {
  markdown: string;
}

export default function SummaryTab({ markdown }: SummaryTabProps) {
  if (!markdown) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No executive summary available. Please analyze the report first.</p>
        </CardContent>
      </Card>
    );
  }

  // Simple markdown to HTML conversion for basic formatting
  const formatMarkdown = (text: string) => {
    return text
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-medium mb-2">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^(?!<[h|l])/gm, '<p class="mb-4">')
      .replace(/(?<!>)$/gm, '</p>');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Executive Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: formatMarkdown(markdown) }}
        />
      </CardContent>
    </Card>
  );
}
