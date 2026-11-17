<script lang="ts">
	import { goto } from "$app/navigation";
	import DisaggregationPie from "$lib/components/DisaggregationPie.svelte";
    import Targetchart from "$lib/components/Targetchart.svelte";
	import FilterSheet from "$lib/components/FilterSheet.svelte";

	const { data } = $props();
	let viewDetails = $state(false);
	function viewDetailsToggle() {
		viewDetails = !viewDetails;
	}

	type Filters = {
		cluster: string;
		programme: string;
		division: string;
		district: string;
		year: string;
	};

	const clusters = [
		{ label: "All Clusters", value: "all" },
		{ label: "ASC", value: "asc" },
		{ label: "IDP", value: "idp" },
		{ label: "MF", value: "mf" }
	];

	const programmes = [
		{ label: "All Programmes", value: "all" },
		{ label: "Programme A", value: "programme-a" },
		{ label: "Programme B", value: "programme-b" }
	];

	const divisions = [
		{ label: "All Divisions", value: "all" },
		{ label: "Dhaka", value: "dhaka" },
		{ label: "Chattogram", value: "chattogram" }
	];

	const districts = [
		{ label: "All Districts", value: "all" },
		{ label: "Faridpur", value: "faridpur" },
		{ label: "Cumilla", value: "cumilla" },
		{ label: "Cox's Bazar", value: "coxs-bazar" }
	];

	const districtsByDivision = {
		all: districts,
		dhaka: [
			{ label: "All Districts", value: "all" },
			{ label: "Faridpur", value: "faridpur" }
		],
		chattogram: [
			{ label: "All Districts", value: "all" },
			{ label: "Cumilla", value: "cumilla" },
			{ label: "Cox's Bazar", value: "coxs-bazar" }
		]
	};

	const years = [
		{ label: "2024", value: "2024" },
		{ label: "2025", value: "2025" },
		{ label: "2026", value: "2026" }
	];

	let selectedFilters = $state<Filters>({
		cluster: "all",
		programme: "all",
		division: "all",
		district: "all",
		year: "2024"
	});

	async function handleApply(filters: Filters) {
		selectedFilters = { ...filters };

		const params = new URLSearchParams({
			cluster: filters.cluster,
			programme: filters.programme,
			division: filters.division,
			district: filters.district,
			year: filters.year
		});

		await goto(`?${params.toString()}`, {
			keepFocus: true,
			noScroll: true,
			replaceState: true
		});
	}
	
    const indicatorType = ["OUTPUT", "OUTCOME", "IMPACT"];	
	const projects = ["ALL", "Project 1", "Project 2", "Project 3"];	
	// ✅ avoid “state_referenced_locally” warnings by deriving from `data`
	// const clusters = $derived(data.clusters ?? []);
	// const programmes = $derived(data.programmes ?? []);
	// const projects = $derived(data.projects ?? []);
	// const indicators = $derived(data.indicators ?? []);
	// const indicatorType = $derived(data.indicatorType ?? []);
    
	type IndicatorRow = {
		name: string;
		type: "Output" | "Outcome" | "Impact";
		target: number;
		achievement: number;
		progressPct: number;
		progressTone: "success" | "warning" | "info";
	};

	const indicators = $state<IndicatorRow[]>([
		{
			name: "People trained in vocational skills",
			type: "Output",
			target: 1000,
			achievement: 850,
			progressPct: 85,
			progressTone: "success"
		},
		{
			name: "Households with improved sanitation",
			type: "Outcome",
			target: 95,
			achievement: 90,
			progressPct: 84,
			progressTone: "warning"
		},
		{
			name: "Women with increased income",
			type: "Impact",
			target: 95,
			achievement: 88,
			progressPct: 92,
			progressTone: "info"
		}
	]);

function buildFilters() {
	return {
		cluster: data.filters.cluster,
		programme: data.filters.programme,
		project: data.filters.project,
		indicatorType: data.filters.indicatorType,
		indicatorId: data.filters.indicatorId,
		startYear: data.filters.startYear,
		endYear: data.filters.endYear
		};
}

const filters = $state(buildFilters());

const fmt = (n: unknown) => {
	const num = typeof n === "number" ? n : typeof n === "string" ? Number(n) : 0;
		return Number.isFinite(num) ? num.toLocaleString() : "0";
};

</script>

