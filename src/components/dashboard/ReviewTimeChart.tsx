
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartData {
  month: string;
  days: number;
}

interface ReviewTimeChartProps {
  data: ChartData[];
}

const ReviewTimeChart = ({ data }: ReviewTimeChartProps) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Average Review Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis unit=" days" />
            <Tooltip formatter={(value) => [`${value} days`, 'Average Time']} />
            <Legend />
            <Bar dataKey="days" fill="#7c3aed" name="Average Review Time (Days)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ReviewTimeChart;
