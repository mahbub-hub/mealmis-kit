<script lang="ts">
	import { enhance } from "$app/forms";
    import type { PageProps } from './$types'

	type Option = { id: number; name: string };
	type Programme = string;
    let {data, form } : PageProps = $props()
	
	function toInt(v: unknown, fallback = 0) {
		const n = Number(v);
		return Number.isFinite(n) ? n : fallback;
	}

	type State = {
		month: string;
		programme: string;

		divisionId: number;
		districtId: number;
		upazillaId: number;

		branchId: number;
		activityId: string;

		total: string;
		male: string;
		female: string;
		others: string;

		disabledMale: string;
		disabledFemale: string;
		disabledOthers: string;

		remarks: string;
	};

	function buildInitialState(): State {
		return {
			month: form?.values?.month ?? "",
			programme: form?.values?.programme ?? "",

			divisionId: toInt(form?.values?.divisionId, data.divisions?.[0]?.id ?? 0),
			districtId: toInt(form?.values?.districtId, 0),
			upazillaId: toInt(form?.values?.upazillaId, 0),

			branchId: toInt(form?.values?.branchId, 0),
			activityId: form?.values?.activityId ?? "",

			total: form?.values?.total ?? "0",
			male: form?.values?.male ?? "0",
			female: form?.values?.female ?? "0",
			others: form?.values?.others ?? "0",

			disabledMale: form?.values?.disabledMale ?? "0",
			disabledFemale: form?.values?.disabledFemale ?? "0",
			disabledOthers: form?.values?.disabledOthers ?? "0",

			remarks: form?.values?.remarks ?? ""
		};
	}

	const formState = $state(buildInitialState());

	const districts = $derived(data.districtsByDivision[formState.divisionId] ?? []);
	const upazillas = $derived(data.upazillasByDistrict[formState.districtId] ?? []);
	const branches = $derived(data.branchesByUpazilla[formState.upazillaId] ?? []);
	const activities = $derived(data.activitiesByBranch[formState.branchId] ?? []);

	// Ensure cascades remain valid as parent changes
	$effect(() => {
		if (!districts.some((d) => d.id === formState.districtId)) formState.districtId = districts[0]?.id ?? 0;
	});
	$effect(() => {
		if (!upazillas.some((u) => u.id === formState.upazillaId)) formState.upazillaId = upazillas[0]?.id ?? 0;
	});
	$effect(() => {
		if (!branches.some((b) => b.id === formState.branchId)) formState.branchId = branches[0]?.id ?? 0;
	});
	$effect(() => {
		if (!activities.some((a) => a.id === formState.activityId)) formState.activityId = activities[0]?.id ?? "";
	});

	const fieldError = (k: string) => (form && "fieldErrors" in form ? form.fieldErrors?.[k] : undefined);

	// Optional: auto total = male+female+others
	const autoTotal: boolean = $state(false);
	$effect(() => {
		if (!autoTotal) return;
		formState.total = String(toInt(formState.male) + toInt(formState.female) + toInt(formState.others));
	});
</script>

