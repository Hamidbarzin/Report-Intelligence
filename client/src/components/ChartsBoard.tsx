import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AnalysisData } from '@shared/analysisSchema';

interface ChartsBoardProps {
  data: AnalysisData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function ChartsBoard({ data }: ChartsBoardProps) {
  if (!data.charts || data.charts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No chart data available. Please analyze the report first.</p>
        </CardContent>
      </Card>
    );
  }

  const renderChart = (chart: AnalysisData['charts'][0], index: number) => {
    const chartData = chart.series[0]?.points.map(point => ({
      name: point.x,
      value: point.y,
      ...chart.series.reduce((acc, series, seriesIndex) => {
        const point = series.points.find(p => p.x === chart.series[0].points.find(p2 => p2.x === point.x)?.x);
        acc[series.name] = point?.y || 0;
        return acc;
      }, {} as Record<string, number>)
    })) || [];

    switch (chart.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {chart.series.map((series, seriesIndex) => (
                <Line 
                  key={seriesIndex}
                  type="monotone" 
                  dataKey={series.name} 
                  stroke={COLORS[seriesIndex % COLORS.length]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {chart.series.map((series, seriesIndex) => (
                <Bar 
                  key={seriesIndex}
                  dataKey={series.name} 
                  fill={COLORS[seriesIndex % COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = chart.series[0]?.points.map((point, pointIndex) => ({
          name: point.x,
          value: point.y,
          fill: COLORS[pointIndex % COLORS.length]
        })) || [];

        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Unsupported chart type: {chart.type}</div>;
    }
  };

  return (
    <div className="space-y-6">
      {data.charts.map((chart, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{chart.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderChart(chart, index)}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
