<script lang="ts">
	import Menubar from "$lib/components/Menubar.svelte";

	type GeoItem = {
		name: string;
		value: number;
		pct: number;
	};

	type ActivityItem = {
		title: string;
		subtitle: string;
		when: string;
		tone: "success" | "warning" | "info" | "neutral";
	};

	type ResultRow = {
		source: string;
		condition: string;
		participants: string;
		result: string;
	};

	const fmt = (n: number) => n.toLocaleString();
	const clampPct = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

	function activityDot(tone: ActivityItem["tone"]) {
		switch (tone) {
			case "success":
				return "bg-success";
			case "warning":
				return "bg-warning";
			case "info":
				return "bg-info";
			default:
				return "bg-neutral";
		}
	}

	// Key findings visual bars
	const geo: GeoItem[] = [
		{ name: "Above WB $3/day line", value: 83, pct: 12.21 },
		{ name: "Below WB $3/day line", value: 597, pct: 87.79 },
		{ name: "Above BBS LPL", value: 538, pct: 79.12 },
		{ name: "Below BBS LPL", value: 142, pct: 20.88 },
		{ name: "Earn below BDT 20,000/month", value: 314, pct: 46.1 }
	];

	const recentActivities: ActivityItem[] = [
		{
			title: "Do you know 20% of UPG members are out of poverty line?" , 
			subtitle: "BRAC’s UPG Programme supports extremely poor households through assets, training, and two years of support, targeting families with very low and unstable incomes.", 
			when: "Latest analytical round",
			tone: "info"
		},
		{
			title: "Do you know 90% of graduated Students can't continue their SSC?", 
			subtitle: "Education continuity remains a critical concern, with approximately 90% of graduated students unable to progress to the Secondary School Certificate (SSC) level.",
			when: "Comparative assessment",
			tone: "success"
		},
		{
			title: "Do you know 50% of the participants from SDP can't continue their job in 2 years after comppleting the training?", 
			subtitle: "Despite completing training, half of SDP participants are unable to retain their jobs beyond two years, highlighting challenges in long-term employment sustainability.",
			when: "Programme learning review",
			tone: "warning"
		},
		{
			title: "Do you know 20% of UPG members are out of poverty line?", 
			subtitle: "One in five UPG members has risen above the poverty line, reflecting positive progress in poverty reduction.",
			when: "Descriptive analysis",
			tone: "neutral"
		}
	];

	const results: ResultRow[] = [
		{
			source: "UPGP",
			condition:
				"Productive assets at least double the initial transfer value and at least three income sources",
			participants: "69,242 participants",
			result: "97% of 2023 cohort identified as graduated from extreme poverty"
		},
		{
			source: "BBS",
			condition: "Lower Poverty Line (LPL): Tk 3,115 per capita income of household members",
			participants: "680 surveyed households",
			result: "79% of surveyed households earn above the LPL"
		},
		{
			source: "World Bank",
			condition: "International Poverty Line for Bangladesh: $3.00/day (2022 PPP)",
			participants: "680 surveyed households",
			result: "12% of surveyed households earn above the IPL"
		}
	];

	const incomeBands = [
		{ band: "0–10,000", hh: 77 },
		{ band: "10,000–20,000", hh: 237 },
		{ band: "20,000–30,000", hh: 171 },
		{ band: "30,000–40,000", hh: 99 },
		{ band: "40,000–50,000", hh: 40 },
		{ band: "50,000–60,000", hh: 29 },
		{ band: "60,000–70,000", hh: 17 },
		{ band: "Above 70,000", hh: 10 }
	];
</script>

<svelte:head>
	<title>BRAC Insights</title>
</svelte:head>

