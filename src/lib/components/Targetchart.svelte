<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Chart from "$lib/components/ui/chart/index.js";
  import { scaleBand } from "d3-scale";
  import { BarChart, Highlight, type ChartContextValue } from "layerchart";
  import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
  import { cubicInOut } from "svelte/easing";

  const chartData = [
    { year: "2021", target: 186, achievement: 180 },
    { year: "2022", target: 305, achievement: 300 },
    { year: "2023", target: 237, achievement: 220 },
    { year: "2024", target: 203, achievement: 190 },
  ];

  const chartConfig = {
    target: { label: "Target", color: "#f4ce6e" },
    achievement: { label: "Achievement", color: "#7ff9d1"},
  } satisfies Chart.ChartConfig;

  let context = $state<ChartContextValue>();
</script>


    <Chart.Container config={chartConfig} class="h-full w-full">
      <BarChart
        bind:context
        data={chartData}
        xScale={scaleBand().padding(0.25)}
        x="year"
        axis="x"
        rule={false}
        series={[
          {
            key: "target",
            label: "Target",
            color: chartConfig.target.color,
            props: { rounded: "bottom" },
          },
          {
            key: "achievement",
            label: "Achievement",
            color: chartConfig.achievement.color,
          },
        ]}
        seriesLayout="stack"
        props={{
          bars: {
            stroke: "none",
            initialY: context?.height,
            initialHeight: 0,
            motion: {
              y: { type: "tween", duration: 500, easing: cubicInOut },
              height: { type: "tween", duration: 500, easing: cubicInOut },
            },
          },
          highlight: { area: false },
          xAxis: { format: (d) => d.slice(0, 4) },
        }}
        legend
      >
        {#snippet belowMarks()}
          <Highlight area={{ class: "fill-muted" }} />
        {/snippet}

        {#snippet tooltip()}
          <Chart.Tooltip />
        {/snippet}
      </BarChart>
    </Chart.Container>



