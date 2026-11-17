<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
  	import * as Sheet from "$lib/components/ui/sheet/index.js";
  	import { buttonVariants } from "$lib/components/ui/button/index.js";
  	import { Input } from "$lib/components/ui/input/index.js";
  	import { Label } from "$lib/components/ui/label/index.js";
	import Linechart from "$lib/components/Linechart.svelte";
    import Piechart2 from "$lib/components/Piechart2.svelte";
	import { SlidersHorizontal } from "lucide-svelte";
	// -----------------------------
	// Types
	// -----------------------------
	  const chartData = [
    { date: new Date("2024-01-01"), desktop: 186, mobile: 80 },
    { date: new Date("2024-02-01"), desktop: 305, mobile: 200 },
    { date: new Date("2024-03-01"), desktop: 237, mobile: 120 },
    { date: new Date("2024-04-01"), desktop: 73, mobile: 190 },
    { date: new Date("2024-05-01"), desktop: 209, mobile: 130 },
    { date: new Date("2024-06-01"), desktop: 214, mobile: 140 },
  ];
	
    function clampPct(n: number) {
		return Math.max(0, Math.min(100, n));
	}
type IndicatorRow = {
		name: string;
		target: number;
		achievement: number;
		male: number;
		female: number;
		other: number;
		progressPct: number;
		progressTone: "success" | "warning" | "info";
	};
	const indicators = $state<IndicatorRow[]>([
		{
			name: "People trained in vocational skills",
			target: 1000,
			achievement: 850,
			male: 500,
			female: 350,
			other: 100,
			progressPct: 65,
			progressTone: "success"
		},
		{
			name: "Households with improved sanitation",
			target: 950,
			achievement: 900,
			male: 450,
			female: 400,
			other: 50,
			progressPct: 85,
			progressTone: "success"
		},
		{
			name: "Women with increased income",
			target: 905,
			achievement: 808,
			male: 300,
			female: 450,
			other: 58,
			progressPct: 75,
			progressTone: "info"
		}
	]);
// 	function fmt(n: number | string | null | undefined): string {
// 	const num =
// 		typeof n === "number"
// 			? n
// 			: typeof n === "string"
// 				? Number(n)
// 				: 0;

