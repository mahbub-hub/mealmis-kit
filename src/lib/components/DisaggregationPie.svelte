<script lang="ts">
	import * as Chart from "$lib/components/ui/chart/index.js";
	import { PieChart } from "layerchart";

	const pieData = [
		{ name: "Male", count: 50, key: "male" },
		{ name: "Female", count: 45, key: "female" },
		{ name: "Other", count:  10, key: "other" }
	];

	const chartConfig = {
		male: { label: "Male", color: "#00D390" },
		female: { label: "Female", color: "#FCB700" },
		other: { label: "Other", color: "#007BFF" }
	} satisfies Chart.ChartConfig;
</script>

<Chart.Container config={chartConfig} class="h-full w-full">
	<PieChart
		data={pieData}
		value="count"
		label="name"
		series={[
			{ key: "male", label: "Male", color: chartConfig.male.color },
			{ key: "female", label: "Female", color: chartConfig.female.color },
			{ key: "other", label: "Other", color: chartConfig.other.color }
		]}
		legend
	>
		{#snippet tooltip()}
			<Chart.Tooltip />
		{/snippet}
	</PieChart>
</Chart.Container>
