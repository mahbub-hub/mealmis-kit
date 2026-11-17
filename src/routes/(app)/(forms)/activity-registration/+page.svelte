<script lang="ts">
	import { enhance } from "$app/forms";

	type Option = { id: number; name: string };
	type IndicatorOption = { id: string; name: string };
	type ActivityStatus = "Pending" | "Ongoing" | "Completed" | "Cancelled";

	// Helpers
	function toInt(v: unknown, fallback = 0) {
		const n = Number(v);
		return Number.isFinite(n) ? n : fallback;
	}

	function prefix4(s: string) {
		return (s || "ACT").replace(/\s+/g, "").toUpperCase().slice(0, 4);
	}

	let { data, form } = $props<{
		data: {
			projects: { id: number; projectId: string; projectName: string; programme: string }[];
			branchesByProject: Record<number, Option[]>;

			// Optional geo sources to match UI (can be empty if you don’t want)
			divisions: Option[];
			districtsByDivision: Record<number, Option[]>;
			upazillasByDistrict: Record<number, Option[]>;

			indicators: IndicatorOption[];
		};
		form?: {
			ok?: boolean;
			error?: string;
			fieldErrors?: Record<string, string>;
			values?: Record<string, string>;
		};
	}>();

	// ---------- Form state ----------
	type ActivityFormState = {
		projectId: number;
		programme: string;

		activityName: string;

		// geo selection (UI-only helper)
		divisionId: number;
		districtIds: number[]; // multi
		upazillaIds: number[]; // multi

		branchId: number;

		indicatorIds: string[]; // connect many-to-many

		totalParticipants: string;
		male: string;
		female: string;
		others: string;

		disabledMale: string;
		disabledFemale: string;
		disabledOthers: string;

		status: ActivityStatus;
		startDate: string; // UI-only (optional)
		endDate: string; // UI-only (optional)

		remarks: string;
		isActive: boolean;
	};

	const firstProject = $derived(data.projects?.[0]?? "");

	function buildInitialState(): ActivityFormState {
		return {
			projectId: toInt(form?.values?.projectId, firstProject?.id ?? 0),
			programme: form?.values?.programme ?? firstProject?.programme ?? "",

			activityName: form?.values?.activityName ?? "",

			divisionId: toInt(form?.values?.divisionId, data.divisions?.[0]?.id ?? 0),
			districtIds: (form?.values?.districtIds ? JSON.parse(form.values.districtIds) : []) as number[],
			upazillaIds: (form?.values?.upazillaIds ? JSON.parse(form.values.upazillaIds) : []) as number[],

			branchId: toInt(form?.values?.branchId, 0),

			indicatorIds: (form?.values?.indicatorIds ? JSON.parse(form.values.indicatorIds) : []) as string[],

			totalParticipants: form?.values?.totalParticipants ?? "0",
			male: form?.values?.male ?? "0",
			female: form?.values?.female ?? "0",
			others: form?.values?.others ?? "0",

			disabledMale: form?.values?.disabledMale ?? "0",
			disabledFemale: form?.values?.disabledFemale ?? "0",
			disabledOthers: form?.values?.disabledOthers ?? "0",

			status: ((form?.values?.status as ActivityStatus) ?? "Pending") as ActivityStatus,
			startDate: form?.values?.startDate ?? "",
			endDate: form?.values?.endDate ?? "",

			remarks: form?.values?.remarks ?? "",
			isActive: (form?.values?.isActive ?? "true") === "true"
		};
	}

	const state = $state<ActivityFormState>(buildInitialState());

	// ---------- Derived lists ----------
	const selectedProject = $derived(data.projects.find((p: { id: number; }) => p.id === state.projectId));
	const branches = $derived<Option[]>(data.branchesByProject[state.projectId] ?? []);
	const districts = $derived<Option[]>(data.districtsByDivision[state.divisionId] ?? []);

	// For upazillas, union of selected districts
	const upazillas = $derived.by(() => {
		const all: Option[] = [];
		for (const did of state.districtIds) {
			const chunk = data.upazillasByDistrict[did] ?? [];
			for (const u of chunk) all.push(u);
		}
		// de-dupe by id
		const map = new Map<number, Option>();
		for (const u of all) map.set(u.id, u);
		return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
	});

	// Keep programme synced with project selection
	$effect(() => {
		state.programme = selectedProject?.programme ?? "";
	});

	// Keep branch selection valid when project changes
	$effect(() => {
		if (!branches.find((b) => b.id === state.branchId)) state.branchId = branches[0]?.id ?? 0;
	});

	// If district selection changes, clean up upazillaIds that are no longer available
	$effect(() => {
		const set = new Set(upazillas.map((u) => u.id));
		state.upazillaIds = state.upazillaIds.filter((id) => set.has(id));
	});

	// Activity code preview (server generates final)
	const activityCodePreview = $derived(
		`${prefix4(state.programme)}-${new Date().getFullYear()}-${String(state.projectId || 0).padStart(4, "0")}XX`
	);

	// Validation hints
	const fieldError = (k: string) => form?.fieldErrors?.[k];

	// Toggle helper for checkbox lists
	function toggleId<T extends number | string>(list: T[], id: T) {
		const s = new Set(list);
		if (s.has(id)) s.delete(id);
		else s.add(id);
		return [...s];
	}
