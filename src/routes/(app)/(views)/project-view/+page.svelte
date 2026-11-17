<script lang="ts">
    import type { PageProps } from "./$types";

	type ProjectRow = {
		id: number;
		projectId: string;
		projectName: string;
		projectType: string | null;
		projectDuration: number | null;
		programme: string;

		budget: any;
		currency: string;
		status: string;

		totalTarget: number;
		targetMale: number;
		targetFemale: number;
		targetOther: number;
		targetDisabled: number;

		startDate: string | Date;
		endDate: string | Date;
		isActive: boolean;
		createdAt: string | Date;
		updatedAt: string | Date;

		donor: { id: number; name: string };
		district: { id: number; name: string };
		upazilla: { id: number; name: string };
		branch: { id: number; name: string; code: string };

		_count: { indicators: number; activities: number; participants: number };
	};

    let { data } : PageProps = $props();

	// let { data } : PageProps = $props<{
	// 	data: {
	// 		rows: ProjectRow[];
	// 		filters: {
	// 			q: string;
	// 			programme: string;
	// 			status: string;
	// 			donorId: number;
	// 			districtId: number;
	// 			branchId: number;
	// 			sort: string;
	// 			page: number;
	// 			pageSize: number;
	// 			total: number;
	// 		};
	// 		options: {
	// 			programmes: string[];
	// 			statuses: string[];
	// 			donors: { id: number; name: string }[];
	// 			districts: { id: number; name: string }[];
	// 			branches: { id: number; name: string; code: string }[];
	// 		};
	// 	};
	// }>();

	function num(v: any) {
		const n = Number(v ?? 0);
		return Number.isFinite(n) ? n : 0;
	}
	function money(v: any, cur: string) {
		const n = num(v);
		return `${cur} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	}
	function fmtDate(d: string | Date) {
		const dt = typeof d === "string" ? new Date(d) : d;
		return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString();
	}
	function daysLeft(end: string | Date) {
		const dt = typeof end === "string" ? new Date(end) : end;
		if (Number.isNaN(dt.getTime())) return null;
		const diff = Math.ceil((dt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
		return diff;
	}

	const page = $derived(data.filters.page?? 1);
	const totalPages = $derived(Math.max(1, Math.ceil(data.filters.total / data.filters.pageSize)))
	const from = $derived((page - 1) * data.filters.pageSize + 1)
	const to = $derived(Math.min(page * data.filters.pageSize, data.filters.total));
</script>

<svelte:head>
	<title>Projects View</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<div class="mx-auto max-w-[1800px] px-3 py-5 sm:px-6 lg:px-8 2xl:px-10 2xl:py-8">
		<!-- Header -->
		<div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h1 class="text-xl font-semibold">Projects View</h1>
				<p class="text-sm text-base-content/60">
					{data.filters.total.toLocaleString()} projects · {data.filters.total ? `Showing ${from}–${to}` : "0"} · Page {page}/{totalPages}
				</p>
			</div>

			<div class="flex items-center gap-2">
				<a class="btn btn-primary btn-sm" href="/project-registration">New Project</a>
			</div>
		</div>

		<!-- Filters -->
		<div class="card bg-base-100 shadow-sm mb-4">
			<div class="card-body">
				<form method="GET" class="grid grid-cols-12 gap-3">
					<label class="form-control col-span-12 lg:col-span-4">
						<div class="label"><span class="label-text">Search</span></div>
						<input class="input input-bordered w-full" name="q" value={data.filters.q} placeholder="Search project ID or name…" />
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
						<div class="label"><span class="label-text">Status</span></div>
						<select class="select select-bordered w-full" name="status">
							<option value="ALL" selected={data.filters.status === "ALL"}>All</option>
							{#each data.options.statuses as s}
								<option value={s} selected={data.filters.status === s}>{s}</option>
							{/each}
						</select>
					</label>

					<label class="form-control col-span-12 sm:col-span-6 lg:col-span-2">
						<div class="label"><span class="label-text">Donor</span></div>
						<select class="select select-bordered w-full" name="donorId">
							<option value="0" selected={data.filters.donorId === 0}>All</option>
							{#each data.options.donors as d}
								<option value={d.id} selected={data.filters.donorId === d.id}>{d.donorName}</option>
							{/each}
						</select>
					</label>

					<label class="form-control col-span-12 sm:col-span-6 lg:col-span-2">
						<div class="label"><span class="label-text">District</span></div>
						<select class="select select-bordered w-full" name="districtId">
							<option value="0" selected={data.filters.districtId === 0}>All</option>
							{#each data.options.districts as d}
								<option value={d.id} selected={data.filters.districtId === d.id}>{d.name}</option>
							{/each}
						</select>
					</label>

					<label class="form-control col-span-12 lg:col-span-4">
						<div class="label"><span class="label-text">Branch</span></div>
						<select class="select select-bordered w-full" name="branchId">
							<option value="0" selected={data.filters.branchId === 0}>All</option>
							{#each data.options.branches as b}
								<option value={b.id} selected={data.filters.branchId === b.id}>{b.code} · {b.name}</option>
							{/each}
						</select>
					</label>

					<label class="form-control col-span-12 lg:col-span-4">
						<div class="label"><span class="label-text">Sort</span></div>
						<select class="select select-bordered w-full" name="sort">
							<option value="newest" selected={data.filters.sort === "newest"}>Newest</option>
							<option value="oldest" selected={data.filters.sort === "oldest"}>Oldest</option>
							<option value="name" selected={data.filters.sort === "name"}>Name (A–Z)</option>
							<option value="budget" selected={data.filters.sort === "budget"}>Budget (desc)</option>
							<option value="start" selected={data.filters.sort === "start"}>Start date (desc)</option>
						</select>
					</label>

					<div class="col-span-12 lg:col-span-4 flex items-end justify-end gap-2">
						<button class="btn btn-primary" type="submit">Apply</button>
						<a class="btn btn-ghost" href="/projects">Reset</a>
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
								<th class="min-w-[320px]">Project</th>
								<th class="min-w-[180px]">Programme</th>
								<th class="min-w-[240px]">Donor</th>
								<th class="min-w-[260px]">Location</th>
								<th class="min-w-[260px]">Branch</th>

								<th class="min-w-[200px] text-right">Budget</th>
								<th class="min-w-[240px]">Targets</th>
								<th class="min-w-[180px]">Dates</th>
								<th class="min-w-[220px]">Counts</th>

								<th class="w-28 text-right">Actions</th>
							</tr>
						</thead>

						<tbody>
							{#if data.rows.length === 0}
								<tr>
									<td colspan="10">
										<div class="p-6 text-center text-base-content/60">No projects found.</div>
									</td>
								</tr>
							{:else}
								{#each data.rows as r (r.id)}
									{@const left = daysLeft(r.endDate)}

									<tr class="align-top">
										<td>
											<div class="flex flex-col">
												<span class="font-medium">{r.projectName}</span>
												<span class="text-xs text-base-content/60">{r.projectId}{r.projectType ? ` · ${r.projectType}` : ""}</span>
											</div>
										</td>

										<td>
											<div class="flex flex-col gap-1">
												<span class="badge badge-outline">{r.programme}</span>
												<span class={"badge " + (r.status === "ACTIVE" ? "badge-success" : "badge-ghost")}>
													{r.status}
												</span>
											</div>
										</td>

										<td>{r.donor.donorName}</td>

										<td>
											<div class="flex flex-col">
												<span class="font-medium">{r.district.name}</span>
												<span class="text-xs text-base-content/60">{r.upazilla.name}</span>
											</div>
										</td>

										<td>
											<div class="flex flex-col">
												<span class="font-medium">{r.branch.name}</span>
												<span class="text-xs text-base-content/60">{r.branch.code}</span>
											</div>
										</td>

										<td class="text-right font-mono">{money(r.budget, r.currency)}</td>

										<td>
											<div class="flex flex-wrap gap-1">
												<span class="badge badge-ghost">T: {r.totalTarget}</span>
												<span class="badge badge-ghost">M: {r.targetMale}</span>
												<span class="badge badge-ghost">F: {r.targetFemale}</span>
												<span class="badge badge-ghost">O: {r.targetOther}</span>
												<span class="badge badge-ghost">D: {r.targetDisabled}</span>
											</div>
										</td>

										<td>
											<div class="flex flex-col gap-1">
												<span class="text-sm">{fmtDate(r.startDate)} → {fmtDate(r.endDate)}</span>
												{#if left !== null}
													<span class={"text-xs " + (left < 0 ? "text-error" : left < 30 ? "text-warning" : "text-base-content/60")}>
														{left < 0 ? `${Math.abs(left)} days overdue` : `${left} days left`}
													</span>
												{/if}
											</div>
										</td>

										<td>
											<div class="flex flex-wrap gap-1">
												<span class="badge badge-outline">Indicators: {r._count.indicators}</span>
												<span class="badge badge-outline">Activities: {r._count.activities}</span>
												<span class="badge badge-outline">Participants: {r._count.participants}</span>
											</div>
										</td>

										<td class="text-right">
											<div class="join join-vertical sm:join-horizontal">
												<a class="btn btn-ghost btn-xs join-item" href={`/projects/${r.id}`}>View</a>
												<a class="btn btn-ghost btn-xs join-item" href={`/projects/${r.id}/edit`}>Edit</a>
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
							href={`?q=${encodeURIComponent(data.filters.q)}&programme=${encodeURIComponent(
								data.filters.programme
							)}&status=${encodeURIComponent(data.filters.status)}&donorId=${data.filters.donorId}&districtId=${data.filters.districtId}&branchId=${data.filters.branchId}&sort=${encodeURIComponent(
								data.filters.sort
							)}&page=${Math.max(1, page - 1)}`}
						>
							Prev
						</a>

						<span class="btn btn-sm join-item btn-ghost pointer-events-none">Page {page}/{totalPages}</span>

						<a
							class={"btn btn-sm join-item " + (page >= totalPages ? "btn-disabled" : "")}
							href={`?q=${encodeURIComponent(data.filters.q)}&programme=${encodeURIComponent(
								data.filters.programme
							)}&status=${encodeURIComponent(data.filters.status)}&donorId=${data.filters.donorId}&districtId=${data.filters.districtId}&branchId=${data.filters.branchId}&sort=${encodeURIComponent(
								data.filters.sort
							)}&page=${Math.min(totalPages, page + 1)}`}
						>
							Next
						</a>
					</div>
				</div>

			</div>
		</div>
	</div>
</div>
