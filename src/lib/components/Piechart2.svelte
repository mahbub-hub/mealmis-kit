<script lang="ts">
  import { Arc, PieChart, Text } from "layerchart";
  import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
  import * as Chart from "$lib/components/ui/chart/index.js";
  import * as Card from "$lib/components/ui/card/index.js";

  const chartData = [
    { browser: "Under", visitors: 10, color: "Orange" },
    { browser: "On Track", visitors: 8, color: "Green" },
    { browser: "Over Track", visitors: 6, color: "Blue" },

  ];
  const chartConfig = {
    Under: { label: "Under", color: "Orange" },
    Ontrack: { label: "On Track", color: "Green" },
    Overtrack: { label: "Over Track", color: "Blue" },
  } satisfies Chart.ChartConfig;
</script>

    <Chart.Container config={chartConfig} class="mx-auto aspect-square max-h-[550px]">
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
 
