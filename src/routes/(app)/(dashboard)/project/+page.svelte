<script lang="ts">
	// -----------------------------
	// Types
	// -----------------------------
	type Programme = "All Programmes" | "WASH" | "Education" | "Health" | "Livelihood";
	type ProjectStatus = "Draft" | "Active" | "Completed" | "Rejected";

	type KPI = {
		label: string;
		value: number;
		delta: string; // "+12%" or "-3"
		deltaHelp: string; // "from last month"
		tone: "success" | "error" | "warning" | "neutral";
		icon: "folder" | "branch" | "home" | "pending";
	};

	type ProjectRow = {
		id: string;
		name: string;
		programme: string;
		location: string;
		owner: string;
		status: ProjectStatus;
		updated: string;
		progressPct: number; // 0-100
	};

	type ActivityRow = {
		tone: "info" | "success" | "warning" | "error";
		title: string;
		subtitle: string;
		when: string;
	};

	// -----------------------------
	// Runes state
	// -----------------------------
	const programmes: Programme[] = ["All Programmes", "WASH", "Education", "Health", "Livelihood"];
	const years = [2024, 2023, 2022] as const;

	const filters = $state({
		programme: "All Programmes" as Programme,
		status: "All" as "All" | ProjectStatus,
		year: 2024 as (typeof years)[number],
		query: ""
	});

	const kpis = $state<KPI[]>([
		{ label: "Total Projects", value: 128, delta: "+12%", deltaHelp: "from last month", tone: "success", icon: "folder" },
		{ label: "Active Branches", value: 42, delta: "+5%", deltaHelp: "from last month", tone: "success", icon: "branch" },
		{ label: "Households", value: 15420, delta: "+18%", deltaHelp: "from last month", tone: "success", icon: "home" },
		{ label: "Pending Approvals", value: 7, delta: "-3", deltaHelp: "from yesterday", tone: "error", icon: "pending" }
	]);

	const projects = $state<ProjectRow[]>([
		{
			id: "PRJ-2024-014",
			name: "Clean Water Initiative",
			programme: "WASH",
			location: "Rangpur · Nilphamari",
			owner: "Field Office A",
			status: "Active",
			updated: "2 hours ago",
			progressPct: 72
		},
		{
			id: "PRJ-2024-008",
			name: "Education Access Program",
			programme: "Education",
			location: "Dhaka · Savar",
			owner: "Education Team",
			status: "Active",
			updated: "1 day ago",
			progressPct: 58
		},
		{
			id: "PRJ-2024-003",
			name: "Maternal Health Support",
			programme: "Health",
			location: "Khulna · Bagerhat",
			owner: "Health Unit",
			status: "Draft",
			updated: "3 days ago",
			progressPct: 24
		},
		{
			id: "PRJ-2023-021",
			name: "Livelihood Skills Training",
			programme: "Livelihood",
			location: "Rajshahi · Bogura",
			owner: "Training Cell",
			status: "Completed",
			updated: "1 week ago",
			progressPct: 100
		}
	]);

	const activities = $state<ActivityRow[]>([
		{ tone: "info", title: "New project created", subtitle: "PRJ-2024-015 · Safe Sanitation Upgrade", when: "1 hour ago" },
		{ tone: "success", title: "Project approved", subtitle: "PRJ-2024-008 · Education Access Program", when: "1 day ago" },
		{ tone: "warning", title: "New user registered", subtitle: "Sarah Ahmed · Field Officer", when: "2 days ago" },
		{ tone: "error", title: "Approval pending", subtitle: "PRJ-2024-003 · Maternal Health Support", when: "3 days ago" }
	]);

	const beneficiary = $state({
		total: 15420,
		male: 7850,
		female: 7270,
		pwd: 300
	});

	const beneficiaryMeta = $derived.by(() => {
		const total = beneficiary.total || 1;
		return {
			malePct: Math.round((beneficiary.male / total) * 100),
			femalePct: Math.round((beneficiary.female / total) * 100),
			pwdPct: Math.round((beneficiary.pwd / total) * 100)
		};
	});

	// -----------------------------
	// Derived (filter + search)
	// -----------------------------
	const filteredProjects = $derived.by(() => {
		const q = filters.query.trim().toLowerCase();
		return projects
			.filter((p) => (filters.programme === "All Programmes" ? true : p.programme === filters.programme))
			.filter((p) => (filters.status === "All" ? true : p.status === filters.status))
			.filter((p) => {
				if (!q) return true;
				return (
					p.id.toLowerCase().includes(q) ||
					p.name.toLowerCase().includes(q) ||
					p.location.toLowerCase().includes(q) ||
					p.programme.toLowerCase().includes(q)
				);
			});
	});

	// -----------------------------
	// UI helpers
	// -----------------------------
	function toneText(t: KPI["tone"]) {
		if (t === "success") return "text-success";
		if (t === "error") return "text-error";
		if (t === "warning") return "text-warning";
		return "text-base-content/70";
	}

	function badgeClass(status: ProjectStatus) {
		if (status === "Active") return "badge-success";
		if (status === "Completed") return "badge-neutral";
		if (status === "Draft") return "badge-warning";
		return "badge-error";
	}

	function activityDot(t: ActivityRow["tone"]) {
		if (t === "success") return "bg-success";
		if (t === "warning") return "bg-warning";
		if (t === "error") return "bg-error";
		return "bg-info";
	}

	function iconSvg(kind: KPI["icon"]) {
		switch (kind) {
			case "folder":
				return `<svg viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="1.8">
					<path d="M3 7a2 2 0 0 1 2-2h5l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>
				</svg>`;
			case "branch":
				return `<svg viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="1.8">
					<path d="M6 3v8a3 3 0 1 0 2 2V9c0-1 1-2 2-2h4c1 0 2 1 2 2v4a3 3 0 1 0 2-2V3"/>
				</svg>`;
			case "home":
				return `<svg viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="1.8">
					<path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5z"/>
				</svg>`;
			case "pending":
				return `<svg viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="1.8">
					<path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z"/>
					<path d="M12 7v6l4 2"/>
				</svg>`;
		}
	}
