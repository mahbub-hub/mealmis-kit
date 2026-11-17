<script lang="ts">
	type BranchRow = {
		id: number;
		name: string;
		code: string;
		address: string | null;
		phone: string | null;
		email: string | null;
		isActive: boolean;
		createdAt: string | Date;
		updatedAt: string | Date;

		division: { id: number; name: string };
		district: { id: number; name: string };
		upazilla: { id: number; name: string };
		union: { id: number; name: string } | null;

		_count: {
			projects: number;
			activities: number;
			users: number;
			participants: number;
			activityAchievements: number;
		};
	};

	let { data } = $props<{
		data: {
			rows: BranchRow[];
			filters: {
				q: string;
				divisionId: number;
				districtId: number;
				upazillaId: number;
				isActive: string; // ALL | true | false
				sort: string;
				page: number;
				pageSize: number;
				total: number;
			};
			options: {
				divisions: { id: number; name: string }[];
				districtsByDivision: Record<number, { id: number; name: string }[]>;
				upazillasByDistrict: Record<number, { id: number; name: string }[]>;
			};
		};
	}>();

	function fmtDate(d: string | Date) {
		const dt = typeof d === "string" ? new Date(d) : d;
		return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString();
	}

	const page = $derived(data.filters.page);
	const totalPages = $derived(Math.max(1, Math.ceil(data.filters.total / data.filters.pageSize)));
	const from = $derived((page - 1) * data.filters.pageSize + 1);
	const to = $derived(Math.min(page * data.filters.pageSize, data.filters.total));

	const districts = $derived(data.options.districtsByDivision[data.filters.divisionId] ?? []);
	const upazillas = $derived(data.options.upazillasByDistrict[data.filters.districtId] ?? []);

	const qsBase = $derived(
        `q=${encodeURIComponent(data.filters.q)}` +
		`&divisionId=${data.filters.divisionId}` +
		`&districtId=${data.filters.districtId}` +
		`&upazillaId=${data.filters.upazillaId}` +
		`&isActive=${encodeURIComponent(data.filters.isActive)}` +
		`&sort=${encodeURIComponent(data.filters.sort)}`
        );
</script>