// 	return Number.isFinite(num) ? num.toLocaleString() : "0";
// }

	type GeoRow = {
		name: string;
		value: number;
		pct: number; // 0-100
	};
	// Geographic distribution (example)
	const geo = $state<GeoRow[]>([
		{ name: "Act1", value: 650, pct: 40 },
		{ name: "Act2", value: 420, pct: 26 },
		{ name: "Act3", value: 310, pct: 19 },
		{ name: "Act4", value: 240, pct: 15 },
		{ name: "Act5", value: 180, pct: 11 },
		{ name: "Act6", value: 160, pct: 10 },
		{ name: "Act7", value: 120, pct: 7 }
	]);

	type Cluster = "All Clusters" | "MF" | "Proverty" | "Health" | "Gender";
	type Programme = "All Programmes" | "WASH" | "Education" | "Health";
	type Project = "All Projects" | "WASH" | "Education" | "Health";
	type Division = "All Locations" | "Dhaka" | "Rajshahi" | "Chattogram" | "Khulna";
	type Year = 2024 | 2023 | 2022;
	type Month = "All" | "Jan" | "Feb" | "Mar";

	type Activity = "All Activities" | "Skill Training" | "Health Checkup" | "Hygiene Education" | "Financial Literacy";
	type IndicatorType = "All Types" | "Output" | "Outcome" | "Impact";

	type KPI = { label: string; value: string; sub?: string; tone?: "primary" | "success" | "secondary" | "accent" };
	type QuarterRow = { label: string; pct: number };
	type YearRow = { year: number; value: number };
	
	// -----------------------------
	// Runes state
	// -----------------------------

	const programmes: Programme[] = ["All Programmes", "WASH", "Education", "Health"];
	const projects: Project[] = ["All Projects", "WASH", "Education", "Health"];
	const clusters: Cluster[] = ["All Clusters", "MF", "Proverty", "Health", "Gender"];
	const divisions: Division[] = ["All Locations", "Dhaka", "Rajshahi", "Chattogram", "Khulna"];
	const years: Year[] = [2024, 2023, 2022];
	const months: Month[] = ["All", "Feb", "Jan", "Mar"];

	const activities: Activity[] = ["All Activities", "Skill Training", "Health Checkup", "Hygiene Education", "Financial Literacy"];
	const indicatorTypes: IndicatorType[] = ["All Types", "Output", "Outcome", "Impact"];

	const filters = $state({
		cluster: "All Clusters" as Cluster,
		programme: "All Programmes" as Programme,
		project: "All Projects" as Project,
		division: "All Locations" as Division,
		year: 2024 as Year,
		month: "All" as Month,
		activity: "All Activities" as Activity,
		indicatorType: "All Types" as IndicatorType
	});

	// Example values (swap with API)
	const male = $state(1680);
	const female = $state(920);
	const totalIndicators = $state(24);
	const avgAchievementPct = $state(85);

	const kpis = $derived<KPI[]>( [
		{ label: "Total Activity", value: String(totalIndicators), tone: "primary" },
		{ label: "Activity On Track", value: `${avgAchievementPct}%`, tone: "success" },
		]);

	const gender = $derived.by(() => {
		const total = (male ?? 0) + (female ?? 0) || 1;
		const malePct = Math.round(((male ?? 0) / total) * 100);
		const femalePct = 100 - malePct;
		return { total, malePct, femalePct };
	});

	const quarterly = $state<QuarterRow[]>([
		{ label: "Q1 2024", pct: 75 },
		{ label: "Q2 2024", pct: 82 },
		{ label: "Q3 2024", pct: 95 },
		{ label: "Q4 2024", pct: 68 }
	]);

	const yearly = $state<YearRow[]>([
		{ year: 2020, value: 1200 },
		{ year: 2021, value: 1450 },
		{ year: 2022, value: 1680 },
		{ year: 2023, value: 1920 },
		{ year: 2024, value: 2150 }
	]);

	// -----------------------------
	// Helpers
	// -----------------------------
	function safeNum(n: unknown) {
		const v = typeof n === "number" ? n : typeof n === "string" ? Number(n) : 0;
		return Number.isFinite(v) ? v : 0;
	}

	function fmt(n: unknown) {
		return safeNum(n).toLocaleString();
	}

	// Donut ring: stroke-dasharray based on percentage
	const donut = $derived.by(() => {
		const r = 52;
		const c = 2 * Math.PI * r;
		const pct = Math.max(0, Math.min(100, gender.malePct));
		const dash = (pct / 100) * c;
		const gap = c - dash;
		return { r, c, dash, gap, pct };
	});

	// Simple yearly trend line (SVG) — no external libs
	const yearChart = $derived.by(() => {
		const w = 720;
		const h = 210;
		const padX = 24;
		const padY = 22;

		const vals = yearly.map((d) => d.value);
		const min = Math.min(...vals);
		const max = Math.max(...vals);

		const xStep = (w - padX * 2) / Math.max(1, yearly.length - 1);
		const y = (v: number) => {
			if (max === min) return h / 2;
			const t = (v - min) / (max - min);
			return h - padY - t * (h - padY * 2);
		};

		const points = yearly.map((d, i) => ({ x: padX + i * xStep, y: y(d.value), year: d.year, value: d.value }));
		const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
		return { w, h, points, path, min, max };
	});
</script>