<div class="w-full">
	<div class="mx-auto max-w-screen-2xl px-4 2xl:px-6 py-4 space-y-4">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div class=" gap-1">
				<h1 class="text-xl font-semibold">Indicators Dashboard</h1>
				<p class="text-sm opacity-70">Filter indicators and review yearly achievement + disaggregation.</p>
			</div>
			<div>

			<FilterSheet
				{clusters}
				{programmes}
				{divisions}
				{districts}
				{districtsByDivision}
				{years}
				value={selectedFilters}
				onApply={handleApply}
			/>
			</div>
		</div> 

		<!-- KPI row -->
		<div class="grid grid-cols-12 gap-3">
			<div class="col-span-12 sm:col-span-6 xl:col-span-3">
				<div class="card bg-base-100 border border-base-300">
					<div class="card-body p-4">
						<div class="text-xs opacity-70">Total Indicators</div>
						<div class="text-2xl font-semibold">45</div>
						<p class="flex items-end"><a href="/">View details</a></p>
					</div>
				</div>
			</div>

			<div class="col-span-12 sm:col-span-6 xl:col-span-3">
				<div class="card bg-base-100 border border-base-300">
					<div class="card-body p-4">
						<div class="text-xs opacity-70">Programme Output Indicators</div>
						<div class="text-2xl font-semibold">25</div>
						<p class="flex items-end"><a href="/">View details</a></p>
					</div>
				</div>
			</div>

			<div class="col-span-12 sm:col-span-6 xl:col-span-3">
				<div class="card bg-base-100 border border-base-300">
					<div class="card-body p-4">
						<div class="text-xs opacity-70">Programme Outcome Indicators</div>
						<div class="text-2xl font-semibold">15</div>
						<p class="flex items-end"><a href="/">View details</a></p>
					</div>
				</div>
			</div>

			<div class="col-span-12 sm:col-span-6 xl:col-span-3">
				<div class="card bg-base-100 border border-base-300">
					<div class="card-body p-4">
						<div class="text-xs opacity-70">BRAC Outcome Indicators</div>
						<div class="text-2xl font-semibold">5</div>
						<p class="flex items-end"><a href="/">View details</a></p>
					</div>
				</div>
			</div>
		</div>
		
		<!-- Table (large screen friendly) -->
		<div class="card bg-base-100 border border-base-300">
			<div class="card bg-base-100 shadow-sm">
					<div class="card-body">
						<h2 class="text-base font-semibold">Indicator Performance Details</h2>

						<div class="mt-3 overflow-x-auto">
							<table class="table">
								<thead>
									<tr>
										<th class="min-w-80">Indicator</th>
										<th class="min-w-30">Type</th>
										<th class="min-w-30 text-right">Target</th>
										<th class="min-w-35 text-right">Achievement</th>
										<th class="min-w-65">Progress</th>
										<th class="min-w-40">Actions</th>
									</tr>
								</thead>

								<tbody>
									{#each indicators as row (row.name)}
										<tr>
											<td class="font-medium">{row.name}</td>
											<td class="text-sm text-base-content/70">{row.type}</td>
											<td class="text-right">{fmt(row.target)}</td>
											<td class="text-right">{fmt(row.achievement)}</td>
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
											<td>
												<button onclick={viewDetailsToggle} class="btn btn-sm btn-outline">View Details</button>
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
		<!-- Charts row -->
		{#if viewDetails}
		<div class="grid grid-cols-12 gap-3">
			<div class="col-span-12 xl:col-span-7">
				<div class="card bg-base-100 border border-base-300">
					<div class="card-body p-4">
						<div class="flex items-center justify-between">
							<div>
								<div class="font-medium">Target vs Achievement</div>
								<div class="text-xs opacity-70">{filters.startYear} — {filters.endYear}</div>
							</div>
						</div>

						<div class="mt-3 h-70 md:h-80 xl:h-90">
							<Targetchart />
						</div>
					</div>
				</div>
			</div>

			<div class="col-span-12 xl:col-span-5">
				<div class="card bg-base-100 border border-base-300">
					<div class="card-body p-4">
						<div>
							<div class="font-medium">Disaggregation</div>
							<div class="text-xs opacity-70">Male / Female / Other</div>
						</div>

						<div class="mt-3 h-65 md:h-75 xl:h-90">
							<DisaggregationPie />
						</div>

						<div class="mt-2 grid grid-cols-3 gap-2 text-center text-sm">
							<div class="rounded-box border border-base-300 p-2">
								<div class="text-xs opacity-70">Male</div>
								<div class="font-semibold">{fmt(data.charts.disagg.male)}</div>
							</div>
							<div class="rounded-box border border-base-300 p-2">
								<div class="text-xs opacity-70">Female</div>
								<div class="font-semibold">{fmt(data.charts.disagg.female)}</div>
							</div>
							<div class="rounded-box border border-base-300 p-2">
								<div class="text-xs opacity-70">Other</div>
								<div class="font-semibold">{fmt(data.charts.disagg.other)}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- KPI row -->
		<div class="grid grid-cols-12 gap-3">
			<div class="col-span-12 sm:col-span-6 xl:col-span-3">
				<div class="card bg-base-100 border border-base-300">
					<div class="card-body p-4">
						<div class="text-xs opacity-70">As of Target</div>
						<div class="text-2xl font-semibold">{fmt(data.kpis.totalTarget)}</div>
					</div>
				</div>
			</div>

			<div class="col-span-12 sm:col-span-6 xl:col-span-3">
				<div class="card bg-base-100 border border-base-300">
					<div class="card-body p-4">
						<div class="text-xs opacity-70">As of Achieved</div>
						<div class="text-2xl font-semibold">{fmt(data.kpis.totalAchieved)}</div>
					</div>
				</div>
			</div>

			<div class="col-span-12 sm:col-span-6 xl:col-span-3">
				<div class="card bg-base-100 border border-base-300">
					<div class="card-body p-4">
						<div class="text-xs opacity-70">Avg Achievement</div>
						<div class="flex items-end gap-2">
							<div class="text-2xl font-semibold">{Math.round(data.kpis.avgAchievementPct)}%</div>
							<div class="text-xs opacity-60 pb-1">overall</div>
						</div>
						<progress class="progress progress-primary w-full" value={data.kpis.avgAchievementPct} max="100"></progress>
					</div>
				</div>
			</div>
		</div>
		{/if}
	
		
	</div>
	
	
</div>