</script>

<svelte:head>
	<title>Activity Registration</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<div class="mx-auto max-w-[1800px] px-3 py-5 sm:px-6 lg:px-8 2xl:px-10 2xl:py-8">
		<div class="mb-5">
			<h1 class="text-xl font-semibold">Activity Registration Form</h1>
			<p class="text-sm text-base-content/60">Register new activities for projects and track their progress</p>
		</div>

		<div class="card bg-base-100 shadow-sm">
			<div class="card-body">
				<form method="POST" action="?/create" use:enhance class="space-y-6">
					{#if form?.error}
						<div class="alert alert-error"><span>{form.error}</span></div>
					{/if}
					{#if form?.ok}
						<div class="alert alert-success"><span>Activity created successfully.</span></div>
					{/if}

					<!-- 12-col grid -->
					<div class="grid grid-cols-12 gap-4 2xl:gap-6">
						<!-- Project -->
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">Project</span></div>
							<select
								class={"select select-bordered w-full " + (fieldError("projectId") ? "select-error" : "")}
								name="projectId"
								bind:value={state.projectId}
							>
								{#each data.projects as p}
									<option value={p.id}>{p.projectId} · {p.projectName}</option>
								{/each}
							</select>
							{#if fieldError("projectId")}
								<div class="label"><span class="label-text-alt text-error">{fieldError("projectId")}</span></div>
							{/if}
						</label>

						<!-- Programme (read-only derived from project) -->
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">Programme</span></div>
							<input class="input input-bordered w-full bg-base-200/50" value={state.programme || "—"} readonly />
							<input type="hidden" name="programme" value={state.programme} />
						</label>

						<!-- Activity Code preview -->
						<div class="col-span-12 xl:col-span-6">
							<label class="form-control">
								<div class="label"><span class="label-text">Activity Code</span></div>
								<input class="input input-bordered w-full bg-base-200/50" value={activityCodePreview} readonly />
								<div class="label">
									<span class="label-text-alt text-base-content/50">Auto-generated (final code is generated on save)</span>
								</div>
							</label>
						</div>

						<!-- Activity name -->
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">Activity Name</span></div>
							<input
								class={"input input-bordered w-full " + (fieldError("activityName") ? "input-error" : "")}
								name="activityName"
								placeholder="Enter activity name"
								bind:value={state.activityName}
							/>
							{#if fieldError("activityName")}
								<div class="label"><span class="label-text-alt text-error">{fieldError("activityName")}</span></div>
							{/if}
						</label>

						<!-- Geographic Information section -->
						<div class="col-span-12">
							<div class="rounded-xl border border-base-200 bg-base-100">
								<div class="px-4 py-3 border-b border-base-200">
									<p class="text-sm font-semibold">Geographic Information</p>
								</div>

								<div class="p-4 grid grid-cols-12 gap-4">
									<!-- Division -->
									<label class="form-control col-span-12 xl:col-span-6">
										<div class="label"><span class="label-text">Division</span></div>
										<select class="select select-bordered w-full" bind:value={state.divisionId}>
											{#each data.divisions as d}
												<option value={d.id}>{d.name}</option>
											{/each}
										</select>
										<input type="hidden" name="divisionId" value={String(state.divisionId)} />
									</label>

									<!-- Districts multi -->
									<div class="col-span-12 xl:col-span-6">
										<div class="label"><span class="label-text">Districts (Multiple Selection)</span></div>
										<div class="rounded-xl border border-base-200 bg-base-100 p-3 max-h-45 overflow-auto">
											{#if districts.length === 0}
												<p class="text-sm text-base-content/60">No districts for this division.</p>
											{:else}
												<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
													{#each districts as d (d.id)}
														<label class="label cursor-pointer justify-start gap-3 py-1">
															<input
																type="checkbox"
																class="checkbox checkbox-sm"
																checked={state.districtIds.includes(d.id)}
																onchange={() => (state.districtIds = toggleId(state.districtIds, d.id))}
															/>
															<span class="label-text text-sm">{d.name}</span>
														</label>
													{/each}
												</div>
											{/if}
										</div>

										<!-- send array safely -->
										<input type="hidden" name="districtIds" value={JSON.stringify(state.districtIds)} />
									</div>

									<!-- Upazillas multi -->
									<div class="col-span-12">
										<div class="label"><span class="label-text">Upazillas (Multiple Selection)</span></div>
										<div class="rounded-xl border border-base-200 bg-base-100 p-3 max-h-55 overflow-auto">
											{#if upazillas.length === 0}
												<p class="text-sm text-base-content/60">Select one or more districts to see upazillas.</p>
											{:else}
												<!-- 3 columns on large screens like your screenshot -->
												<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
													{#each upazillas as u (u.id)}
														<label class="label cursor-pointer justify-start gap-3 py-1">
															<input
																type="checkbox"
																class="checkbox checkbox-sm"
																checked={state.upazillaIds.includes(u.id)}
																onchange={() => (state.upazillaIds = toggleId(state.upazillaIds, u.id))}
															/>
															<span class="label-text text-sm">{u.name}</span>
														</label>
													{/each}
												</div>
											{/if}
										</div>

										<input type="hidden" name="upazillaIds" value={JSON.stringify(state.upazillaIds)} />
									</div>

									<!-- Branch -->
									<label class="form-control col-span-12 xl:col-span-6">
										<div class="label"><span class="label-text">Branch</span></div>
										<select
											class={"select select-bordered w-full " + (fieldError("branchId") ? "select-error" : "")}
											name="branchId"
											bind:value={state.branchId}
											disabled={branches.length === 0}
										>
											{#if branches.length === 0}
												<option value="0">Select branch</option>
											{:else}
												{#each branches as b}
													<option value={b.id}>{b.name}</option>
												{/each}
											{/if}
										</select>
										{#if fieldError("branchId")}
											<div class="label"><span class="label-text-alt text-error">{fieldError("branchId")}</span></div>
										{/if}
									</label>

									<!-- Select indicators (multi) -->
									<div class="col-span-12 xl:col-span-6">
										<div class="label"><span class="label-text">Select Indicator</span></div>
										<div class="rounded-xl border border-base-200 bg-base-100 p-3 max-h-45 overflow-auto">
											<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
												{#each data.indicators as ind (ind.id)}
													<label class="label cursor-pointer justify-start gap-3 py-1">
														<input
															type="checkbox"
															class="checkbox checkbox-sm"
															checked={state.indicatorIds.includes(ind.id)}
															onchange={() => (state.indicatorIds = toggleId(state.indicatorIds, ind.id))}
														/>
														<span class="label-text text-sm">{ind.name}</span>
													</label>
												{/each}
											</div>
										</div>
										<input type="hidden" name="indicatorIds" value={JSON.stringify(state.indicatorIds)} />
									</div>
								</div>
							</div>
						</div>

						<!-- Participant Targets / Counts -->
						<div class="col-span-12">
							<div class="rounded-xl border border-base-200 bg-base-100">
								<div class="px-4 py-3 border-b border-base-200">
									<p class="text-sm font-semibold">Participants</p>
									<p class="text-xs text-base-content/60">Enter planned/recorded participant counts</p>
								</div>

								<div class="p-4 grid grid-cols-12 gap-4">
									<label class="form-control col-span-12 xl:col-span-4">
										<div class="label"><span class="label-text">Total Participants</span></div>
										<input class="input input-bordered w-full" name="totalParticipants" inputmode="numeric" bind:value={state.totalParticipants} />
									</label>

									<label class="form-control col-span-12 xl:col-span-4">
										<div class="label"><span class="label-text">Male</span></div>
										<input class="input input-bordered w-full" name="male" inputmode="numeric" bind:value={state.male} />
									</label>

									<label class="form-control col-span-12 xl:col-span-4">
										<div class="label"><span class="label-text">Female</span></div>
										<input class="input input-bordered w-full" name="female" inputmode="numeric" bind:value={state.female} />
									</label>

									<label class="form-control col-span-12 xl:col-span-4">
										<div class="label"><span class="label-text">Others</span></div>
										<input class="input input-bordered w-full" name="others" inputmode="numeric" bind:value={state.others} />
									</label>

									<label class="form-control col-span-12 xl:col-span-4">
										<div class="label"><span class="label-text">Disabled Male</span></div>
										<input class="input input-bordered w-full" name="disabledMale" inputmode="numeric" bind:value={state.disabledMale} />
									</label>

									<label class="form-control col-span-12 xl:col-span-4">
										<div class="label"><span class="label-text">Disabled Female</span></div>
										<input class="input input-bordered w-full" name="disabledFemale" inputmode="numeric" bind:value={state.disabledFemale} />
									</label>

									<label class="form-control col-span-12 xl:col-span-4">
										<div class="label"><span class="label-text">Disabled Others</span></div>
										<input class="input input-bordered w-full" name="disabledOthers" inputmode="numeric" bind:value={state.disabledOthers} />
									</label>
								</div>
							</div>
						</div>

						<!-- Status + Dates -->
						<label class="form-control col-span-12 xl:col-span-4">
							<div class="label"><span class="label-text">Status</span></div>
							<select class="select select-bordered w-full" name="status" bind:value={state.status}>
								<option value="Pending">Pending</option>
								<option value="Ongoing">Ongoing</option>
								<option value="Completed">Completed</option>
								<option value="Cancelled">Cancelled</option>
							</select>
						</label>

						<label class="form-control col-span-12 xl:col-span-4">
							<div class="label"><span class="label-text">Start Date</span></div>
							<input class="input input-bordered w-full" type="date" name="startDate" bind:value={state.startDate} />
						</label>

						<label class="form-control col-span-12 xl:col-span-4">
							<div class="label"><span class="label-text">End Date</span></div>
							<input class="input input-bordered w-full" type="date" name="endDate" bind:value={state.endDate} />
						</label>

						<!-- Remarks -->
						<label class="form-control col-span-12">
							<div class="label"><span class="label-text">Description / Remarks</span></div>
							<textarea class="textarea textarea-bordered w-full min-h-30" name="remarks" placeholder="Enter activity description" bind:value={state.remarks}></textarea>
						</label>

						<!-- Active toggle -->
						<div class="col-span-12">
							<div class="flex items-end justify-between gap-3 rounded-xl border border-base-200 bg-base-100 px-4 py-3">
								<div>
									<p class="text-sm font-medium">Activity Active</p>
									<p class="text-xs text-base-content/60">Controls whether the activity is active in the system</p>
								</div>
								<label class="label cursor-pointer gap-3">
									<span class="label-text text-sm">Active</span>
									<input class="toggle toggle-primary" type="checkbox" bind:checked={state.isActive} />
									<input type="hidden" name="isActive" value={state.isActive ? "true" : "false"} />
								</label>
							</div>
						</div>

						<!-- Actions -->
						<div class="col-span-12 flex items-center justify-end gap-2 pt-2">
							<a class="btn btn-ghost" href="/activities">Cancel</a>
							<button class="btn btn-primary" type="submit">Create Activity</button>
						</div>
					</div>
				</form>

				<!-- Small helper note -->
				<p class="mt-4 text-xs text-base-content/50">
					Geo selections are UI helpers. The Activity is saved using projectId + branchId, and geography can be resolved via Branch relations.
				</p>
			</div>
		</div>

		<div class="h-6"></div>
	</div>
</div>