<svelte:head>
	<title>Activity Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<div class="mx-auto max-w-[1700px] px-3 py-5 sm:px-6 lg:px-8 2xl:px-10 2xl:py-8">
		<!-- Header -->
		<div class="flex items-center justify-between">
		<div class="mb-5">
			<h1 class="text-xl font-semibold">Activity Dashboard</h1>
			<p class="text-sm text-base-content/60">Detailed indicator analysis and performance metrics</p>
		</div>
		<div>
			<Sheet.Root>
			<Sheet.Trigger class={buttonVariants({ variant: "outline" })}>
			  <SlidersHorizontal class="size-6" />
				Filters
				</Sheet.Trigger
			>
			<Sheet.Content side="right">
				<Sheet.Header>
				<Sheet.Title>Activity Filters</Sheet.Title>
				<Sheet.Description>
					Make changes to your profile here. Click save when you're done.
				</Sheet.Description>
				</Sheet.Header>
				<div class="grid-cols-1 gap-6 px-4 space-y-5">
				<label class="form-control space-y-2">
					<div class="label mt-4"><span class="label-text">Cluster</span></div>
						<select class="select select-bordered w-full" bind:value={filters.cluster}>
							{#each clusters as c}
								<option value={c}>{c}</option>
							{/each}
						</select>
				</label>
				<label class="form-control space-y-2">
					<div class="label mt-4"><span class="label-text">Programme</span></div>
						<select class="select select-bordered w-full" bind:value={filters.programme}>
							{#each programmes as p}
								<option value={p}>{p}</option>
							{/each}
						</select>
				
				</label>
				<label class="form-control space-y-2">
					<div class="label mt-4"><span class="label-text">Project</span></div>
						<select class="select select-bordered w-full" bind:value={filters.project}>
							{#each projects as p}
								<option value={p}>{p}</option>
							{/each}
						</select>
				</label>	
							<label class="form-control space-y-2">
								<div class="label mt-4"><span class="label-text">Locations</span></div>
								<select class="select select-bordered w-full" bind:value={filters.division}>
									{#each divisions as d}
										<option value={d}>{d}</option>
									{/each}
								</select>
							</label>

							<label class="form-control space-y-2">
								<div class="label mt-4"><span class="label-text">Year</span></div>
								<select class="select select-bordered w-full" bind:value={filters.year}>
									{#each years as y}
										<option value={y}>{y}</option>
									{/each}
								</select>
							</label>
							<label class="form-control space-y-2">
								<div class="label mt-4"><span class="label-text">Month</span></div>
								<select class="select select-bordered w-full" bind:value={filters.month}>
									{#each months as m}
										<option value={m}>{m}</option>
									{/each}
								</select>
							</label>
							
				</div>
				<Sheet.Footer>
				<Button type="submit">Apply Filters</Button>
				<Sheet.Close class={buttonVariants({ variant: "outline" })}
					>Close</Sheet.Close
				>
				</Sheet.Footer>
			</Sheet.Content>
			</Sheet.Root>
		</div>
		</div> 
		<!-- 12-col system for large screens -->
		<div class="grid grid-cols-12 gap-4 2xl:gap-6">
			

			<!-- KPI row (4 cards) -->
			{#each kpis as k (k.label)}
				<div class="col-span-12 md:col-span-6 xl:col-span-3">
					<div class="card bg-base-100 shadow-sm transition hover:shadow-md">
						<div class="card-body">
							<div class="flex items-center justify-between gap-3">
								<div class="min-w-0">
									<p class="text-sm text-base-content/60">{k.label}</p>
									<p class="mt-1 text-2xl font-semibold">{k.value}</p>
									{#if k.sub}
										<p class="mt-1 text-xs text-base-content/50">{k.sub}</p>
									{/if}
								</div>

								<!-- icon bubble -->
								<div class={"rounded-2xl bg-base-200 p-3 " + (k.tone ? `text-${k.tone}` : "text-base-content/70")}>
									<svg viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="1.8">
										<path d="M4 19V5M10 19V9M16 19v-6M22 19V7" />
									</svg>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/each}
				
			<!-- Analytics row: Gender (left), Quarterly (mid), Yearly (right) -->
			
			<div class="col-span-12 xl:col-span-7 2xl:col-span-8">
				<div class="card bg-base-100 shadow-sm h-full">
					<div class="card-body">
						<div class="flex items-center justify-between">
							<h2 class="text-base font-semibold">Activity Off Track (<span class="text-red-500">15%</span>)</h2>
							<span class="badge badge-ghost">All Activities</span>
						</div>

						<div class="mt-3 overflow-x-auto">
							<table class="table">
								<thead>
									<tr>
										<th class="min-w-[270px]">Activity</th>
										<th class="min-w-[80px] text-right">Target</th>
										<th class="min-w-[80px] text-right">Achievement</th>
										<th class="min-w-[80px] text-right">Male</th>
										<th class="min-w-[80px] text-right">Female</th>
										<th class="min-w-[80px] text-right">Other</th>
										<th class="min-w-[220px]">Progress</th>
									</tr>
								</thead>

								<tbody>
									{#each indicators as row (row.name)}
										<tr>
											<td class="font-medium">{row.name}</td>
											<td class="text-right">{fmt(row.target)}</td>
											<td class="text-right">{fmt(row.achievement)}</td>
											<td class="text-right">{fmt(row.male)}</td>
											<td class="text-right">{fmt(row.female)}</td>
											<td class="text-right">{fmt(row.other)}</td>
											<td>
												<div class="flex items-center gap-3">
													<progress
														class={"progress w-full " +
															(row.progressTone === "success"
																? "progress-success"
																: row.progressTone === "warning"
																	? "progress-warning"
																	: "progress-info")}
														value={Math.max(0, Math.min(100, row.progressPct))}
														max="100"
													></progress>
													<span class="w-10 text-right text-xs text-base-content/60">{Math.max(0, Math.min(100, row.progressPct))}%</span>
												</div>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
			<div class="col-span-12 xl:col-span-4">
				<div class="card bg-base-100 shadow-sm h-full">
					<div class="card-body">
						<h2 class="text-base font-semibold">Achievement Status</h2>

						<div class="mt-4 grid grid-cols-12 items-center gap-4">
							<!-- Donut -->
							<div class="col-span-12 sm:col-span-6 md:col-span-6 xl:col-span-8 py-2 px-3">
							<Piechart2 />
							</div>
							
						</div>
					</div>
				</div>
			</div>

			<div class="col-span-12 xl:col-span-7 2xl:col-span-8">
				<div class="card bg-base-100 shadow-sm h-full">
					<div class="card-body">
						<div class="flex items-center justify-between">
							<h2 class="text-base font-semibold">Activity Performance Trend (Multiple activities)</h2>
							<span class="badge badge-ghost">All Activities</span>
						</div>

						<div class="mt-3 overflow-x-auto">
							
						<div class="mx-auto max-w-[800px]">
							<Linechart  />
						</div>
	
						</div>
					</div>
				</div>
			</div>
			<div class="col-span-12 xl:col-span-4">
				<div class="card bg-base-100 shadow-sm h-full">
					<div class="card-body">
						<!-- <h2 class="text-base font-semibold">Achievement Status</h2> -->

						<div class="mt-4 grid grid-cols-12 items-center gap-4">
							<!-- Donut -->
							<div class="col-span-12 sm:col-span-6 md:col-span-6 xl:col-span-8 py-2 px-3">
							<!-- <Piechart2 /> -->
							</div>
							
						</div>
					</div>
				</div>
			</div>

			<div class="col-span-12 xl:col-span-7 2xl:col-span-8">
				<div class="card bg-base-100 shadow-sm h-full">
					<div class="card-body">
						<div class="flex items-center justify-between">
							<h2 class="text-base font-semibold">Top 10 Activity</h2>
							<a href="/activity-view"><span class="badge badge-ghost">All Activities</span></a>
						</div>

						<div class="mt-3 space-y-3">
							{#each geo as g (g.name)}
								<div class="grid grid-cols-12 items-center gap-3">
									<div class="col-span-3 sm:col-span-2">
										<p class="text-sm font-medium truncate">{g.name}</p>
									</div>

									<div class="col-span-7 sm:col-span-8">
										<!-- use daisy progress for a clean bar look -->
										<progress class="progress progress-success w-full" value={clampPct(g.pct)} max="100"></progress>
									</div>

									<div class="col-span-2 text-right">
										<p class="text-xs text-base-content/60">{fmt(g.value)}</p>
										<p class="text-xs text-base-content/50">{clampPct(g.pct)}%</p>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
			<!-- <div class="col-span-12 xl:col-span-4">
				<div class="card bg-base-100 shadow-sm h-full">
					<div class="card-body">
						<h2 class="text-base font-semibold">Quarterly Performance</h2>

						<div class="mt-4 space-y-4">
							{#each quarterly as q (q.label)}
								<div class="grid grid-cols-12 items-center gap-3">
									<p class="col-span-5 text-sm text-base-content/70">{q.label}</p>
									<div class="col-span-5">
										<progress class="progress progress-success w-full" value={Math.max(0, Math.min(100, q.pct))} max="100" ></progress>
									</div>
									<p class="col-span-2 text-right text-sm text-base-content/70">{q.pct}%</p>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div> -->

			

			<!-- Details table (full width) -->
		
			<div class="col-span-12">
				<div class="card bg-base-100 shadow-sm gap-3">
					<div class="card-body gap-3">
						<h2 class="text-base font-semibold">Activity Performance Details</h2>

						<div class="mt-3 overflow-x-auto">
							<table class="table">
								<thead>
									<tr>
										<th class="min-w-[320px]">Activity</th>
										<th class="min-w-[100px] text-right">Target</th>
										<th class="min-w-[100px] text-right">Achievement</th>
										<th class="min-w-[100px] text-right">Male</th>
										<th class="min-w-[100px] text-right">Female</th>
										<th class="min-w-[80px] text-right">Other</th>
										<th class="min-w-[250px]">Progress</th>
									</tr>
								</thead>

								<tbody>
									{#each indicators as row (row.name)}
										<tr>
											<td class="font-medium">{row.name}</td>
											<td class="text-right">{fmt(row.target)}</td>
											<td class="text-right">{fmt(row.achievement)}</td>
											<td class="text-right">{fmt(row.male)}</td>
											<td class="text-right">{fmt(row.female)}</td>
											<td class="text-right">{fmt(row.other)}</td>
											<td>
												<div class="flex items-center gap-3">
													<progress
														class={"progress w-full " +
															(row.progressTone === "success"
																? "progress-success"
																: row.progressTone === "warning"
																	? "progress-warning"
																	: "progress-info")}
														value={Math.max(0, Math.min(100, row.progressPct))}
														max="100"
													></progress>
													<span class="w-10 text-right text-xs text-base-content/60">{Math.max(0, Math.min(100, row.progressPct))}%</span>
												</div>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>

						<p class="mt-3 text-xs text-base-content/50">
							Table supports horizontal scroll on smaller screens; on large monitors it expands naturally.
						</p>
					</div>
				</div>
			</div>
			
		
		</div>
		
		<div class="h-6"></div>
	</div>
</div>