<svelte:head>
	<title>Branches View</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<div class="mx-auto max-w-[1800px] px-3 py-5 sm:px-6 lg:px-8 2xl:px-10 2xl:py-8">
		<!-- Header -->
		<div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h1 class="text-xl font-semibold">Branches Views</h1>
				<p class="text-sm text-base-content/60">
					{data.filters.total.toLocaleString()} branches · {data.filters.total ? `Showing ${from}–${to}` : "0"} · Page {page}/{totalPages}
				</p>
			</div>

			<div class="flex items-center gap-2">
				<a class="btn btn-primary btn-sm" href="/branch-registration">New Branch</a>
			</div>
		</div>

		<!-- Filters -->
		<div class="card bg-base-100 shadow-sm mb-4">
			<div class="card-body">
				<form method="GET" class="grid grid-cols-12 gap-3">
					<label class="form-control col-span-12 lg:col-span-4">
						<div class="label"><span class="label-text">Search</span></div>
						<input class="input input-bordered w-full" name="q" value={data.filters.q} placeholder="Search name, code, phone, email…" />
					</label>

					<label class="form-control col-span-12 sm:col-span-6 lg:col-span-2">
						<div class="label"><span class="label-text">Division</span></div>
						<select class="select select-bordered w-full" name="divisionId">
							<option value="0" selected={data.filters.divisionId === 0}>All</option>
							{#each data.options.divisions as d}
								<option value={d.id} selected={data.filters.divisionId === d.id}>{d.name}</option>
							{/each}
						</select>
					</label>

					<label class="form-control col-span-12 sm:col-span-6 lg:col-span-2">
						<div class="label"><span class="label-text">District</span></div>
						<select class="select select-bordered w-full" name="districtId" disabled={data.filters.divisionId === 0}>
							<option value="0" selected={data.filters.districtId === 0}>All</option>
							{#each districts as d}
								<option value={d.id} selected={data.filters.districtId === d.id}>{d.name}</option>
							{/each}
						</select>
					</label>

					<label class="form-control col-span-12 sm:col-span-6 lg:col-span-2">
						<div class="label"><span class="label-text">Upazilla</span></div>
						<select class="select select-bordered w-full" name="upazillaId" disabled={data.filters.districtId === 0}>
							<option value="0" selected={data.filters.upazillaId === 0}>All</option>
							{#each upazillas as u}
								<option value={u.id} selected={data.filters.upazillaId === u.id}>{u.name}</option>
							{/each}
						</select>
					</label>

					<label class="form-control col-span-12 sm:col-span-6 lg:col-span-2">
						<div class="label"><span class="label-text">Active</span></div>
						<select class="select select-bordered w-full" name="isActive">
							<option value="ALL" selected={data.filters.isActive === "ALL"}>All</option>
							<option value="true" selected={data.filters.isActive === "true"}>Active</option>
							<option value="false" selected={data.filters.isActive === "false"}>Inactive</option>
						</select>
					</label>

					<label class="form-control col-span-12 lg:col-span-3">
						<div class="label"><span class="label-text">Sort</span></div>
						<select class="select select-bordered w-full" name="sort">
							<option value="newest" selected={data.filters.sort === "newest"}>Newest</option>
							<option value="oldest" selected={data.filters.sort === "oldest"}>Oldest</option>
							<option value="name" selected={data.filters.sort === "name"}>Name (A–Z)</option>
							<option value="code" selected={data.filters.sort === "code"}>Code (A–Z)</option>
						</select>
					</label>

					<div class="col-span-12 lg:col-span-9 flex items-end justify-end gap-2">
						<button class="btn btn-primary" type="submit">Apply</button>
						<a class="btn btn-ghost" href="/branches">Reset</a>
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
								<th class="min-w-[320px]">Branch</th>
								<th class="min-w-[320px]">Location</th>
								<th class="min-w-[320px]">Contact</th>
								<th class="min-w-[340px]">Counts</th>
								<th class="min-w-[140px]">Updated</th>
								<th class="w-28 text-right">Actions</th>
							</tr>
						</thead>

						<tbody>
							{#if data.rows.length === 0}
								<tr>
									<td colspan="6">
										<div class="p-6 text-center text-base-content/60">No branches found.</div>
									</td>
								</tr>
							{:else}
								{#each data.rows as r (r.id)}
									<tr class="align-top">
										<td>
											<div class="flex items-start justify-between gap-3">
												<div class="flex flex-col">
													<span class="font-medium">{r.name}</span>
													<span class="text-xs text-base-content/60">{r.code}</span>
												</div>
												<span class={"badge " + (r.isActive ? "badge-success" : "badge-ghost")}>
													{r.isActive ? "Active" : "Inactive"}
												</span>
											</div>
										</td>

										<td>
											<div class="flex flex-col">
												<span class="font-medium">{r.division.name} · {r.district.name}</span>
												<span class="text-xs text-base-content/60">{r.upazilla.name}{r.union ? ` · ${r.union.name}` : ""}</span>
												{#if r.address}
													<span class="mt-1 text-xs text-base-content/60 line-clamp-2 max-w-[320px]">{r.address}</span>
												{/if}
											</div>
										</td>

										<td>
											<div class="flex flex-col gap-1 text-sm">
												<span>{r.phone ?? "—"}</span>
												<span class="text-base-content/70">{r.email ?? "—"}</span>
											</div>
										</td>

										<td>
											<div class="flex flex-wrap gap-1">
												<span class="badge badge-outline">Projects: {r._count.projects}</span>
												<span class="badge badge-outline">Activities: {r._count.activities}</span>
												<span class="badge badge-outline">Users: {r._count.users}</span>
												<span class="badge badge-outline">Participants: {r._count.participants}</span>
												<span class="badge badge-outline">Achievements: {r._count.activityAchievements}</span>
											</div>
										</td>

										<td class="text-sm">{fmtDate(r.updatedAt)}</td>

										<td class="text-right">
											<div class="join join-vertical sm:join-horizontal">
												<a class="btn btn-ghost btn-xs join-item" href={`/branches/${r.id}`}>View</a>
												<a class="btn btn-ghost btn-xs join-item" href={`/branches/${r.id}/edit`}>Edit</a>
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
						<a class={"btn btn-sm join-item " + (page <= 1 ? "btn-disabled" : "")} href={`?${qsBase}&page=${Math.max(1, page - 1)}`}>Prev</a>
						<span class="btn btn-sm join-item btn-ghost pointer-events-none">Page {page}/{totalPages}</span>
						<a class={"btn btn-sm join-item " + (page >= totalPages ? "btn-disabled" : "")} href={`?${qsBase}&page=${Math.min(totalPages, page + 1)}`}>Next</a>
					</div>
				</div>

			</div>
		</div>
	</div>
</div>
