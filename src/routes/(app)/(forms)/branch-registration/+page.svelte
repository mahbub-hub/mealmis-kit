<script lang="ts">
	import { enhance } from "$app/forms";

	type Option = { id: number; name: string };

	// Loaded from +page.server.ts
	let { data, form } = $props<{
		data: {
			divisions: Option[];
			districtsByDivision: Record<number, Option[]>;
			upazillasByDistrict: Record<number, Option[]>;
			unionsByUpazilla: Record<number, Option[]>;
		};
		form?: {
			ok?: boolean;
			error?: string;
			fieldErrors?: Record<string, string>;
			values?: Record<string, string>;
		};
	}>();

	const state = $state({
		// Strings for inputs/selects (bind friendly)
		name: form?.values?.name ?? "",
		code: form?.values?.code ?? "",
		divisionId: Number(form?.values?.divisionId ?? data.divisions?.[0]?.id ?? 0),
		districtId: Number(form?.values?.districtId ?? 0),
		upazillaId: Number(form?.values?.upazillaId ?? 0),
		unionId: form?.values?.unionId ? Number(form.values.unionId) : 0, // 0 = none
		address: form?.values?.address ?? "",
		phone: form?.values?.phone ?? "",
		email: form?.values?.email ?? "",
		isActive: (form?.values?.isActive ?? "true") === "true",
		lat: form?.values?.lat ?? "",
		lng: form?.values?.lng ?? ""
	});

	// Derived options for cascading selects
	const districts = $derived(data.districtsByDivision[state.divisionId] ?? []);
	const upazillas = $derived(data.upazillasByDistrict[state.districtId] ?? []);
	const unions = $derived(data.unionsByUpazilla[state.upazillaId] ?? []);

	// Keep cascading values consistent
	$effect(() => {
		// when division changes, ensure district belongs to division
		const ds = districts;
		if (!ds.find((d: { id: number; }) => d.id === state.districtId)) {
			state.districtId = ds[0]?.id ?? 0;
		}
	});

	$effect(() => {
		// when district changes, ensure upazilla belongs to district
		const us = upazillas;
		if (!us.find((u: { id: number; }) => u.id === state.upazillaId)) {
			state.upazillaId = us[0]?.id ?? 0;
		}
	});

	$effect(() => {
		// when upazilla changes, union is optional; default to none
		const un = unions;
		if (state.unionId !== 0 && !un.find((x: { id: number; }) => x.id === state.unionId)) {
			state.unionId = 0;
		}
	});

	const fieldError = (key: string) => form?.fieldErrors?.[key];
</script>

