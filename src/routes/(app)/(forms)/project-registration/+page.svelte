<script lang="ts">
	import { enhance } from "$app/forms";
    import type { PageProps } from "./$types";

	type Status = "ACTIVE" | "COMPLETED" | "DROPOUT" | "SUSPENDED" | "TRANSFERRED";
    
    let { data, form } : PageProps = $props();     
	
	let state = $state({
	projectName: "",
	projectType: "",
	projectDuration: "",
	programme: data.programmes?.[0] ?? "",
	donorId: data.donors?.[0]?.id ?? 0,

	districtId: data.districts?.[0]?.id ?? 0,
	upazillaId: 0,
	branchId: 0,

	budget: "0",
	currency: "BDT",
	status: "ACTIVE" as Status,
	isActive: true,

	totalTarget: "0",
	targetMale: "0",
	targetFemale: "0",
	targetOther: "0",
	targetDisabled: "0",

	startDate: "",
	endDate: "",

	discription: "",
	objectives: ""
	})

	// Cascading option sets
	const upazillas = $derived(data.upazillasByDistrict[state.districtId] ?? []);
	const branches = $derived(data.branchesByUpazilla[state.upazillaId] ?? []);

	// Keep cascade selections valid
	$effect(() => {
		const us = upazillas;
		if (!us.find((u: { id: number; }) => u.id === state.upazillaId)) state.upazillaId = us[0]?.id ?? 0;
	});
	$effect(() => {
		const bs = branches;
		if (!bs.find((b: { id: number; }) => b.id === state.branchId)) state.branchId = bs[0]?.id ?? 0;
	});

	// Derived: client preview Project ID (server still generates authoritative one)
	function progPrefix(p: string) {
	return (p || "PRG").replace(/\s+/g, "").toUpperCase().slice(0, 4);
}

const projectIdPreview = $derived(
	`${progPrefix(state.programme)}-${new Date().getFullYear()}-${String(state.districtId || 0).padStart(2, "0")}`
);

	const fieldError = (k: string) =>
		form && "fieldErrors" in form ? (form.fieldErrors as Record<string, string> | undefined)?.[k] : undefined;
    
</script>

