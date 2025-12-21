import { TrendingDown, TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDarkMode } from "@/providers/DarkModeProvider";

type RawDataPoint = {
  monthdate: string;
  medianlistingprice: number;
};

type ChartLineDefaultProps = {
  data: RawDataPoint[];
};

function formatMonthYear(monthdate: string) {
  const year = monthdate.slice(0, 4);
  const month = parseInt(monthdate.slice(4), 10) - 1;
  return new Date(Number(year), month).toLocaleString("default", {
    month: "short",
    year: "numeric",
  });
}

const chartConfig = {
  medianlistingprice: {
    label: "Median Listing Price: $",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function ChartLineDefault({ data }: ChartLineDefaultProps) {
  if (!data || data.length < 2) {
    return null;
  }

  const chartData = data.map((row) => ({
    month: formatMonthYear(row.monthdate),
    medianlistingprice: row.medianlistingprice,
  }));

  const consecutiveYear = [...data]
    .sort((a, b) => b.monthdate.localeCompare(a.monthdate))
    .slice(0, 13);

  const [currentMonth, previousMonth] = consecutiveYear;
  const percentChange =
    ((currentMonth.medianlistingprice - previousMonth.medianlistingprice) /
      previousMonth.medianlistingprice) *
    100;

  const trend = {
    direction: percentChange >= 0 ? "up" : "down",
    percentage: Math.abs(percentChange).toFixed(1),
  };

  const { isDarkMode } = useDarkMode();

return (
  <Card 
    className={
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800' 
        : "bg-white/80 border-blue-200/50"
    }
  >
      <CardHeader>
        <CardTitle>Median Listing Price Over Time</CardTitle>
        <CardDescription>Historical Monthly Prices</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[150px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Line
              dataKey="medianlistingprice"
              type="natural"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {trend.direction === "up" ? (
            <>
              Trending up by {trend.percentage}% from previous year
              <TrendingUp className="h-4 w-4 text-green-500" />
            </>
          ) : trend.direction === "down" ? (
            <>
              Trending down by {trend.percentage}% from previous year
              <TrendingDown className="h-4 w-4 text-red-500" />
            </>
          ) : (
            <>No trend data available</>
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          Showing monthly median prices from{" "}
          {formatMonthYear(data[0].monthdate)} to{" "}
          {formatMonthYear(data[data.length - 1].monthdate)}
        </div>
      </CardFooter>
    </Card>
  );
}