<div class="min-h-screen bg-base-300">
	<Menubar />

	<div class="mx-auto max-w-[1600px] px-3 py-5 sm:px-6 lg:px-8 2xl:px-10 2xl:py-8">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div class="mb-5">
				<h1 class="text-xl font-semibold">BRAC Insights</h1>
				<p class="text-sm text-base-content/60">Overall system performance and key metrics</p>
			</div>
		</div>

		<div class="grid grid-cols-12 gap-5">
			<!-- Main article -->
			<div class="col-span-12 xl:col-span-7 2xl:col-span-8">
				<div class="card bg-base-100 shadow-sm px-5 h-full">
					<div class="card-body">
						<div class="flex flex-col mb-5 gap-3">
							<h1 class="font-semibold text-6xl mt-5">
								Have UPG-supported households achieved income levels above the poverty lines?
							</h1>
							<span class="badge-ghost mt-5 text-3xl w-fit">
								Do the current UPG graduation criteria reliably reflect improvements in income-based poverty status?
							</span>
						</div>

						<div class="prose prose-sm max-w-none mt-4 text-xl">
							<p>
								BRAC’s Ultra Poor Graduation (UPG) Programme supports households living in extreme
								poverty through asset transfers, skills training, coaching, and handholding over a
								two-year period. At entry, household income is a key targeting criterion, but at
								graduation income level itself is not part of the formal graduation screening. Instead,
								BRAC assesses whether asset values have doubled and whether households have diversified
								into three or more income sources.
							</p>
							<div class="mt-5"></div>
							<p>
								To test whether these graduation criteria reflect actual income-based progress out of
								poverty, the report analysed midterm survey data for 680 graduated households using two
								benchmarks: the Bangladesh Bureau of Statistics (BBS) Lower Poverty Line and the World
								Bank’s $3.00/day 2021 PPP threshold. The contrast is stark: most surveyed households are
								above the national poverty line, but only a small minority are above the World Bank
								threshold.
							</p>
							<div class="mt-6"></div>
							<h1 class="text-2xl">What the analysis shows</h1>
							<p class="mt-2">
								The household income distribution is strongly right-skewed. Nearly half of all beneficiary
								households, 46.1%, earn below BDT 20,000 per month. While 171 households fall in the
								BDT 20,000–30,000 band, only 10 households report income above BDT 70,000, showing that
								upward mobility remains limited for most participants.
							</p>
							<div class="mt-5"></div>
							<p>
								The paired samples t-test reinforces this gap. Household income is significantly lower
								than the World Bank benchmark, with an average deficit of 20,960, while it is
								significantly higher than the BBS national threshold by 11,486 on average. This means
								that UPG households may satisfy national poverty benchmarks without yet reaching the more
								demanding international standard.
							</p>
							<div class="mt-5"></div>
							<h1 class="text-2xl">Key implication for graduation criteria</h1>

							<p class="mt-2">
								The findings suggest that the current UPG graduation criteria capture meaningful progress
								in asset accumulation and livelihood diversification, but they do not necessarily confirm
								that households have crossed income-based poverty thresholds. Income diversification does
								not always translate into adequate income levels, and many households that are classified
								as graduated still remain below the World Bank poverty line.
							</p>

							<div class="rounded-box border border-base-200 bg-base-50 p-4 not-prose">
								<h4 class="font-semibold text-sm">Bottom line</h4>
								<p class="mt-2 text-sm text-base-content/70">
									By BRAC’s programme criteria, graduation performance is very strong. By BBS income
									standards, most surveyed households are above poverty. But by the World Bank’s
									$3.00/day line, only 12% are above the threshold. This points to a gap between
									programmatic graduation and internationally benchmarked income security.
								</p>
							</div>
						</div>
						<div class="mt-5"></div>
						<!-- Income distribution -->
						<div class="mt-6">
							<div class="flex items-center justify-between">
								<h2 class="text-base font-semibold">Income distribution of surveyed households</h2>
								<span class="badge badge-outline">680 households</span>
							</div>

							<div class="mt-3 overflow-x-auto">
								<table class="table table-zebra">
									<thead>
										<tr>
											<th>Income Range (BDT)</th>
											<th class="text-right">Households</th>
										</tr>
									</thead>
									<tbody>
										{#each incomeBands as row}
											<tr>
												<td>{row.band}</td>
												<td class="text-right">{fmt(row.hh)}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>

						<!-- Results summary -->
						<div class="mt-6">
							<div class="flex items-center justify-between">
								<h2 class="text-base font-semibold">Final results summary</h2>
								<span class="badge badge-outline">Comparison framework</span>
							</div>

							<div class="mt-3 overflow-x-auto">
								<table class="table table-zebra">
									<thead>
										<tr>
											<th>Source</th>
											<th>Income-related conditions</th>
											<th>Participants</th>
											<th>Result</th>
										</tr>
									</thead>
									<tbody>
										{#each results as row}
											<tr>
												<td class="font-medium">{row.source}</td>
												<td>{row.condition}</td>
												<td>{row.participants}</td>
												<td>{row.result}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>

						<!-- Method note -->
						<div class="mt-6 rounded-box border border-base-200 p-4">
							<h2 class="text-base font-semibold">Method note</h2>
							<ul class="mt-3 space-y-2 text-sm text-base-content/70">
								<li>
									Monthly household income thresholds were calculated using poverty line per
									person/day × household size × 30 for the World Bank benchmark. 
								</li>
								<li>
									For BBS, the poverty line was applied by household size. 
								</li>
								<li>
									Income data from annual, monthly, and daily sources were standardised into a
									monthly household income measure.
								</li>
								<li>
									Each household’s income was then compared against both thresholds to determine
									whether it had crossed the poverty lines. 
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>

			<!-- Right rail -->
			<div class="col-span-12 xl:col-span-5 2xl:col-span-4 space-y-6">
				
				<!-- Recent monitoring activities -->
				<div class="card bg-base-100 shadow-sm">
					<div class="card-body">
						<div class="flex items-center justify-between">
							<h2 class="text-2xl font-semibold">Recent Insights</h2>
							
						</div>

						<ul class="list bg-base-100 rounded-box shadow-md">
						{#each recentActivities as a, index (a.title + a.when)}
							<li class="list-row">
								<div class="text-4xl font-thin opacity-30 tabular-nums">0{index + 1}</div>
								<div class="list-col-grow">
								<a href="/insights">
								<div class="uppercase font-medium">{a.title}</div>
								<div class="text-xs font-semibold opacity-60">{a.subtitle}</div>
								</a>
								</div>
							
							</li>
						{/each}
						</ul>
						
					</div>
				</div>

				<!-- Key definitions -->
				<div class="card bg-base-100 shadow-sm">
					<div class="card-body">
						<div class="flex items-center justify-between">
							<h2 class="text-base font-semibold">Poverty definitions</h2>
							<span class="badge badge-outline">Reference note</span>
						</div>

						<div class="mt-3 space-y-4 text-sm text-base-content/70">
							<div>
								<h3 class="font-medium text-base-content">BBS Lower Poverty Line</h3>
								<p>
									In HIES 2022, the national LPL was Tk 2,318 per person per month, rising to around
									Tk 3,115 by 2025 due to inflation.
								</p>
							</div>

							<div>
								<h3 class="font-medium text-base-content">World Bank threshold</h3>
								<p>
									The report uses the World Bank’s $3.00/day poverty line (2021 PPP concept) for
									Bangladesh as a stricter international benchmark.
								</p>
							</div>

							<div>
								<h3 class="font-medium text-base-content">BRAC graduation criteria</h3>
								<p>
									A household is considered graduated when productive assets reach at least double the
									value of the original transfer and when three or more income sources are established.
								</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Citation / source card -->
				<div class="card bg-base-100 shadow-sm">
					<div class="card-body">
						<h2 class="text-base font-semibold">Source</h2>
						<p class="mt-2 text-sm text-base-content/70">
							Revised short report on the income gap of graduated participants of UPG.
						</p>
					</div>
				</div>
			</div>
		</div>

		<div class="h-6"></div>
	</div>
</div>