<script lang="ts">
	import * as Chart from "$lib/components/ui/chart/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { BarChart } from "layerchart";

	// type Row = { year: number; target: number; achieved: number };
	// const { data } = $props<{ data: Row[] }>();
	const chartData = [
		{ year: 2021, target: 90, achieved: 85 },
		{ year: 2022, target: 100, achieved: 95 },
		{ year: 2023, target: 110, achieved: 105 },
		{ year: 2024, target: 120, achieved: 115 },
		{year: 2025, target: 130, achieved: 125 }
	];

	const chartConfig = {
		target: { label: "Target", color: "#f4ce6e" },
		achieved: { label: "Achieved", color: "#7ff9d1" }
	} satisfies Chart.ChartConfig;

 </script>

<!-- You can also wrap this with Card in the page; keeping it pure chart here -->
<Chart.Container config={chartConfig} class="h-full w-full">
	<BarChart
		data={chartData}
		x="year"
		series={[
			{ key: "target", label: chartConfig.target.label, color: chartConfig.target.color },
			{ key: "achieved", label: chartConfig.achieved.label, color: chartConfig.achieved.color }
		]}
		legend
		props={{
			xAxis: { format: (d: any) => String(d) }
		}}
	>
		{#snippet tooltip()}
			<Chart.Tooltip />
		{/snippet}
	</BarChart>
</Chart.Container>
