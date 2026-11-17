<script lang="ts">
	import { page as pageStore } from "$app/stores";
	import { get } from "svelte/store";
	type ProjectMini = { id: number; projectName: string; projectId: string };
	type BranchMini = { id: number; name: string; code: string };

	type UserRow = {
		id: number;
		email: string;
		username: string;
		name: string | null;
		role: string;
		createdAt: string | Date;
		updatedAt: string | Date;
		projects: ProjectMini[];
		branches: BranchMini[];
	};

	let { data } = $props<{
		data: {
			users: UserRow[];
			query: { q: string; role: string; sort: string; page: number; pageSize: number; total: number };
		};
	}>();

	let q = $state(data.query.q);
	let role = $state(data.query.role);
	let sort = $state(data.query.sort);

	const page = data.query.page;
	const totalPages = Math.max(1, Math.ceil(data.query.total / data.query.pageSize));

	function fmtDate(d: string | Date) {
		const dt = typeof d === "string" ? new Date(d) : d;
		return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString();
	}

	function buildUrl(next: Partial<{ q: string; role: string; sort: string; page: number }>) {
		// SSR-safe: read current URL from SvelteKit's page store
		const currentUrl = get(pageStore).url;
		const u = new URL(currentUrl);

		if (next.q !== undefined) u.searchParams.set("q", next.q);
		if (next.role !== undefined) u.searchParams.set("role", next.role);
		if (next.sort !== undefined) u.searchParams.set("sort", next.sort);
		if (next.page !== undefined) u.searchParams.set("page", String(next.page));

		return u.pathname + "?" + u.searchParams.toString();
	}
</script>

<svelte:head>
	<title>Users</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<div class="mx-auto max-w-[1800px] px-3 py-5 sm:px-6 lg:px-8 2xl:px-10 2xl:py-8">
		<!-- Header -->
		<div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h1 class="text-xl font-semibold">Users</h1>
				<p class="text-sm text-base-content/60">
					{data.query.total.toLocaleString()} total · Page {page} / {totalPages}
				</p>
			</div>

			<div class="flex items-center gap-2">
				<a class="btn btn-primary btn-sm" href="/users/new">Create User</a>
			</div>
		</div>

		<!-- Filters -->
		<div class="card bg-base-100 shadow-sm mb-4">
			<div class="card-body">
				<div class="grid grid-cols-12 gap-3">
					<label class="form-control col-span-12 lg:col-span-6">
						<div class="label"><span class="label-text">Search</span></div>
						<div class="join w-full">
							<input
								class="input input-bordered join-item w-full"
								placeholder="Search email, username, name…"
								bind:value={q}
							/>
							<button
								type="button"
								class="btn btn-primary join-item"
								onclick={() => (window.location.href = buildUrl({ q, page: 1 }))}
							>
								Search
							</button>
						</div>
					</label>

					<label class="form-control col-span-12 sm:col-span-6 lg:col-span-3">
						<div class="label"><span class="label-text">Role</span></div>
						<select
							class="select select-bordered w-full"
							bind:value={role}
							onchange={() => (window.location.href = buildUrl({ role, page: 1 }))}
						>
							<option value="ALL">All</option>
							<option value="USER">USER</option>
							<option value="MANAGER">MANAGER</option>
							<option value="ADMIN">ADMIN</option>
						</select>
					</label>

					<label class="form-control col-span-12 sm:col-span-6 lg:col-span-3">
						<div class="label"><span class="label-text">Sort</span></div>
						<select
							class="select select-bordered w-full"
							bind:value={sort}
							onchange={() => (window.location.href = buildUrl({ sort, page: 1 }))}
						>
							<option value="newest">Newest</option>
							<option value="oldest">Oldest</option>
							<option value="email">Email (A–Z)</option>
							<option value="role">Role</option>
						</select>
					</label>
				</div>
			</div>
		</div>

		<!-- Table -->
		<div class="card bg-base-100 shadow-sm">
			<div class="card-body p-0">
				<div class="overflow-x-auto">
					<table class="table table-zebra">
						<thead class="sticky top-0 z-10 bg-base-100">
							<tr>
								<th class="w-16">ID</th>
								<th class="min-w-[260px]">User</th>
								<th class="min-w-[140px]">Role</th>
								<th class="min-w-[340px]">Projects</th>
								<th class="min-w-[320px]">Branches</th>
								<th class="min-w-[160px]">Created</th>
								<th class="min-w-[160px]">Updated</th>
								<th class="w-24 text-right">Actions</th>
							</tr>
						</thead>

						<tbody>
							{#if data.users.length === 0}
								<tr>
									<td colspan="8">
										<div class="p-6 text-center text-base-content/60">No users found.</div>
									</td>
								</tr>
							{:else}
								{#each data.users as u (u.id)}
									<tr class="align-top">
										<td class="font-mono text-sm">{u.id}</td>

										<td>
											<div class="flex flex-col">
												<span class="font-medium">{u.name ?? "—"}</span>
												<span class="text-sm text-base-content/70">{u.email}</span>
												<span class="text-xs text-base-content/60">@{u.username}</span>
											</div>
										</td>

										<td>
											<span
												class={"badge " +
													(u.role === "ADMIN"
														? "badge-primary"
														: u.role === "MANAGER"
															? "badge-secondary"
															: "badge-ghost")}
											>
												{u.role}
											</span>
										</td>

										<td>
											<div class="flex flex-wrap gap-1">
												{#if u.projects?.length}
													{#each u.projects.slice(0, 4) as p (p.id)}
														<span class="badge badge-outline">{p.projectId} · {p.projectName}</span>
													{/each}
													{#if u.projects.length > 4}
														<span class="badge badge-ghost">+{u.projects.length - 4} more</span>
													{/if}
												{:else}
													<span class="text-sm text-base-content/50">—</span>
												{/if}
											</div>
										</td>

										<td>
											<div class="flex flex-wrap gap-1">
												{#if u.branches?.length}
													{#each u.branches.slice(0, 6) as b (b.id)}
														<span class="badge badge-outline">{b.code} · {b.name}</span>
													{/each}
													{#if u.branches.length > 6}
														<span class="badge badge-ghost">+{u.branches.length - 6} more</span>
													{/if}
												{:else}
													<span class="text-sm text-base-content/50">—</span>
												{/if}
											</div>
										</td>

										<td class="text-sm">{fmtDate(u.createdAt)}</td>
										<td class="text-sm">{fmtDate(u.updatedAt)}</td>

										<td class="text-right">
											<div class="join join-vertical sm:join-horizontal">
												<a class="btn btn-ghost btn-xs join-item" href={`/users/${u.id}`}>View</a>
												<a class="btn btn-ghost btn-xs join-item" href={`/users/${u.id}/edit`}>Edit</a>
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
						Showing {(page - 1) * data.query.pageSize + 1}–
						{Math.min(page * data.query.pageSize, data.query.total)} of {data.query.total}
					</div>

					<div class="join">
						<a class={"btn btn-sm join-item " + (page <= 1 ? "btn-disabled" : "")} href={buildUrl({ page: Math.max(1, page - 1) })}>
							Prev
						</a>
						<span class="btn btn-sm join-item btn-ghost pointer-events-none">
							Page {page} / {totalPages}
						</span>
						<a
							class={"btn btn-sm join-item " + (page >= totalPages ? "btn-disabled" : "")}
							href={buildUrl({ page: Math.min(totalPages, page + 1) })}
						>
							Next
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