<svelte:head>
	<title>Activity Achievement</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<div class="mx-auto max-w-[1800px] px-3 py-5 sm:px-6 lg:px-8 2xl:px-10 2xl:py-8">
		<div class="mb-5">
			<h1 class="text-xl font-semibold">Activity Achievement Form</h1>
			<p class="text-sm text-base-content/60">Record achievement results by programme and activity</p>
		</div>

		<div class="card bg-base-100 shadow-sm">
			<div class="card-body">
				<form method="POST" action="?/save" use:enhance class="space-y-6">
					{#if form?.fieldErrors}
						<div class="alert alert-error"><span>{form.fieldErrors}</span></div>
					{/if}
					{#if form?.ok}
						<div class="alert alert-success"><span>Achievement saved successfully.</span></div>
					{/if}

					<!-- Filters / Selects -->
					<div class="grid grid-cols-12 gap-4 2xl:gap-6">
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">Month</span></div>
							<select class={"select select-bordered w-full " + (fieldError("month") ? "select-error" : "")} name="month" bind:value={formState.month}>
								<option value="" disabled selected>Select month</option>
								{#each data.months as m}
									<option value={m.value}>{m.label}</option>
								{/each}
							</select>
							{#if fieldError("month")}
								<div class="label"><span class="label-text-alt text-error">{fieldError("month")}</span></div>
							{/if}
						</label>

						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">Programme</span></div>
							<select class={"select select-bordered w-full " + (fieldError("programme") ? "select-error" : "")} name="programme" bind:value={formState.programme}>
								<option value="" disabled selected>Select programme</option>
								{#each data.programmes as p}
									<option value={p}>{p}</option>
								{/each}
							</select>
							{#if fieldError("programme")}
								<div class="label"><span class="label-text-alt text-error">{fieldError("programme")}</span></div>
							{/if}
						</label>

						<label class="form-control col-span-12 md:col-span-6 xl:col-span-3">
							<div class="label"><span class="label-text">Division</span></div>
							<select class="select select-bordered w-full" name="divisionId" bind:value={formState.divisionId}>
								{#each data.divisions as d}
									<option value={d.id}>{d.name}</option>
								{/each}
							</select>
						</label>

						<label class="form-control col-span-12 md:col-span-6 xl:col-span-3">
							<div class="label"><span class="label-text">District</span></div>
							<select class="select select-bordered w-full" name="districtId" bind:value={formState.districtId} disabled={districts.length === 0}>
								{#if districts.length === 0}
									<option value="0">Select district</option>
								{:else}
									{#each districts as d}
										<option value={d.id}>{d.name}</option>
									{/each}
								{/if}
							</select>
						</label>

						<label class="form-control col-span-12 md:col-span-6 xl:col-span-3">
							<div class="label"><span class="label-text">Upazilla</span></div>
							<select class="select select-bordered w-full" name="upazillaId" bind:value={formState.upazillaId} disabled={upazillas.length === 0}>
								{#if upazillas.length === 0}
									<option value="0">Select upazilla</option>
								{:else}
									{#each upazillas as u}
										<option value={u.id}>{u.name}</option>
									{/each}
								{/if}
							</select>
						</label>

						<!-- Screenshot shows "Union" as text -->
						<label class="form-control col-span-12 md:col-span-6 xl:col-span-3">
							<div class="label"><span class="label-text">Union</span></div>
							<input class="input input-bordered w-full" placeholder="Enter union" disabled value="(optional)" />
							<p class="mt-1 text-[11px] text-base-content/50">
								Union is not part of ActivityAchievement schema. Add unionId if you need to save it.
							</p>
						</label>

						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">Branch Name</span></div>
							<select class={"select select-bordered w-full " + (fieldError("branchId") ? "select-error" : "")} name="branchId" bind:value={formState.branchId} disabled={branches.length === 0}>
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

						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">Activity</span></div>
							<select class={"select select-bordered w-full " + (fieldError("activityId") ? "select-error" : "")} name="activityId" bind:value={formState.activityId} disabled={activities.length === 0}>
								{#if activities.length === 0}
									<option value="" selected>Select activity</option>
								{:else}
									{#each activities as a}
										<option value={a.id}>{a.activityName}</option>
									{/each}
								{/if}
							</select>
							{#if fieldError("activityId")}
								<div class="label"><span class="label-text-alt text-error">{fieldError("activityId")}</span></div>
							{/if}
						</label>
					</div>

					<!-- Achievement Data -->
					<div class="rounded-xl border border-base-200 bg-base-100">
						<div class="px-4 py-3 border-b border-base-200">
							<p class="text-sm font-semibold">Achievement Data</p>
						</div>

						<div class="p-4 space-y-5">
							<div class="grid grid-cols-12 gap-4">
								<label class="form-control col-span-12 xl:col-span-4">
									<div class="label"><span class="label-text">Total Achievements</span></div>
									<input class={"input input-bordered w-full " + (fieldError("total") ? "input-error" : "")} name="total" inputmode="numeric" bind:value={formState.total} />
									{#if fieldError("total")}
										<div class="label"><span class="label-text-alt text-error">{fieldError("total")}</span></div>
									{/if}
								</label>

								<div class="col-span-12 xl:col-span-8 flex items-end">
									<label class="label cursor-pointer gap-3">
										<input type="checkbox" class="checkbox checkbox-sm"/>
										<span class="label-text text-sm">Auto-calc total = male + female + others</span>
									</label>
								</div>
							</div>

							<div class="rounded-xl bg-base-200/40 border border-base-200">
								<div class="px-4 py-3 border-b border-base-200">
									<p class="text-sm font-semibold">Gender Breakdown</p>
								</div>
								<div class="p-4 grid grid-cols-12 gap-4">
									<label class="form-control col-span-12 md:col-span-4">
										<div class="label"><span class="label-text">Male</span></div>
										<input class="input input-bordered w-full" name="male" inputmode="numeric" bind:value={formState.male} />
									</label>
									<label class="form-control col-span-12 md:col-span-4">
										<div class="label"><span class="label-text">Female</span></div>
										<input class="input input-bordered w-full" name="female" inputmode="numeric" bind:value={formState.female} />
									</label>
									<label class="form-control col-span-12 md:col-span-4">
										<div class="label"><span class="label-text">Others</span></div>
										<input class="input input-bordered w-full" name="others" inputmode="numeric" bind:value={formState.others} />
									</label>
								</div>
							</div>

							<div class="rounded-xl bg-base-200/40 border border-base-200">
								<div class="px-4 py-3 border-b border-base-200">
									<p class="text-sm font-semibold">Disability Breakdown</p>
								</div>
								<div class="p-4 grid grid-cols-12 gap-4">
									<label class="form-control col-span-12 md:col-span-4">
										<div class="label"><span class="label-text">Disable Male</span></div>
										<input class="input input-bordered w-full" name="disabledMale" inputmode="numeric" bind:value={formState.disabledMale} />
									</label>
									<label class="form-control col-span-12 md:col-span-4">
										<div class="label"><span class="label-text">Disable Female</span></div>
										<input class="input input-bordered w-full" name="disabledFemale" inputmode="numeric" bind:value={formState.disabledFemale} />
									</label>
									<label class="form-control col-span-12 md:col-span-4">
										<div class="label"><span class="label-text">Disable Others</span></div>
										<input class="input input-bordered w-full" name="disabledOthers" inputmode="numeric" bind:value={formState.disabledOthers} />
									</label>
								</div>
							</div>

							<label class="form-control">
								<div class="label"><span class="label-text">Notes and Observations</span></div>
								<textarea class="textarea textarea-bordered w-full min-h-30" name="remarks" placeholder="Enter any additional notes or observations" bind:value={formState.remarks} ></textarea>
							</label>
						</div>
					</div>

					<div class="flex items-center justify-end gap-2">
						<a class="btn btn-ghost" href="/activity-view">Cancel</a>
						<button class="btn btn-primary" type="submit">Submit Results</button>
					</div>
				</form>

				<p class="mt-4 text-xs text-base-content/50">
					Saves by unique key: month + activity + branch (upsert). Existing record will be updated.
				</p>
			</div>
		</div>
	</div>
</div>
