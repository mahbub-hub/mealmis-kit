<script lang="ts">
  import { BarChart } from "layerchart";
  import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
  import { scaleBand } from "d3-scale";
  import * as Chart from "$lib/components/ui/chart/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { cubicInOut } from "svelte/easing";

  const chartData = [
  { programme: "BEP", achievement: 86 },
  { programme: "MF", achievement: 95 },
  { programme: "UPG", achievement: 92 },
  { programme: "UDP", achievement: 80 },
  { programme: "BHP", achievement: 89 }
];

  const chartConfig = {
  achievement: {
    label: "Achievement",
    color: "#FDA5D5"
  }
} satisfies Chart.ChartConfig;
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Programme wise Achievement - (Reach)</Card.Title>
    <Card.Description>January - June 2025</Card.Description>
  </Card.Header>
  <Card.Content>
    <Chart.Container config={chartConfig}>
      <BarChart
        data={chartData}
        orientation="horizontal"
        yScale={scaleBand().padding(0.5)}
        y="programme"
        series={[{ key: "achievement", label: "Achievement", color: chartConfig.achievement.color }]}
        padding={{ left: 20 }}
        grid={false}
        rule={false}
        axis="y"
        props={{
          bars: {
            stroke: "none",
            radius: 5,
            insets: {
              left: 24,
            },
            rounded: "all",
            initialWidth: 0,
            initialX: 0,
            motion: {
              x: { type: "tween", duration: 500, easing: cubicInOut },
              width: { type: "tween", duration: 500, easing: cubicInOut },
            },
          },
          highlight: { area: { fill: "none" } },
          yAxis: { format: (d) => d.slice(0, 3) },
        }}
      >
        {#snippet tooltip()}
          <Chart.Tooltip hideLabel />
        {/snippet}
      </BarChart>
    </Chart.Container>
  </Card.Content>
  <Card.Footer>
    <div class="flex w-full items-start gap-2 text-sm">
      <div class="grid gap-2">
        <div class="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUpIcon class="size-4" />
        </div>
        <div class="text-muted-foreground flex items-center gap-2 leading-none">
          Showing total visitors for the last 6 months
        </div>
      </div>
    </div>
  </Card.Footer>
</Card.Root>
