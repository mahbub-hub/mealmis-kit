<script lang="ts">
  import { Arc, PieChart, Text } from "layerchart";
  import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
  import * as Chart from "$lib/components/ui/chart/index.js";
  import * as Card from "$lib/components/ui/card/index.js";

  const chartData = [
    { browser: "Male", visitors: 275, color: "Pink" },
    { browser: "Female", visitors: 200, color: "#ec008c" },

  ];
  const chartConfig = {
    visitors: { label: "Visitors" },
    Male: { label: "Male", color: "Pink" },
    Female: { label: "Female", color: "#ec008c" },
  } satisfies Chart.ChartConfig;
</script>

<Card.Root class="flex flex-col">
  <Card.Header class="items-center">
    <Card.Title>Gender wise data</Card.Title>
    <Card.Description>January - June 2024</Card.Description>
  </Card.Header>
  <Card.Content class="flex-1">
    <Chart.Container config={chartConfig} class="h-full w-full">
      <PieChart
        data={chartData}
        key="browser"
        value="visitors"
        cRange={chartData.map((d) => d.color)}
        c="color"
        props={{
          pie: {
            motion: "tween",
          },
        }}
      >
        {#snippet tooltip()}
          <Chart.Tooltip hideLabel />
        {/snippet}
        {#snippet arc({ props, visibleData, index })}
          {@const browser = visibleData[index].browser}
          <Arc {...props}>
            {#snippet children({ getArcTextProps })}
              <Text
                value={browser}
                {...getArcTextProps("centroid")}
                font-size="12"
                class="fill-background capitalize"
              />
            {/snippet}
          </Arc>
        {/snippet}
      </PieChart>
    </Chart.Container>
  </Card.Content>
  <Card.Footer class="flex-col gap-2 text-sm">
    <div class="flex items-center gap-2 leading-none font-medium">
      Trending up by 5.2% this month <TrendingUpIcon class="size-4" />
    </div>
    <div class="text-muted-foreground leading-none">
      Showing total visitors for the last 6 months
    </div>
  </Card.Footer>
</Card.Root>
