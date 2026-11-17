<script lang="ts">
	type Row = {
		id: string;
		month: string;
		programme: string | null;

		total: number;
		male: number;
		female: number;
		others: number;

		disabledMale: number;
		disabledFemale: number;
		disabledOthers: number;

		remarks: string | null;
		createdAt: string | Date;
		updatedAt: string | Date;

		activity: { id: string; activityName: string; activityCode: string };
		branch: { id: number; name: string; code: string };
	};

	let { data } = $props<{
		data: {
			rows: Row[];
			filters: {
				q: string;
				month: string;
				programme: string;
				branchId: number;
				activityId: string;
				sort: string;
				page: number;
				pageSize: number;
				total: number;
			};
			options: {
				months: string[];
				programmes: string[];
				branches: { id: number; name: string; code: string }[];
				activities: { id: string; activityName: string; activityCode: string }[];
			};
		};
	}>();

	function fmtMonth(m: string) {
		const [y, mm] = m.split("-");
		const d = new Date(Number(y), Number(mm) - 1, 1);
		return Number.isNaN(d.getTime()) ? m : d.toLocaleString("en-US", { month: "long", year: "numeric" });
	}

	function fmtDate(d: string | Date) {
		const dt = typeof d === "string" ? new Date(d) : d;
		return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString();
	}

	const page = $derived(data.filters.page);
	const totalPages = $derived(Math.max(1, Math.ceil(data.filters.total / data.filters.pageSize)));
	const from = $derived((page - 1) * data.filters.pageSize + 1);
	const to = $derived(Math.min(page * data.filters.pageSize, data.filters.total));

	const qsBase = $derived(
        `q=${encodeURIComponent(data.filters.q)}` +
		`&month=${encodeURIComponent(data.filters.month)}` +
		`&programme=${encodeURIComponent(data.filters.programme)}` +
		`&branchId=${data.filters.branchId}` +
		`&activityId=${encodeURIComponent(data.filters.activityId)}` +
		`&sort=${encodeURIComponent(data.filters.sort)}`
    );
</script>

