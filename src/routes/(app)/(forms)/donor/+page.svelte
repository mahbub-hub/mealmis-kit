<script lang="ts">
    import { enhance } from "$app/forms";

	type Donor = {
		id: number;
		donorName: string;
		donorType: string | null;
		country: string | null;
		description: string | null;
		isActive: boolean;
		createdAt: string;
	};

	let { data, form } = $props<{
		data: { donors: Donor[] };
		form?: { success?: boolean; message?: string };
	}>();

	// Form state (runes)
	let donorName = $state('');
	let donorType = $state('');
	let country = $state('');
	let description = $state('');
	let isActive = $state(true);

	const reset = () => {
		donorName = '';
		donorType = '';
		country = '';
		description = '';
		isActive = true;
	};
</script>

<div class="mx-auto max-w-6xl space-y-8">
	<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-semibold">Donor Entry</h1>
			<p class="text-sm opacity-70">Create and manage donors.</p>
		</div>
	</div>

	{#if form?.message}
		<div class="alert alert-error"><span>{form.message}</span></div>
	{/if}
	{#if form?.success}
		<div class="alert alert-success"><span>Donor saved successfully.</span></div>
	{/if}

	<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
		<!-- Form -->
		<div class="card bg-base-100 shadow lg:col-span-2">
			<div class="card-body">
				<form method="POST" action="?/create" use:enhance class="grid gap-4">
					<label class="form-control">
						<div class="label"><span class="label-text">Donor Name *</span></div>
						<input
							class="input input-bordered w-full"
							name="donorName"
							bind:value={donorName}
							placeholder="e.g., USAID, DFID, UNICEF"
							required
						/>
					</label>

					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<label class="form-control">
							<div class="label"><span class="label-text">Donor Type</span></div>
							<input class="input input-bordered" name="donorType" bind:value={donorType} placeholder="e.g., Government, NGO" />
						</label>

						<label class="form-control">
							<div class="label"><span class="label-text">Country</span></div>
							<input class="input input-bordered" name="country" bind:value={country} placeholder="e.g., Bangladesh" />
						</label>
					</div>

					<label class="form-control">
						<div class="label"><span class="label-text">Description</span></div>
						<textarea
							class="textarea textarea-bordered"
							name="description"
							rows="4"
							bind:value={description}
							placeholder="Short description about donor..."
						></textarea>
					</label>

					<label class="label cursor-pointer justify-start gap-3">
						<input class="toggle toggle-primary" type="checkbox" name="isActive" bind:checked={isActive} />
						<span class="label-text">Active</span>
					</label>

					<div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
						<button type="button" class="btn btn-ghost" onclick={reset}>Clear</button>
						<button type="submit" class="btn btn-primary btn-block sm:btn-wide">Save</button>
					</div>
				</form>
			</div>
		</div>

		
	</div>
    <!-- List -->
		<div class="card bg-base-100 shadow lg:col-span-3">
			<div class="card-body">
				<div class="flex items-center justify-between">
					<h2 class="card-title text-lg">Recent Donors</h2>
					<div class="badge badge-neutral">{data.donors.length}</div>
				</div>

				<div class="overflow-x-auto">
					<table class="table table-zebra">
						<thead>
							<tr>
								<th>Name</th>
								<th class="hidden md:table-cell">Type</th>
								<th class="hidden md:table-cell">Country</th>
								<th>Status</th>
								<th class="hidden lg:table-cell">Created</th>
							</tr>
						</thead>

						<tbody>
							{#if data.donors.length === 0}
								<tr>
									<td colspan="5" class="text-center opacity-70">No donors yet.</td>
								</tr>
							{:else}
								{#each data.donors as d (d.id)}
									<tr>
										<td class="font-medium">{d.donorName}</td>
										<td class="hidden md:table-cell">{d.donorType ?? '-'}</td>
										<td class="hidden md:table-cell">{d.country ?? '-'}</td>
										<td>
											{#if d.isActive}
												<span class="badge badge-success badge-sm">Active</span>
											{:else}
												<span class="badge badge-ghost badge-sm">Inactive</span>
											{/if}
										</td>
										<td class="hidden lg:table-cell text-sm opacity-70">
											{new Date(d.createdAt).toLocaleDateString()}
										</td>
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>
				</div>

				<p class="mt-2 text-xs opacity-60">
					Mobile tip: Type/Country/Created columns hide on small screens to keep it readable.
				</p>
			</div>
		</div>
</div>