<svelte:head>
	<title>Branch Registration</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<div class="mx-auto max-w-[1700px] px-3 py-5 sm:px-6 lg:px-8 2xl:px-10 2xl:py-8">
		<!-- Page header -->
		<div class="mb-5">
			<h1 class="text-xl font-semibold">Branch Registration</h1>
			<p class="text-sm text-base-content/60">Register and manage BRAC branches</p>
		</div>

		<!-- Card wrapper -->
		<div class="card bg-base-100 shadow-sm">
			<div class="card-body">
				<form method="POST" use:enhance class="space-y-6" action="?/create">
					<!-- Top alert area -->
					{#if form?.error}
						<div class="alert alert-error">
							<span>{form.error}</span>
						</div>
					{/if}
					{#if form?.ok}
						<div class="alert alert-success">
							<span>Branch created successfully.</span>
						</div>
					{/if}

					<!-- 12-col layout -->
					<div class="grid grid-cols-12 gap-4 2xl:gap-6">
						<!-- Branch Name -->
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">Branch Name</span></div>
							<input
								class={"input input-bordered w-full " + (fieldError("name") ? "input-error" : "")}
								name="name"
								placeholder="Enter branch name"
								bind:value={state.name}
								autocomplete="off"
							/>
							{#if fieldError("name")}
								<div class="label"><span class="label-text-alt text-error">{fieldError("name")}</span></div>
							{/if}
						</label>

						<!-- Branch Code -->
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">Branch Code</span></div>
							<input
								class={"input input-bordered w-full " + (fieldError("code") ? "input-error" : "")}
								name="code"
								placeholder="Enter branch code"
								bind:value={state.code}
								autocomplete="off"
							/>
							{#if fieldError("code")}
								<div class="label"><span class="label-text-alt text-error">{fieldError("code")}</span></div>
							{/if}
						</label>

						<!-- Division -->
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">Division</span></div>
							<select
								class={"select select-bordered w-full " + (fieldError("divisionId") ? "select-error" : "")}
								name="divisionId"
								bind:value={state.divisionId}
							>
								{#each data.divisions as d}
									<option value={d.id}>{d.name}</option>
								{/each}
							</select>
							{#if fieldError("divisionId")}
								<div class="label"><span class="label-text-alt text-error">{fieldError("divisionId")}</span></div>
							{/if}
						</label>

						<!-- District -->
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">District</span></div>
							<select
								class={"select select-bordered w-full " + (fieldError("districtId") ? "select-error" : "")}
								name="districtId"
								bind:value={state.districtId}
								disabled={districts.length === 0}
							>
								{#if districts.length === 0}
									<option value="0">Select district</option>
								{:else}
									{#each districts as d}
										<option value={d.id}>{d.name}</option>
									{/each}
								{/if}
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

						<!-- Union (optional) -->
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label">
								<span class="label-text">Union</span>
								<span class="label-text-alt text-base-content/50">(optional)</span>
							</div>
							<select class="select select-bordered w-full" name="unionId" bind:value={state.unionId} disabled={unions.length === 0}>
								<option value="0">Select union (optional)</option>
								{#each unions as u}
									<option value={u.id}>{u.name}</option>
								{/each}
							</select>
						</label>

						<!-- Phone -->
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">Phone</span></div>
							<input
								class={"input input-bordered w-full " + (fieldError("phone") ? "input-error" : "")}
								name="phone"
								placeholder="e.g. 01XXXXXXXXX"
								bind:value={state.phone}
								autocomplete="tel"
							/>
							{#if fieldError("phone")}
								<div class="label"><span class="label-text-alt text-error">{fieldError("phone")}</span></div>
							{/if}
						</label>

						<!-- Email -->
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">Email</span></div>
							<input
								class={"input input-bordered w-full " + (fieldError("email") ? "input-error" : "")}
								name="email"
								placeholder="e.g. branch@brac.net"
								bind:value={state.email}
								autocomplete="email"
							/>
							{#if fieldError("email")}
								<div class="label"><span class="label-text-alt text-error">{fieldError("email")}</span></div>
							{/if}
						</label>

						<!-- Latitude -->
						<label class="form-control col-span-12 xl:col-span-3">
							<div class="label"><span class="label-text">Latitude</span></div>
							<input class="input input-bordered w-full" name="lat" placeholder="e.g. 23.8103" bind:value={state.lat} />
						</label>

						<!-- Longitude -->
						<label class="form-control col-span-12 xl:col-span-3">
							<div class="label"><span class="label-text">Longitude</span></div>
							<input class="input input-bordered w-full" name="lng" placeholder="e.g. 90.4125" bind:value={state.lng} />
						</label>

						<!-- isActive -->
						<div class="col-span-12 xl:col-span-6">
							<div class="flex items-end justify-between gap-3 rounded-xl border border-base-200 bg-base-100 px-4 py-3">
								<div>
									<p class="text-sm font-medium">Branch Status</p>
									<p class="text-xs text-base-content/60">Set whether this branch is active in the system</p>
								</div>
								<label class="label cursor-pointer gap-3">
									<span class="label-text text-sm">Active</span>
									<input class="toggle toggle-primary" type="checkbox" bind:checked={state.isActive} />
									<!-- Send a deterministic value for actions -->
									<input type="hidden" name="isActive" value={state.isActive ? "true" : "false"} />
								</label>
							</div>
						</div>

						<!-- Address (full width) -->
						<label class="form-control col-span-12">
							<div class="label"><span class="label-text">Full Address</span></div>
							<!-- svelte-ignore element_invalid_self_closing_tag -->
							<textarea
								class={"textarea textarea-bordered w-full min-h-27.5 " + (fieldError("address") ? "textarea-error" : "")}
								name="address"
								placeholder="Enter detailed address"
								bind:value={state.address}
							/>
							{#if fieldError("address")}
								<div class="label"><span class="label-text-alt text-error">{fieldError("address")}</span></div>
							{/if}
						</label>

						<!-- Map card (full width) -->
						<div class="col-span-12">
							<div class="rounded-xl border border-base-200 bg-base-100">
								<div class="px-4 py-3 border-b border-base-200">
									<p class="text-sm font-semibold">Branch Location on Map</p>
									<p class="text-xs text-base-content/60">Map preview will update when latitude & longitude are provided</p>
								</div>

								<div class="p-4">
									<div class="grid place-items-center rounded-xl bg-base-200/60 h-[220px] sm:h-[260px] xl:h-[320px] 2xl:h-[360px]">
										{#if state.lat.trim() && state.lng.trim()}
											<div class="text-center">
												<p class="text-sm font-medium">Preview Coordinates</p>
												<p class="mt-1 text-sm text-base-content/60">
													Lat: <span class="font-mono">{state.lat}</span> · Lng: <span class="font-mono">{state.lng}</span>
												</p>
												<p class="mt-3 text-xs text-base-content/50">
													Replace this placeholder with Leaflet/Mapbox later.
												</p>
											</div>
										{:else}
											<p class="text-sm text-base-content/60">Map will be displayed here after entering coordinates</p>
										{/if}
									</div>
								</div>
							</div>
						</div>

						<!-- Actions -->
						<div class="col-span-12 flex items-center justify-end gap-2 pt-2">
							<a class="btn btn-ghost" href="/branch-view">Cancel</a>
							<button class="btn btn-primary" type="submit">Register Branch</button>
						</div>
					</div>
				</form>
			</div>
		</div>

		<div class="h-6"></div>
	</div>
</div>