<svelte:head>
	<title>Activity Achievements</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<div class="mx-auto max-w-[1800px] px-3 py-5 sm:px-6 lg:px-8 2xl:px-10 2xl:py-8">
		<!-- Header -->
		<div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h1 class="text-xl font-semibold">Activity Achievements</h1>
				<p class="text-sm text-base-content/60">
					{data.filters.total.toLocaleString()} records · {data.filters.total ? `Showing ${from}–${to}` : "0"} · Page {page}/{totalPages}
				</p>
			</div>

			<div class="flex items-center gap-2">
				<a class="btn btn-primary btn-sm" href="/activity-achievement">New Entry</a>
			</div>
		</div>

		<!-- Filters -->
		<div class="card bg-base-100 shadow-sm mb-4">
			<div class="card-body">
				<form method="GET" class="grid grid-cols-12 gap-3">
					<label class="form-control col-span-12 lg:col-span-4">
						<div class="label"><span class="label-text">Search</span></div>
						<input
							class="input input-bordered w-full"
							name="q"
							value={data.filters.q}
							placeholder="Search remarks, activity, branch…"
						/>
					</label>

					<label class="form-control col-span-12 sm:col-span-6 lg:col-span-2">
						<div class="label"><span class="label-text">Month</span></div>
						<select class="select select-bordered w-full" name="month">
							<option value="ALL" selected={data.filters.month === "ALL"}>All</option>
							{#each data.options.months as m}
								<option value={m} selected={data.filters.month === m}>{fmtMonth(m)}</option>
							{/each}
						</select>
					</label>

					<label class="form-control col-span-12 sm:col-span-6 lg:col-span-2">
						<div class="label"><span class="label-text">Programme</span></div>
						<select class="select select-bordered w-full" name="programme">
							<option value="ALL" selected={data.filters.programme === "ALL"}>All</option>
							{#each data.options.programmes as p}
								<option value={p} selected={data.filters.programme === p}>{p}</option>
							{/each}
						</select>
					</label>

					<label class="form-control col-span-12 sm:col-span-6 lg:col-span-2">
						<div class="label"><span class="label-text">Branch</span></div>
						<select class="select select-bordered w-full" name="branchId">
							<option value="0" selected={data.filters.branchId === 0}>All</option>
							{#each data.options.branches as b}
								<option value={b.id} selected={data.filters.branchId === b.id}>{b.code} · {b.name}</option>
							{/each}
						</select>
					</label>

					<label class="form-control col-span-12 sm:col-span-6 lg:col-span-2">
						<div class="label"><span class="label-text">Sort</span></div>
						<select class="select select-bordered w-full" name="sort">
							<option value="newest" selected={data.filters.sort === "newest"}>Newest</option>
							<option value="oldest" selected={data.filters.sort === "oldest"}>Oldest</option>
							<option value="month" selected={data.filters.sort === "month"}>Month (desc)</option>
							<option value="total" selected={data.filters.sort === "total"}>Total (desc)</option>
						</select>
					</label>

					<label class="form-control col-span-12 lg:col-span-8">
						<div class="label"><span class="label-text">Activity</span></div>
						<select class="select select-bordered w-full" name="activityId">
							<option value="ALL" selected={data.filters.activityId === "ALL"}>All</option>
							{#each data.options.activities as a}
								<option value={a.id} selected={data.filters.activityId === a.id}>
									{a.activityCode} · {a.activityName}
								</option>
							{/each}
						</select>
					</label>

					<div class="col-span-12 lg:col-span-4 flex items-end justify-end gap-2">
						<button class="btn btn-primary" type="submit">Apply</button>
						<a class="btn btn-ghost" href="/activity-achievements">Reset</a>
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
								<th class="min-w-[170px]">Month</th>
								<th class="min-w-[150px]">Programme</th>
								<th class="min-w-[380px]">Activity</th>
								<th class="min-w-[280px]">Branch</th>
								<th class="min-w-[120px] text-right">Total</th>
								<th class="min-w-[240px]">Gender (M/F/O)</th>
								<th class="min-w-[300px]">Disability (DM/DF/DO)</th>
								<th class="min-w-[380px]">Remarks</th>
								<th class="min-w-[140px]">Updated</th>
								<th class="w-28 text-right">Actions</th>
							</tr>
						</thead>

						<tbody>
							{#if data.rows.length === 0}
								<tr>
									<td colspan="10">
										<div class="p-6 text-center text-base-content/60">No achievements found.</div>
									</td>
								</tr>
							{:else}
								{#each data.rows as r (r.id)}
									<tr class="align-top">
										<td class="font-medium">{fmtMonth(r.month)}</td>
										<td>{r.programme ?? "—"}</td>

										<td>
											<div class="flex flex-col">
												<span class="font-medium">{r.activity.activityName}</span>
												<span class="text-xs text-base-content/60">{r.activity.activityCode}</span>
											</div>
										</td>

										<td>
											<div class="flex flex-col">
												<span class="font-medium">{r.branch.name}</span>
												<span class="text-xs text-base-content/60">{r.branch.code}</span>
											</div>
										</td>

										<td class="text-right font-mono">{r.total.toLocaleString()}</td>

										<td>
											<div class="flex flex-wrap gap-1">
												<span class="badge badge-outline">M: {r.male}</span>
												<span class="badge badge-outline">F: {r.female}</span>
												<span class="badge badge-outline">O: {r.others}</span>
											</div>
										</td>

										<td>
											<div class="flex flex-wrap gap-1">
												<span class="badge badge-outline">DM: {r.disabledMale}</span>
												<span class="badge badge-outline">DF: {r.disabledFemale}</span>
												<span class="badge badge-outline">DO: {r.disabledOthers}</span>
											</div>
										</td>

										<td>
											{#if r.remarks}
												<div class="max-w-[380px] whitespace-pre-wrap wrap-break-word text-sm">{r.remarks}</div>
											{:else}
												<span class="text-sm text-base-content/50">—</span>
											{/if}
										</td>

										<td class="text-sm">{fmtDate(r.updatedAt)}</td>

										<td class="text-right">
											<div class="join join-vertical sm:join-horizontal">
												<a class="btn btn-ghost btn-xs join-item" href={`/activity-achievements/${r.id}`}>View</a>
												<a class="btn btn-ghost btn-xs join-item" href={`/activity-achievements/${r.id}/edit`}>Edit</a>
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
						<a class={"btn btn-sm join-item " + (page <= 1 ? "btn-disabled" : "")} href={`?${qsBase}&page=${Math.max(1, page - 1)}`}>
							Prev
						</a>
						<span class="btn btn-sm join-item btn-ghost pointer-events-none">Page {page}/{totalPages}</span>
						<a class={"btn btn-sm join-item " + (page >= totalPages ? "btn-disabled" : "")} href={`?${qsBase}&page=${Math.min(totalPages, page + 1)}`}>
							Next
						</a>
					</div>
				</div>

			</div>
		</div>
	</div>
</div>
