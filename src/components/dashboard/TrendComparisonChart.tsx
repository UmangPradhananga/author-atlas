
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface TrendData {
  month: string;
  submissions: number;
  published: number;
  rejected: number;
}

interface TrendComparisonChartProps {
  data: TrendData[];
  title: string;
}

const TrendComparisonChart = ({ data, title }: TrendComparisonChartProps) => {
  const config = {
    submissions: {
      label: "Submissions",
      theme: {
        light: "#2563eb",
        dark: "#3b82f6"
      }
    },
    published: {
      label: "Published",
      theme: {
        light: "#10b981",
        dark: "#34d399"
      }
    },
    rejected: {
      label: "Rejected",
      theme: {
        light: "#ef4444",
        dark: "#f87171"
      }
    }
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer config={config} className="h-[300px]">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <ChartTooltip
              content={
                <ChartTooltipContent />
              }
            />
            <Line 
              type="monotone" 
              dataKey="submissions" 
              stroke="var(--color-submissions)" 
              strokeWidth={2} 
              dot={{ r: 4 }} 
              activeDot={{ r: 6 }} 
            />
            <Line 
              type="monotone" 
              dataKey="published" 
              stroke="var(--color-published)" 
              strokeWidth={2}
              dot={{ r: 4 }} 
              activeDot={{ r: 6 }} 
            />
            <Line 
              type="monotone" 
              dataKey="rejected" 
              stroke="var(--color-rejected)" 
              strokeWidth={2}
              dot={{ r: 4 }} 
              activeDot={{ r: 6 }}  
            />
            <Legend />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TrendComparisonChart;
