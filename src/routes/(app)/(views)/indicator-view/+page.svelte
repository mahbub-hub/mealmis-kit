<script lang="ts">
	type ProjectMini = { id: number; projectName: string; projectId: string };

	type IndicatorRow = {
		id: string;
		indicatorCode: string;
		indicatorName: string;
		description: string | null;
		category: string;
		unit: string;

		targetValue: any;
		baselineValue: any;
		achievedValue: any;

		targetMale: number;
		targetFemale: number;
		targetOther: number;

		achievedMale: number;
		achievedFemale: number;
		achievedOther: number;

		reportingFrequency: string;
		createdAt: string | Date;
		updatedAt: string | Date;

		project: ProjectMini;
	};

	let { data } = $props<{
		data: {
			rows: IndicatorRow[];
			filters: {
				q: string;
				projectId: number;
				category: string;
				freq: string;
				sort: string;
				page: number;
				pageSize: number;
				total: number;
			};
			options: {
				projects: ProjectMini[];
				categories: string[];
				freqs: string[];
			};
		};
	}>();

	function num(v: any) {
		// Prisma Decimal often comes as string on JSON
		const n = Number(v ?? 0);
		return Number.isFinite(n) ? n : 0;
	}

	function fmt2(v: any) {
		const n = num(v);
		return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	function pct(ach: any, target: any) {
		const a = num(ach);
		const t = num(target);
		if (t <= 0) return 0;
		return Math.min(100, Math.max(0, (a / t) * 100));
	}

	function fmtDate(d: string | Date) {
		const dt = typeof d === "string" ? new Date(d) : d;
		return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString();
	}

	const page = $derived(data.filters.page);
	const totalPages = $derived(Math.max(1, Math.ceil(data.filters.total / data.filters.pageSize)));
	const from = $derived((page - 1) * data.filters.pageSize + 1);
	const to = $derived(Math.min(page * data.filters.pageSize, data.filters.total));
</script>

<svelte:head>
	<title>Project Indicators</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<div class="mx-auto max-w-[1800px] px-3 py-5 sm:px-6 lg:px-8 2xl:px-10 2xl:py-8">
		<!-- Header -->
		<div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h1 class="text-xl font-semibold">Project Indicators</h1>
				<p class="text-sm text-base-content/60">
					{data.filters.total.toLocaleString()} indicators · {data.filters.total ? `Showing ${from}–${to}` : "0"} · Page {page}/{totalPages}
				</p>
			</div>

			<div class="flex items-center gap-2">
				<a class="btn btn-primary btn-sm" href="/project-registration">New Indicator</a>
			</div>
		</div>

		<!-- Filters -->
		<div class="card bg-base-100 shadow-sm mb-4">
			<div class="card-body">
				<form method="GET" class="grid grid-cols-12 gap-3">
					<label class="form-control col-span-12 lg:col-span-4">
						<div class="label"><span class="label-text">Search</span></div>
						<input class="input input-bordered w-full" name="q" value={data.filters.q} placeholder="Search code, name, description…" />
					</label>

					<label class="form-control col-span-12 lg:col-span-4">
						<div class="label"><span class="label-text">Project</span></div>
						<select class="select select-bordered w-full" name="projectId">
							<option value="0" selected={data.filters.projectId === 0}>All Projects</option>
							{#each data.options.projects as p}
								<option value={p.id} selected={data.filters.projectId === p.id}>
									{p.projectId} · {p.projectName}
								</option>
							{/each}
						</select>
					</label>

					<label class="form-control col-span-12 sm:col-span-6 lg:col-span-2">
						<div class="label"><span class="label-text">Category</span></div>
						<select class="select select-bordered w-full" name="category">
							<option value="ALL" selected={data.filters.category === "ALL"}>All</option>
							{#each data.options.categories as c}
								<option value={c} selected={data.filters.category === c}>{c}</option>
							{/each}
						</select>
					</label>

					<label class="form-control col-span-12 sm:col-span-6 lg:col-span-2">
						<div class="label"><span class="label-text">Frequency</span></div>
						<select class="select select-bordered w-full" name="freq">
							<option value="ALL" selected={data.filters.freq === "ALL"}>All</option>
							{#each data.options.freqs as f}
								<option value={f} selected={data.filters.freq === f}>{f}</option>
							{/each}
						</select>
					</label>

					<label class="form-control col-span-12 sm:col-span-6 lg:col-span-3">
						<div class="label"><span class="label-text">Sort</span></div>
						<select class="select select-bordered w-full" name="sort">
							<option value="newest" selected={data.filters.sort === "newest"}>Newest</option>
							<option value="oldest" selected={data.filters.sort === "oldest"}>Oldest</option>
							<option value="code" selected={data.filters.sort === "code"}>Code (A–Z)</option>
							<option value="name" selected={data.filters.sort === "name"}>Name (A–Z)</option>
						</select>
					</label>

					<div class="col-span-12 sm:col-span-6 lg:col-span-9 flex items-end justify-end gap-2">
						<button class="btn btn-primary" type="submit">Apply</button>
						<a class="btn btn-ghost" href="/indicators">Reset</a>
					</div>
				</form>
			</div>
		</div>

		<!-- Table -->
		<div class="card bg-base-100 shadow-sm">
			<div class="card-body p-0">
				<div class="overflow-x-auto">
					<table class="table table-zebra">
						<thead class="sticky top-0 z-10 bg-base-100">
							<tr>
								<th class="min-w-[260px]">Project</th>
								<th class="min-w-[170px]">Code</th>
								<th class="min-w-[360px]">Indicator</th>
								<th class="min-w-[150px]">Category</th>
								<th class="min-w-[120px]">Unit</th>

								<th class="min-w-[150px] text-right">Target</th>
								<th class="min-w-[150px] text-right">Baseline</th>
								<th class="min-w-[150px] text-right">Achieved</th>
								<th class="min-w-[160px]">Achieved %</th>

								<th class="min-w-[260px]">Target (M/F/O)</th>
								<th class="min-w-[260px]">Achieved (M/F/O)</th>

								<th class="min-w-[160px]">Frequency</th>
								<th class="min-w-[140px]">Updated</th>
								<th class="w-28 text-right">Actions</th>
							</tr>
						</thead>

						<tbody>
							{#if data.rows.length === 0}
								<tr>
									<td colspan="14">
										<div class="p-6 text-center text-base-content/60">No indicators found.</div>
									</td>
								</tr>
							{:else}
								{#each data.rows as r (r.id)}
									{@const progress = pct(r.achievedValue, r.targetValue)}

									<tr class="align-top">
										<td>
											<div class="flex flex-col">
												<span class="font-medium">{r.project.projectName}</span>
												<span class="text-xs text-base-content/60">{r.project.projectId}</span>
											</div>
										</td>

										<td class="font-mono text-sm">{r.indicatorCode}</td>

										<td>
											<div class="flex flex-col">
												<span class="font-medium">{r.indicatorName}</span>
												{#if r.description}
													<span class="text-xs text-base-content/60 line-clamp-2 max-w-[360px]">{r.description}</span>
												{/if}
											</div>
										</td>

										<td><span class="badge badge-outline">{r.category}</span></td>
										<td>{r.unit}</td>

										<td class="text-right font-mono">{fmt2(r.targetValue)}</td>
										<td class="text-right font-mono">{r.baselineValue == null ? "—" : fmt2(r.baselineValue)}</td>
										<td class="text-right font-mono">{fmt2(r.achievedValue)}</td>

										<td>
											<div class="flex flex-col gap-1">
												<progress class="progress w-full" value={progress} max="100"></progress>
												<span class="text-xs text-base-content/70">{progress.toFixed(1)}%</span>
											</div>
										</td>

										<td>
											<div class="flex flex-wrap gap-1">
												<span class="badge badge-ghost">M: {r.targetMale}</span>
												<span class="badge badge-ghost">F: {r.targetFemale}</span>
												<span class="badge badge-ghost">O: {r.targetOther}</span>
											</div>
										</td>

										<td>
											<div class="flex flex-wrap gap-1">
												<span class="badge badge-outline">M: {r.achievedMale}</span>
												<span class="badge badge-outline">F: {r.achievedFemale}</span>
												<span class="badge badge-outline">O: {r.achievedOther}</span>
											</div>
										</td>

										<td><span class="badge badge-secondary badge-outline">{r.reportingFrequency}</span></td>
										<td class="text-sm">{fmtDate(r.updatedAt)}</td>

										<td class="text-right">
											<div class="join join-vertical sm:join-horizontal">
												<a class="btn btn-ghost btn-xs join-item" href={`/indicators/${r.id}`}>View</a>
												<a class="btn btn-ghost btn-xs join-item" href={`/indicators/${r.id}/edit`}>Edit</a>
											</div>
										</td>
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>
				</div>

				<!-- Pagination -->
				<div class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-t border-base-200">
					<div class="text-sm text-base-content/60">
						{#if data.filters.total > 0}
							Showing {from}–{to} of {data.filters.total}
						{:else}
							No records
						{/if}
					</div>

					<div class="join">
						<a
							class={"btn btn-sm join-item " + (page <= 1 ? "btn-disabled" : "")}
							href={`?q=${encodeURIComponent(data.filters.q)}&projectId=${data.filters.projectId}&category=${encodeURIComponent(
								data.filters.category
							)}&freq=${encodeURIComponent(data.filters.freq)}&sort=${encodeURIComponent(data.filters.sort)}&page=${Math.max(1, page - 1)}`}
						>
							Prev
						</a>

						<span class="btn btn-sm join-item btn-ghost pointer-events-none">Page {page}/{totalPages}</span>

						<a
							class={"btn btn-sm join-item " + (page >= totalPages ? "btn-disabled" : "")}
							href={`?q=${encodeURIComponent(data.filters.q)}&projectId=${data.filters.projectId}&category=${encodeURIComponent(
								data.filters.category
							)}&freq=${encodeURIComponent(data.filters.freq)}&sort=${encodeURIComponent(data.filters.sort)}&page=${Math.min(totalPages, page + 1)}`}
						>
							Next
						</a>
					</div>
				</div>

			</div>
		</div>
	</div>
</div>
