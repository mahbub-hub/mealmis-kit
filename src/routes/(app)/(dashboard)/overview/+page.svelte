<script lang="ts">
	import Barchart from '$lib/components/Barchart.svelte'
    import Piechart from '$lib/components/Piechart.svelte';

	const { data } = $props();

  	type Cluster = "All Clusters" | "MF" | "Proverty" | "Health" | "Gender";
	type Programme = "All Programmes" | "WASH" | "Education" | "Health";
	type Division = "All Divisions" | "Dhaka" | "Rajshahi" | "Chattogram" | "Khulna";
	type District = "All Districts" | "Dhaka" | "Rajshahi" | "Chattogram" | "Khulna";
	type Year = 2024 | 2023 | 2022;

	const chartData = [
		{ month: "BEP", desktop: 98 },
		{ month: "BHP", desktop: 97 },
		{ month: "CCP", desktop: 98 },
		{ month: "UDP", desktop: 95 },
		{ month: "MF", desktop: 99},
		{ month: "UPG", desktop: 94 }
	];

	function clampPct(n: number) {
		return Math.max(0, Math.min(100, n));
	}

	function fmt(n: unknown) {
		// Handles undefined/null/NaN/string safely during SSR + hydration
		const num =
			typeof n === "number"
				? n
				: typeof n === "string"
					? Number(n)
					: 0;
		return Number.isFinite(num) ? num.toLocaleString() : "0";
	}

	type GeoRow = {
		name: string;
		value: number;
		pct: number; // 0-100
	};
	// Geographic distribution (example)
	const geo = $state<GeoRow[]>([
		{ name: "Dhaka", value: 650, pct: 40 },
		{ name: "Chattogram", value: 420, pct: 26 },
		{ name: "Rajshahi", value: 310, pct: 19 },
		{ name: "Khulna", value: 240, pct: 15 },
		{ name: "Barishal", value: 180, pct: 11 },
		{ name: "Sylhet", value: 160, pct: 10 },
		{ name: "Rangpur", value: 120, pct: 7 }
	]);

	type Stat = {
		label: string;
		value: number;
		delta: string;
		deltaHelp: string;
		deltaTone: "success" | "error" | "warning" | "neutral";
		icon: "folder" | "branch" | "home" | "pending" | "youth" | "hard-to-reach";
	};

	type RecentProject = { id: string; name: string; status: "Draft" | "Active" | "Completed" | "Rejected" };
	type Activity = {
		type: "created" | "approved" | "user" | "branch";
		title: string;
		subtitle: string;
		when: string;
		tone: "info" | "success" | "warning" | "error";
	};

	const programmes: Programme[] = ["All Programmes", "WASH", "Education", "Health"];
	const clusters: Cluster[] = ["All Clusters", "MF", "Proverty", "Health", "Gender"];
	const divisions: Division[] = ["All Divisions", "Dhaka", "Rajshahi", "Chattogram", "Khulna"];
	const districts: District[] = ["All Districts", "Dhaka", "Rajshahi", "Chattogram", "Khulna"];
	const years: Year[] = [2024, 2023, 2022];

	const filters = $state({
		programme: "All Programmes" as Programme,
		cluster: "All Clusters" as Cluster,
		division: "All Divisions" as Division,
		district: "All Districts" as District,
		year: 2024 as Year
	});

	const stats = $state<Stat[]>([
		{ label: "Total Projects", value: 20, delta: "+12%", deltaHelp: "from last year", deltaTone: "success", icon: "folder" },
		{ label: "Total Activities", value: 20, delta: "+5%", deltaHelp: "from last year", deltaTone: "success", icon: "branch" },
		{ label: "Total Reach", value: 52300, delta: "+18%", deltaHelp: "from last year", deltaTone: "success", icon: "home" },
		{ label: "Total Youth", value: 1200, delta: "+12%", deltaHelp: "from last year", deltaTone: "success", icon: "youth" },
		{ label: "Total PWD", value: 40, delta: "-3", deltaHelp: "from last year", deltaTone: "error", icon: "pending" },
		{ label: "Total Reach in Hard to Reach Area", value: 5000, delta: "-3", deltaHelp: "from last year", deltaTone: "error", icon: "hard-to-reach" }
	]);

	const recentProjects = $state<RecentProject[]>([]);

	const recentActivities = $state<Activity[]>([
		{ type: "created", title: "DQA Participats Interview" , subtitle: "Data quality assessment of Clean Water Initiative", when: "6 hours ago", tone: "info" },
		{ type: "approved", title: "DFAT Endline Survey 2025", subtitle: "PRJ-2023-002 · Education Access Program", when: "1 day ago", tone: "success" },
		{ type: "user", title: "PQA BEP Observations", subtitle: "Field leval observation", when: "2 days ago", tone: "warning" },
		{ type: "branch", title: "Resloved findings", subtitle: "Rangpur Division · Nilphamari District", when: "3 days ago", tone: "error" }
	]);

	const beneficiary = $state({
		total: 15420,
		male: 7850,
		female: 7270,
		pwd: 300
	});

	const beneficiaryMeta = $derived(() => {
		const total = beneficiary.total || 1;
		return {
			malePct: Math.round((beneficiary.male / total) * 100),
			femalePct: Math.round((beneficiary.female / total) * 100),
			pwdPct: Math.round((beneficiary.pwd / total) * 100)
		};
	});

	function iconSvg(kind: Stat["icon"]) {
		switch (kind) {
			case "folder":
				return `<svg viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="1.8">
					<path d="M3 7a2 2 0 0 1 2-2h5l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>
				</svg>`;
			case "branch":
				return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-list-icon lucide-layout-list"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><path d="M14 4h7"/><path d="M14 9h7"/><path d="M14 15h7"/><path d="M14 20h7"/></svg>`;
			case "home":
				return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trophy-icon lucide-trophy"><path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/><path d="M18 9h1.5a1 1 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6"/></svg>`;
			case "pending":
				return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-accessibility-icon lucide-accessibility"><circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-6 1"/><path d="m5 8 3-3 5.5 3-2.36 3.5"/><path d="M4.24 14.5a5 5 0 0 0 6.88 6"/><path d="M13.76 17.5a5 5 0 0 0-6.88-6"/></svg>`;
			case "youth":				
			return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-star-icon lucide-user-star"><path d="M16.051 12.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.866l-1.156-1.153a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z"/><path d="M8 15H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/></svg>`;
			
			case "hard-to-reach":				
			return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users-icon lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg>`;
		}		
	}

	function toneClasses(tone: Stat["deltaTone"]) {
		if (tone === "success") return "text-success";
		if (tone === "error") return "text-error";
		if (tone === "warning") return "text-warning";
		return "text-base-content/70";
	}

	function activityDot(tone: Activity["tone"]) {
		if (tone === "success") return "bg-success";
		if (tone === "warning") return "bg-warning";
		if (tone === "error") return "bg-error";
		return "bg-info";
	}
</script>

<svelte:head>
	<title>Overview Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<!-- Wider + better gutters on big screens -->
	<div class="mx-auto max-w-[1600px] px-3 py-5 sm:px-6 lg:px-8 2xl:px-10 2xl:py-8">
		<!-- Header -->
		<div class="mb-5">
			<h1 class="text-xl font-semibold">Overview Dashboard</h1>
			<p class="text-sm text-base-content/60">Overall system performance and key metrics</p>
		</div>

		<!-- 12-col grid wrapper (helps large-screen composition) -->
		<div class="grid grid-cols-12 gap-4 2xl:gap-6">
			<!-- Filters: full width -->
			<div class="col-span-12">
				<div class="card bg-base-100 shadow-sm">
					<div class="card-body gap-4">
						<div class="flex items-center gap-2 text-sm font-medium">
							<span class="inline-flex size-8 items-center justify-center rounded-full bg-base-200">
								<svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="1.8">
									<path d="M4 5h16M7 12h10M10 19h4" />
								</svg>
							</span>
							<span>Filters</span>
						</div>

						<div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
							<label class="form-control">
								<div class="label"><span class="label-text">Cluster</span></div>
								<select class="select select-bordered w-full" bind:value={filters.cluster}>
									{#each clusters as c}
										<option value={c}>{c}</option>
									{/each}
								</select>
							</label>
							<label class="form-control">
								<div class="label"><span class="label-text">Programme</span></div>
								<select class="select select-bordered w-full" bind:value={filters.programme}>
									{#each programmes as p}
										<option value={p}>{p}</option>
									{/each}
								</select>
							</label>

							<label class="form-control">
								<div class="label"><span class="label-text">Divisions</span></div>
								<select class="select select-bordered w-full" bind:value={filters.division}>
									{#each divisions as d}
										<option value={d}>{d}</option>
									{/each}
								</select>
							</label>
							<label class="form-control">
								<div class="label"><span class="label-text">Districts</span></div>
								<select class="select select-bordered w-full" bind:value={filters.district}>
									{#each districts as dis}
										<option value={dis}>{dis}</option>
									{/each}
								</select>
							</label>

							<label class="form-control">
								<div class="label"><span class="label-text">Year</span></div>
								<select class="select select-bordered w-full" bind:value={filters.year}>
									{#each years as y}
										<option value={y}>{y}</option>
									{/each}
								</select>
							</label>
						</div>
					</div>
				</div>
			</div>
		
		<div class="clo-span-12 xl:col-span-7 2xl:col-span-8">
			<div class="mb-5">
			<h1 class="text-xl font-semibold">Overview Dashboard</h1>
			<p class="text-sm text-base-content/60">Overall system performance and key metrics</p>
			</div>
		</div>	
		<div class="clo-span-12 xl:col-span-7 2xl:col-span-8">
			<div class="mb-5">
			<h1 class="text-xl font-semibold">Overview Dashboard</h1>
			<p class="text-sm text-base-content/60">Overall system performance and key metrics</p>
			</div>
		</div>	

		<div class="col-span-12 xl:col-span-7 2xl:col-span-8">
			<div class="card bg-base-100 shadow-sm h-full">
				<div class="card-body">
					<div class="flex items-center justify-between">
							<h2 class="text-base font-semibold">Top 10 Districts</h2>
							<span class="badge badge-ghost">All divisions</span>
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

			<!-- Recent Activities: narrower on large screens -->
			<div class="col-span-12 xl:col-span-5 2xl:col-span-4">
				<div class="card bg-base-100 shadow-sm">
					<div class="card-body">
						<div class="flex items-center justify-between">
							<h2 class="text-base font-semibold">Recent Monitoring Activities</h2>
							<a class="link link-primary text-sm no-underline hover:underline" href="/activities">View All</a>
						</div>

						<ul class="mt-2 space-y-4">
							{#each recentActivities as a (a.title + a.when)}
								<li class="flex gap-3">
									<div class="mt-1 flex flex-col items-center">
										<!-- svelte-ignore element_invalid_self_closing_tag -->
										<span class={"size-2.5 rounded-full " + activityDot(a.tone)} />
										<span class="mt-2 h-full w-px bg-base-200" aria-hidden="true"></span>
									</div>

									<div class="min-w-0 flex-1">
										<p class="truncate text-sm font-medium">{a.title}</p>
										<p class="truncate text-sm text-base-content/60">{a.subtitle}</p>
										<p class="mt-1 text-xs text-base-content/50">{a.when}</p>
									</div>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>

		
			<!-- KPI Cards: 1 per row on mobile, 2 per row on md, 4 per row on xl+ (each = 3 cols) -->
			{#each stats as s (s.label)}
				<div class="col-span-12 md:col-span-8 xl:col-span-4 2xl:col-span-4">
					<div class="card bg-base-100 shadow-sm transition hover:shadow-md">
						<div class="card-body">
							<div class="flex items-start justify-between gap-3">
								<div class="min-w-0">
									<p class="text-sm text-base-content/60">{s.label}</p>
									<p class="mt-1 text-3xl font-semibold">{s.value}</p>
									<p class={"mt-2 text-sm " + toneClasses(s.deltaTone)}>
										<span class="font-medium">{s.delta}</span>
										<span class="text-base-content/60"> {s.deltaHelp}</span>
									</p>
								</div>

								<div class="rounded-2xl bg-base-200 p-3 text-base-content/70">
									{@html iconSvg(s.icon)}
								</div>
							</div>
						</div>
					</div>
				</div>
			{/each}

			<!-- Recent Projects: wider on large screens -->
		<div class="col-span-12 xl:col-span-7 2xl:col-span-8">
				
		<div class="col-span-12 xl:col-span-6">
		<Barchart />
		</div>
		
		</div>

		<!-- Recent Activities: narrower on large screens -->
		<div class="col-span-12 xl:col-span-5 2xl:col-span-4">
				<div class="col-span-12 xl:col-span-6">
					<Piechart />
				</div>
			<div class="mt-2 grid grid-cols-4 gap-2 text-center text-sm">
						<div class="rounded-box border border-base-300 p-2">
								<div class="text-xs opacity-70">PWD Male</div>
								<div class="font-semibold">8</div>
						</div>
						<div class="rounded-box border border-base-300 p-2">
								<div class="text-xs opacity-70">PWD Female</div>
								<div class="font-semibold">49</div>
						</div>
						<div class="rounded-box border border-base-300 p-2">
								<div class="text-xs opacity-70">PWD Other</div>
								<div class="font-semibold">6</div>
						</div>
						<div class="rounded-box border border-base-300 p-2">
								<div class="text-xs opacity-70">PWD Total</div>
								<div class="font-semibold">63</div>
						</div>
					</div>	
			</div>
			<!-- Recent Projects: wider on large screens -->
		<div class="col-span-12 xl:col-span-7 2xl:col-span-8">
			<div class="card bg-base-100 shadow-sm h-full">
				<div class="card-body">
					<div class="flex items-center justify-between">
							<h2 class="text-base font-semibold">Top 10 Districts</h2>
							<span class="badge badge-ghost">All divisions</span>
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

			<!-- Recent Activities: narrower on large screens -->
			<div class="col-span-12 xl:col-span-5 2xl:col-span-4">
				<div class="card bg-base-100 shadow-sm">
					<div class="card-body">
						<div class="flex items-center justify-between">
							<h2 class="text-base font-semibold">Recent Monitoring Activities</h2>
							<a class="link link-primary text-sm no-underline hover:underline" href="/activities">View All</a>
						</div>

						<ul class="mt-2 space-y-4">
							{#each recentActivities as a (a.title + a.when)}
								<li class="flex gap-3">
									<div class="mt-1 flex flex-col items-center">
										<!-- svelte-ignore element_invalid_self_closing_tag -->
										<span class={"size-2.5 rounded-full " + activityDot(a.tone)} />
										<span class="mt-2 h-full w-px bg-base-200" aria-hidden="true"></span>
									</div>

									<div class="min-w-0 flex-1">
										<p class="truncate text-sm font-medium">{a.title}</p>
										<p class="truncate text-sm text-base-content/60">{a.subtitle}</p>
										<p class="mt-1 text-xs text-base-content/50">{a.when}</p>
									</div>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>

			<!-- Beneficiary: full width, with nested cards; 4 columns on lg+ -->
			
		</div>

		<div class="h-6"></div>
	</div>
</div>
