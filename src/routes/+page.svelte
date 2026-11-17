<script lang="ts">
//   import { getPosts } from '$lib/server/data.remote';
 import Menubar from '$lib/components/Menubar.svelte';
 import FilterSheet from '$lib/components/FilterSheet.svelte';
 import Barchart from '$lib/components/Barchart.svelte';
 import Piechart from '$lib/components/Piechart.svelte';
 import { goto } from '$app/navigation';
  import Barchart2 from '$lib/components/Barchart2.svelte';
  
	const { data } = $props();

	
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
		icon: "folder" | "branch" | "home" | "pending" | "youth" | "hard-to-reach" | "financial" | "education" | "health" | "empowerment" | "disaster" | "poverty";
	};

	type Stat1 = {
		label: string;
		value: string | number;
		deltaHelp: string;
		deltaTone: "success" | "error" | "warning" | "neutral";
		icon: "financial" | "education" | "health" | "empowerment" | "disaster" | "poverty";
	};

	type RecentProject = { id: string; name: string; status: "Draft" | "Active" | "Completed" | "Rejected" };
	type Activity = {
		type: "created" | "approved" | "user" | "branch";
		title: string;
		subtitle: string;
		when: string;
		tone: "info" | "success" | "warning" | "error";
	};

	const stats = $state<Stat[]>([
		{ label: "Projects are ongoing", value: 20, delta: "+12%", deltaHelp: "from last year", deltaTone: "success", icon: "folder" },
		{ label: "Activities are being implemented", value: 20, delta: "+5%", deltaHelp: "from last year", deltaTone: "success", icon: "branch" },
		{ label: "People reached by BRAC", value: 52300, delta: "+18%", deltaHelp: "from last year", deltaTone: "success", icon: "home" },
		{ label: "Youth supported by BRAC", value: 1200, delta: "+12%", deltaHelp: "from last year", deltaTone: "success", icon: "youth" },
		{ label: " Person with Disabilities (PWD) received support", value: 40, delta: "-3", deltaHelp: "from last year", deltaTone: "error", icon: "pending" },
		{ label: "Total Reach in Hard to Reach Area", value: 5000, delta: "-3", deltaHelp: "from last year", deltaTone: "error", icon: "hard-to-reach" }
	]);

	const ProgrammeStats = $state<Stat1[]>([
		{ label: "Financial Inclusion", value: "15.87m", deltaHelp: "people accessed financial services and awareness.", deltaTone: "success", icon: "financial" },
		{ label: "Health", value: "3.51m", deltaHelp: "people accessed health, nutrition services and awareness messages.", deltaTone: "success", icon: "health" },
		{ label: "Education", value: "0.10m", deltaHelp: "children accessed education services from BRAC schools", deltaTone: "success", icon: "education" },
		{ label: "Poverty Alleviation", value: "0.13m", deltaHelp: "households living in ultra-poverty,  received asset and climate-adaptive support.", deltaTone: "success", icon: "poverty" },
		{ label: "Disaster and Crisis Management", value: "4.88m", deltaHelp: "people received disaster risk reduction services and awareness", deltaTone: "error", icon: "disaster"},
		{ label: "Empowerment & Protection", value: "1.10m", deltaHelp: "women and girls received awareness on VAWG and child marriage prevention support", deltaTone: "error", icon: "empowerment" }
	]);

	const recentProjects = $state<RecentProject[]>([]);

	const recentActivities = $state<Activity[]>([
		{ 
			type: "created", 
			title: "Do you know 20% of UPG members are out of poverty line?" , 
			subtitle: "BRAC’s UPG Programme supports extremely poor households through assets, training, and two years of support, targeting families with very low and unstable incomes.", 
			when: "6 hours ago", 
			tone: "info" 
		},
		{ type: "approved", title: "Do you know 90% of graduated Students can't continue their SSC?", subtitle: "Education continuity remains a critical concern, with approximately 90% of graduated students unable to progress to the Secondary School Certificate (SSC) level.", when: "1 day ago", tone: "success" },
		{ type: "user", title: "Do you know 50% of the participants from SDP can't continue their job in 2 years after completing the training?", subtitle: "Despite completing training, half of SDP participants are unable to retain their jobs beyond two years, highlighting challenges in long-term employment sustainability.", when: "2 days ago", tone: "warning" },
		{ type: "branch", title: "Do you know 20% of UPG members are out of poverty line?", subtitle: "One in five UPG members has risen above the poverty line, reflecting positive progress in poverty reduction.", when: "3 days ago", tone: "error" }
	]);

	const recentImpacts = $state<Activity[]>([
		{ 
			type: "created", title: "50% of BRAC participant households and enterprises have increased income" , 
			subtitle: "Compared to the baseline study, the monthly per capita income of BRAC participant households increased to BDT 1,613, reflecting a rise of around 50%. However, this is still below the average per capita income of BDT 3,832 for the upper poverty line (BBS, 2025). Among all contributing programmes, UPG participants recorded the highest growth in monthly per capita income, rising from BDT 1,048 to BDT 4,832. This was followed by IDP (from BDT 2,746 to BDT 3,795), MF (from BDT 4,513 to BDT 5,918), SDP (from BDT 3,197 to BDT 4,136), UDP (from BDT 2,911 to BDT 3,882), and Migration (from BDT 3,213 to BDT 3,574).", 
			when: "6 hours ago", 
			tone: "info" 
		},
		{ type: "approved", 
		title: "38.60% of participants have economic empowerment through gainful employment", 
		subtitle: "Among the surveyed SDP participants, 42.8% (237) are currently employed, while 38.6% reported an increase in income following the training. Before the intervention, only 15.9% (88) of participants were engaged in income-generating activities (IGAs). In terms of income gains, 62% of participants reported an increase of more than BDT 3,000, and approximately 39% experienced an increase exceeding BDT 5,000.", 
		when: "1 day ago", tone: "success" },
		{ type: "user", 
		title: "95% of BRAC participants who successfully secured safe migration", 
		subtitle: "Safe migration is defined as successful migration through regular channels (e.g., working visa, DEMO registration, smart card, or TTC training) while complying with all legal requirements. Overall, 95% of aspirant migrants achieved safe migration with support from the Migration Programme.", when: "2 days ago", tone: "warning" },
		{ type: "branch", 
		title: "21% of BRAC participants who successfully secured dower, maintenance, inheritance, and other legal entitlements through legal aid services", 
		subtitle: "Survivors successfully claimed their legal entitlements, including dower, maintenance, and inheritance rights, through legal aid services provided by SELP, such as alternative dispute resolution (ADR) and court litigation.", 
		when: "3 days ago", tone: "error" }
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
			
			case "financial":
				return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wallet-cards-icon lucide-wallet-cards"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2"/><path d="M3 11h3c.8 0 1.6.3 2.1.9l1.1.9c1.6 1.6 4.1 1.6 5.7 0l1.1-.9c.5-.5 1.3-.9 2.1-.9H21"/></svg>`;
			case "health":
				return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart-pulse-icon lucide-heart-pulse"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/><path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>`;
			case "education":
				return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open-text-icon lucide-book-open-text"><path d="M12 7v14"/><path d="M16 12h2"/><path d="M16 8h2"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/><path d="M6 12h2"/><path d="M6 8h2"/></svg>`;
			case "disaster":
				return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-rain-wind-icon lucide-cloud-rain-wind"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m9.2 22 3-7"/><path d="m9 13-3 7"/><path d="m17 13-3 7"/></svg>`;
			case "empowerment":
				return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-speech-icon lucide-speech"><path d="M8.8 20v-4.1l1.9.2a2.3 2.3 0 0 0 2.164-2.1V8.3A5.37 5.37 0 0 0 2 8.25c0 2.8.656 3.054 1 4.55a5.77 5.77 0 0 1 .029 2.758L2 20"/><path d="M19.8 17.8a7.5 7.5 0 0 0 .003-10.603"/><path d="M17 15a3.5 3.5 0 0 0-.025-4.975"/></svg>`;
			case "poverty":
				return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hand-coins-icon lucide-hand-coins"><path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"/><path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 16 6 6"/><circle cx="16" cy="9" r="2.9"/><circle cx="6" cy="5" r="3"/></svg>`;	
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

<div class="min-h-screen bg-zinc-100">
	<Menubar />
	<!-- Wider + better gutters on big screens -->
	<div class="mx-auto max-w-500 px-3 py-3 sm:px-3 lg:px-4 2xl:px-4 2xl:py-4">

		<!-- Header -->
		<div class="flex items-center justify-between">
			<div class="mb-1">
				<h1 class="text-xl font-semibold">Overview Dashboard</h1>
				<p class="text-sm text-base-content/60">Overall system performance and key metrics</p>
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
		

		<!-- 12-col grid wrapper (helps large-screen composition) -->
		<div class="grid grid-cols-12 gap-4 2xl:gap-5">
		
			<div class="col-span-12 xl:col-span-7 2xl:col-span-8">
				<div class="card bg-base-100 shadow-sm h-full">
					<div class="card-body">
						<div class="flex bg-[#fbd4eb] items-center justify-between py-2 px-2">
							<h2 class="text-base font-semibold">Evidence</h2>
					
						</div>

					<div class="mt-2 grid grid-cols-12 gap-3">
					<!-- KPI Cards: 1 per row on mobile, 2 per row on md, 4 per row on xl+ (each = 3 cols) -->
						{#each stats as s (s.label)}
							<div class="col-span-12 md:col-span-6 xl:col-span-6 2xl:col-span-4">
								<div class="card bg-base-100 border border-slate-100 shadow-sm transition hover:shadow-md">
									<div class="card-body">
										<div class="flex items-start justify-between gap-3">
											<div class="min-w-0">
												<p class="text-3xl text-[#EC008C] font-semibold">{s.value}</p>
												<p class="mt-1 text-sm text-base-content/60">{s.label}</p>
												<p class={"mt-2 text-sm " + toneClasses(s.deltaTone)}>
													<span class="font-medium">{s.delta}</span>
													<span class="text-base-content/60"> {s.deltaHelp}</span>
												</p>
											</div>

											<div class="rounded-2xl bg-[#fbd4eb] p-3 text-base-content/70">
													{@html iconSvg(s.icon)}
											</div>
										</div>
									</div>
								</div>
							</div>
							{/each}
					</div>
					<!-- For programme stats -->
					 <div class="flex items-center bg-[#fbd4eb] justify-between py-2 px-2 mt-3">
							<h2 class="text-base font-semibold">Programatic Achievements</h2>
					
						</div>
					<div class="mt-2 grid grid-cols-12 gap-3">
					<!-- KPI Cards: 1 per row on mobile, 2 per row on md, 4 per row on xl+ (each = 3 cols) -->
						{#each ProgrammeStats as s (s.label)}
							<div class="col-span-12 md:col-span-6 xl:col-span-6 2xl:col-span-4">
								<div class="card bg-base-100 border border-slate-100 shadow-sm transition hover:shadow-md">
									<div class="card-body">
										<div class="flex items-start justify-between gap-3">
											<div class="min-w-0">
											    <p class="mt-1 text-lg font-semibold text-base-content/80">{s.label}</p>
												<p class="text-3xl mt-3 text-[#EC008C] font-semibold">{s.value}</p>
												<p class={"mt-2 text-sm " + toneClasses(s.deltaTone)}>
													<span class="text-base-content/60"> {s.deltaHelp}</span>
												</p>
											</div>

											<div class="rounded-2xl bg-[#fbd4eb] p-3 text-base-content/70">
													{@html iconSvg(s.icon)}
											</div>
										</div>
									</div>
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
						<h2 class="text-base font-semibold">BRAC Impact</h2>
						<a class="link link-primary text-sm no-underline hover:underline" href="/indicators">View All</a>
					</div>
							{#each recentImpacts as i (i.title + i.when)}
									
								<div class="min-w-0 flex-1">
									<div class="collapse collapse-arrow bg-base-100 border-base-300 border">
    									<input type="radio" name="my-accordion-4" />
										<p class="collapse-title bg-base-200 font-semibold">{i.title}</p>
										<p class="collapse-content text-sm text-base-content/60">{i.subtitle}</p>
									</div>
								</div>
						
							{/each}
				
				</div>
				
			</div>
			<div class="card bg-base-100 shadow-sm mt-4">
				<div class="card-body">
					<div class="flex items-center justify-between">
						<h2 class="text-base font-semibold">BRAC Insights</h2>
						<a class="link link-primary text-sm no-underline hover:underline" href="/insights">View All</a>
					</div>
						<ul class="list bg-base-100 rounded-box">
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
		</div>

		
		<!-- Recent Projects: wider on large screens -->
		<div class="col-span-12 xl:col-span-7 2xl:col-span-8">
				
			<div class="col-span-12 xl:col-span-6">
			<Barchart />
			 <!-- <Barchart2 /> -->
			</div>
		
		</div>

		<!-- Recent Activities: narrower on large screens -->
		<div class="col-span-12 xl:col-span-5 2xl:col-span-4">
				<div class="col-span-12 xl:col-span-6">
					<Piechart />
				</div>
			<div class="mt-2 grid grid-cols-4 gap-2 text-center text-sm">
						<div class="rounded-box bg-base-100 border border-base-300 p-2">
								<div class="text-xs opacity-70">PWD Male</div>
								<div class="font-semibold">8</div>
						</div>
						<div class="rounded-box bg-base-100 border border-base-300 p-2">
								<div class="text-xs opacity-70">PWD Female</div>
								<div class="font-semibold">49</div>
						</div>
						<div class="rounded-box bg-base-100 border border-base-300 p-2">
								<div class="text-xs opacity-70">PWD Other</div>
								<div class="font-semibold">6</div>
						</div>
						<div class="rounded-box bg-base-100 border border-base-300 p-2">
								<div class="text-xs opacity-70">PWD Total</div>
								<div class="font-semibold">63</div>
						</div>
					</div>	
		</div>
			<!-- Recent Projects: wider on large screens -->
		<div class="col-span-12 xl:col-span-7 2xl:col-span-8">
			<div class="card bg-base-100 shadow-sm h-full">
				<div class="card-body">
					<div class="flex items-center justify-between bg-[#fbd4eb] py-2 px-2">
							<h2 class="text-base font-semibold">Top 10 Districts</h2>
							<span class="badge badge-ghost px-3 py-4">All divisions</span>
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