</script>

<svelte:head>
	<title>Project Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<!-- Wide layout for big monitors -->
	<div class="mx-auto max-w-[1800px] px-3 py-5 sm:px-6 lg:px-8 2xl:px-10 2xl:py-8">
		<!-- Header -->
		<div class="mb-5">
			<h1 class="text-xl font-semibold">Project Dashboard</h1>
			<p class="text-sm text-base-content/60">Overview of project status, performance, and recent activity</p>
		</div>

		<!-- 12-column responsive grid -->
		<div class="grid grid-cols-12 gap-4 2xl:gap-6">
			<!-- Filters -->
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

						<div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">
							<!-- programme -->
							<label class="form-control xl:col-span-3">
								<div class="label"><span class="label-text">Programme</span></div>
								<select class="select select-bordered w-full" bind:value={filters.programme}>
									{#each programmes as p}
										<option value={p}>{p}</option>
									{/each}
								</select>
							</label>

							<!-- status -->
							<label class="form-control xl:col-span-3">
								<div class="label"><span class="label-text">Status</span></div>
								<select class="select select-bordered w-full" bind:value={filters.status}>
									<option value="All">All</option>
									<option value="Draft">Draft</option>
									<option value="Active">Active</option>
									<option value="Completed">Completed</option>
									<option value="Rejected">Rejected</option>
								</select>
							</label>

							<!-- year -->
							<label class="form-control xl:col-span-2">
								<div class="label"><span class="label-text">Year</span></div>
								<select class="select select-bordered w-full" bind:value={filters.year}>
									{#each years as y}
										<option value={y}>{y}</option>
									{/each}
								</select>
							</label>

							<!-- search -->
							<label class="form-control xl:col-span-4">
								<div class="label"><span class="label-text">Search</span></div>
								<input
									class="input input-bordered w-full"
									placeholder="Search by ID, name, location..."
									bind:value={filters.query}
								/>
							</label>
						</div>
					</div>
				</div>
			</div>

			<!-- KPI cards -->
			{#each kpis as s (s.label)}
				<div class="col-span-12 md:col-span-6 xl:col-span-3">
					<div class="card bg-base-100 shadow-sm transition hover:shadow-md">
						<div class="card-body">
							<div class="flex items-start justify-between gap-3">
								<div class="min-w-0">
									<p class="text-sm text-base-content/60">{s.label}</p>
									<p class="mt-1 text-3xl font-semibold">{s.value.toLocaleString()}</p>
									<p class={"mt-2 text-sm " + toneText(s.tone)}>
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

			<!-- Main row: Projects (wider) + Activities (narrower) -->
			<div class="col-span-12 xl:col-span-8 2xl:col-span-9">
				<div class="card bg-base-100 shadow-sm h-full">
					<div class="card-body">
						<div class="flex flex-wrap items-center justify-between gap-3">
							<h2 class="text-base font-semibold">Recent Projects</h2>
							<div class="flex items-center gap-2">
								<span class="badge badge-ghost">{filteredProjects.length} showing</span>
								<a class="link link-primary text-sm no-underline hover:underline" href="/projects">View All</a>
							</div>
						</div>

						<div class="mt-3 overflow-x-auto">
							<table class="table table-zebra">
								<thead>
									<tr>
										<th class="min-w-[130px]">Project ID</th>
										<th class="min-w-[320px]">Name</th>
										<th class="min-w-[140px]">Programme</th>
										<th class="min-w-[220px]">Location</th>
										<th class="min-w-[180px]">Owner</th>
										<th class="min-w-[140px]">Status</th>
										<th class="min-w-[280px]">Progress</th>
									</tr>
								</thead>

								<tbody>
									{#if filteredProjects.length === 0}
										<tr>
											<td colspan="7" class="py-12 text-center text-sm text-base-content/60">
												No projects found for current filters.
											</td>
										</tr>
									{:else}
										{#each filteredProjects as p (p.id)}
											<tr>
												<td class="font-mono text-sm">{p.id}</td>
												<td class="font-medium">{p.name}</td>
												<td class="text-sm text-base-content/70">{p.programme}</td>
												<td class="text-sm text-base-content/70">{p.location}</td>
												<td class="text-sm text-base-content/70">{p.owner}</td>
												<td>
													<span class={"badge badge-outline " + badgeClass(p.status)}>{p.status}</span>
													<div class="mt-1 text-xs text-base-content/50">{p.updated}</div>
												</td>
												<td>
													<div class="flex items-center gap-3">
														<!-- svelte-ignore element_invalid_self_closing_tag -->
														<progress class="progress progress-primary w-full" value={Math.max(0, Math.min(100, p.progressPct))} max="100" />
														<span class="w-10 text-right text-xs text-base-content/60">
															{Math.max(0, Math.min(100, p.progressPct))}%
														</span>
													</div>
												</td>
											</tr>
										{/each}
									{/if}
								</tbody>
							</table>
						</div>

						<p class="mt-3 text-xs text-base-content/50">
							On smaller screens the table scrolls horizontally; on large screens it expands into a wide card.
						</p>
					</div>
				</div>
			</div>

			<div class="col-span-12 xl:col-span-4 2xl:col-span-3">
				<div class="card bg-base-100 shadow-sm h-full">
					<div class="card-body">
						<div class="flex items-center justify-between">
							<h2 class="text-base font-semibold">Recent Activities</h2>
							<a class="link link-primary text-sm no-underline hover:underline" href="/activities">View All</a>
						</div>

						<ul class="mt-3 space-y-4">
							{#each activities as a (a.title + a.when)}
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

						<div class="mt-4 rounded-xl bg-base-200/50 p-3">
							<p class="text-sm font-medium">Approval Queue</p>
							<p class="mt-1 text-sm text-base-content/60">
								<span class="font-semibold">7</span> pending approvals
							</p>
							<div class="mt-2 flex gap-2">
								<button class="btn btn-sm btn-primary">Review</button>
								<button class="btn btn-sm btn-ghost">Export</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Beneficiary Targeted -->
			<div class="col-span-12">
				<div class="card bg-base-100 shadow-sm">
					<div class="card-body">
						<div class="flex flex-wrap items-center justify-between gap-3">
							<h2 class="text-base font-semibold">Beneficiary Targeted</h2>
							<div class="flex flex-wrap gap-2">
								<span class="badge badge-ghost">Programme: {filters.programme}</span>
								<span class="badge badge-ghost">Status: {filters.status}</span>
								<span class="badge badge-ghost">Year: {filters.year}</span>
							</div>
						</div>

						<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
							<div class="card bg-base-200/60">
								<div class="card-body">
									<p class="text-sm text-base-content/60">Total Targeted</p>
									<p class="text-2xl font-semibold">{beneficiary.total.toLocaleString()}</p>
									<p class="text-xs text-base-content/50">All programmes</p>
								</div>
							</div>

							<div class="card bg-base-200/60">
								<div class="card-body">
									<p class="text-sm text-base-content/60">Male Targeted</p>
									<p class="text-2xl font-semibold">{beneficiary.male.toLocaleString()}</p>
									<p class="text-xs text-base-content/50">{beneficiaryMeta.malePct}% of total</p>
								</div>
							</div>

							<div class="card bg-base-200/60">
								<div class="card-body">
									<p class="text-sm text-base-content/60">Female Targeted</p>
									<p class="text-2xl font-semibold">{beneficiary.female.toLocaleString()}</p>
									<p class="text-xs text-base-content/50">{beneficiaryMeta.femalePct}% of total</p>
								</div>
							</div>

							<div class="card bg-base-200/60">
								<div class="card-body">
									<p class="text-sm text-base-content/60">PWD Targeted</p>
									<p class="text-2xl font-semibold">{beneficiary.pwd.toLocaleString()}</p>
									<p class="text-xs text-base-content/50">{beneficiaryMeta.pwdPct}% of total</p>
								</div>
							</div>
						</div>

						<!-- Optional: wide-screen footer spacing -->
						<div class="mt-1"></div>
					</div>
				</div>
			</div>
		</div>

		<div class="h-6"></div>
	</div>
</div>