<svelte:head>
	<title>Project Registration Form</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<div class="mx-auto max-w-450 px-3 py-5 sm:px-6 lg:px-8 2xl:px-10 2xl:py-8">
		<!-- Header -->
		<div class="mb-5">
			<h1 class="text-xl font-semibold">Project Registration Form</h1>
			<p class="text-sm text-base-content/60">Create and manage projects</p>
		</div>

		<div class="card bg-base-100 shadow-sm">
			<div class="card-body">
				<form method="POST" action="?/create" use:enhance class="space-y-6">
					{#if form?.error}
						<div class="alert alert-error"><span>{form.error}</span></div>
					{/if}
					{#if form?.ok}
						<div class="alert alert-success"><span>Project saved successfully.</span></div>
					{/if}

					<!-- 12-col large-screen layout -->
					<div class="grid grid-cols-12 gap-4 2xl:gap-6">
						<!-- Project ID (read-only display) -->
						<div class="col-span-12 xl:col-span-6">
							<label class="form-control">
								<div class="label"><span class="label-text">Project ID</span></div>
								<input class="input input-bordered w-full bg-base-200/50" value={projectIdPreview} readonly />
								<div class="label">
									<span class="label-text-alt text-base-content/50">Auto-generated from programme selection</span>
								</div>
							</label>
						</div>

						<!-- Project Name -->
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">Project Name</span></div>
							<input
								class={"input input-bordered w-full " + (fieldError("projectName") ? "input-error" : "")}
								name="projectName"
								placeholder="Enter project name"
								bind:value={state.projectName}
							/>
							{#if fieldError("projectName")}
								<div class="label"><span class="label-text-alt text-error">{fieldError("projectName")}</span></div>
							{/if}
						</label>

						<!-- Programme -->
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">Programme</span></div>
							<select
								class={"select select-bordered w-full " + (fieldError("programme") ? "select-error" : "")}
								name="programme"
								bind:value={state.programme}
							>
								{#each data.programmes as p}
									<option value={p}>{p}</option>
								{/each}
							</select>
							{#if fieldError("programme")}
								<div class="label"><span class="label-text-alt text-error">{fieldError("programme")}</span></div>
							{/if}
						</label>

						<!-- Donor -->
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">Name of the Donor</span></div>
							<select
								class={"select select-bordered w-full " + (fieldError("donorId") ? "select-error" : "")}
								name="donorId"
								bind:value={state.donorId}
							>
								{#each data.donors as d}
									<option value={d.id}>{d.donorName}</option>
								{/each}
							</select>
							{#if fieldError("donorId")}
								<div class="label"><span class="label-text-alt text-error">{fieldError("donorId")}</span></div>
							{/if}
						</label>

						<!-- District -->
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">District</span></div>
							<select
								class={"select select-bordered w-full " + (fieldError("districtId") ? "select-error" : "")}
								name="districtId"
								bind:value={state.districtId}
							>
								{#each data.districts as d}
									<option value={d.id}>{d.name}</option>
								{/each}
							</select>
							{#if fieldError("districtId")}
								<div class="label"><span class="label-text-alt text-error">{fieldError("districtId")}</span></div>
							{/if}
						</label>

						<!-- Upazilla -->
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">Upazilla</span></div>
							<select
								class={"select select-bordered w-full " + (fieldError("upazillaId") ? "select-error" : "")}
								name="upazillaId"
								bind:value={state.upazillaId}
								disabled={upazillas.length === 0}
							>
								{#if upazillas.length === 0}
									<option value="0">Select upazilla</option>
								{:else}
									{#each upazillas as u}
										<option value={u.id}>{u.name}</option>
									{/each}
								{/if}
							</select>
							{#if fieldError("upazillaId")}
								<div class="label"><span class="label-text-alt text-error">{fieldError("upazillaId")}</span></div>
							{/if}
						</label>

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

						<!-- Project Type -->
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">Project Type</span></div>
							<input
								class="input input-bordered w-full"
								name="projectType"
								placeholder="Enter project type"
								bind:value={state.projectType}
							/>
						</label>

						<!-- Status -->
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">Status</span></div>
							<select class="select select-bordered w-full" name="status" bind:value={state.status}>
								<option value="ACTIVE">Active</option>
								<option value="COMPLETED">Completed</option>
								<option value="DROPOUT">Dropout</option>
								<option value="SUSPENDED">Suspended</option>
								<option value="TRANSFERRED">Transferred</option>
							</select>
						</label>

						<input type="hidden" name="currency" value={state.currency} />

						<!-- Financial + Duration + Status row -->
						<label class="form-control col-span-12 xl:col-span-4">
							<div class="label"><span class="label-text">Total Budget (BDT)</span></div>
							<input
								class={"input input-bordered w-full " + (fieldError("budget") ? "input-error" : "")}
								name="budget"
								inputmode="decimal"
								placeholder="0"
								bind:value={state.budget}
							/>
							{#if fieldError("budget")}
								<div class="label"><span class="label-text-alt text-error">{fieldError("budget")}</span></div>
							{/if}
						</label>

						<label class="form-control col-span-12 xl:col-span-4">
							<div class="label"><span class="label-text">Project Duration (Months)</span></div>
							<input
								class={"input input-bordered w-full " + (fieldError("projectDuration") ? "input-error" : "")}
								name="projectDuration"
								inputmode="numeric"
								placeholder="0"
								bind:value={state.projectDuration}
							/>
							{#if fieldError("projectDuration")}
								<div class="label"><span class="label-text-alt text-error">{fieldError("projectDuration")}</span></div>
							{/if}
						</label>

						
						<!-- Targets row -->
						<label class="form-control col-span-12 xl:col-span-4">
							<div class="label"><span class="label-text">Total Targeted Beneficiary</span></div>
							<input class="input input-bordered w-full" name="totalTarget" inputmode="numeric" bind:value={state.totalTarget} />
						</label>

						<label class="form-control col-span-12 xl:col-span-4">
							<div class="label"><span class="label-text">Male Targeted</span></div>
							<input class="input input-bordered w-full" name="targetMale" inputmode="numeric" bind:value={state.targetMale} />
						</label>

						<label class="form-control col-span-12 xl:col-span-4">
							<div class="label"><span class="label-text">Female Targeted</span></div>
							<input class="input input-bordered w-full" name="targetFemale" inputmode="numeric" bind:value={state.targetFemale} />
						</label>

						<label class="form-control col-span-12 xl:col-span-4">
							<div class="label"><span class="label-text">Other Targeted</span></div>
							<input class="input input-bordered w-full" name="targetOther" inputmode="numeric" bind:value={state.targetOther} />
						</label>

						<label class="form-control col-span-12 xl:col-span-4">
							<div class="label"><span class="label-text">Disabled Targeted</span></div>
							<input class="input input-bordered w-full" name="targetDisabled" inputmode="numeric" bind:value={state.targetDisabled} />
						</label>

					<div class="col-span-12 xl:col-span-8">
							<div class="flex items-end justify-between gap-3 rounded-xl border border-base-200 bg-base-100 px-4 py-3">
								<div>
									<p class="text-sm font-medium">Project Active</p>
									<p class="text-xs text-base-content/60">Controls whether the project is active in the system</p>
								</div>
								<label class="label cursor-pointer gap-3">
									<span class="label-text text-sm">Active</span>
									<input class="toggle toggle-primary" type="checkbox" bind:checked={state.isActive} />
									<input type="hidden" name="isActive" value={state.isActive ? "true" : "false"} />
								</label>
							</div>
						</div>

						<!-- Dates -->
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">Start Date</span></div>
							<input
								class={"input input-bordered w-full " + (fieldError("startDate") ? "input-error" : "")}
								name="startDate"
								type="date"
								bind:value={state.startDate}
							/>
							{#if fieldError("startDate")}
								<div class="label"><span class="label-text-alt text-error">{fieldError("startDate")}</span></div>
							{/if}
						</label>

						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">End Date</span></div>
							<input
								class={"input input-bordered w-full " + (fieldError("endDate") ? "input-error" : "")}
								name="endDate"
								type="date"
								bind:value={state.endDate}
							/>
							{#if fieldError("endDate")}
								<div class="label"><span class="label-text-alt text-error">{fieldError("endDate")}</span></div>
							{/if}
						</label>

						<!-- Description -->
						<label class="form-control col-span-12">
							<div class="label"><span class="label-text">Project Description</span></div>
							<!-- svelte-ignore element_invalid_self_closing_tag -->
							<textarea class="textarea textarea-bordered w-full min-h-[120px]" name="discription" bind:value={state.discription} />
						</label>

						<!-- Objectives -->
						<label class="form-control col-span-12">
							<div class="label"><span class="label-text">Objectives</span></div>
							<!-- svelte-ignore element_invalid_self_closing_tag -->
							<textarea class="textarea textarea-bordered w-full min-h-[120px]" name="objectives" bind:value={state.objectives} />
						</label>

						<!-- Actions -->
						<div class="col-span-12 flex items-center justify-end gap-2 pt-2">
							<a class="btn btn-ghost" href="/project-view">Cancel</a>
							<button class="btn btn-primary" type="submit">Save Project</button>
						</div>
					</div>
				</form>
			</div>
		</div>

		<div class="h-6"></div>
	</div>
</div>
