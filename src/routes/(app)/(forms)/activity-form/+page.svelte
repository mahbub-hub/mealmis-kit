<script lang="ts">
	type BranchOpt = { id: string; name: string };
	type ActivityOpt = { id: string; name: string };

	let { data, form } = $props<{
		data: {
			branches: BranchOpt[];
			activities: ActivityOpt[];
			programmes: string[];
		};
		form?: { success?: boolean; message?: string };
	}>();

	let month = $state(''); // YYYY-MM
	let programme = $state('');
	let district = $state('');
	let upazilla = $state('');
	let union = $state('');
	let branchId = $state('');
	let activityId = $state('');

	let totalAchievements = $state<number | ''>('');
	let male = $state<number | ''>('');
	let female = $state<number | ''>('');
	let others = $state<number | ''>('');
	let disableMale = $state<number | ''>('');
	let disableFemale = $state<number | ''>('');
	let disableOthers = $state<number | ''>('');

	const numVal = (v: number | '') => (v === '' ? '' : String(v));

	const setNum = (setter: (v: number | '') => void) => (e: Event) => {
		const v = (e.currentTarget as HTMLInputElement).value;
		setter(v === '' ? '' : Number(v));
	};

  const Programme = [
		'SELP',
		'TBCP',
		'MEP',
		'WASH',
		'Migration',
		'BEP',
		'BHP',
		'UPGP',
		'UDP',
		'DRMP',
		'SDP',
		'MF',
		'IDP',
		'CCP'
	] as const;


  </script>
	<!-- Header -->
	<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-semibold">Result Entry Form</h1>
			<p class="text-sm opacity-70">Enter monthly results by programme, location, branch and activity.</p>
		</div>

		<a class="btn btn-ghost btn-sm self-start sm:self-auto" href="/result-entry">Back to list</a>
	</div>

	{#if form?.message}
		<div class="alert alert-error mt-4"><span>{form.message}</span></div>
	{/if}
	{#if form?.success}
		<div class="alert alert-success mt-4"><span>Saved successfully.</span></div>
	{/if}

	<!-- Form Card -->
	<div class="card bg-base-100 shadow-sm mt-4">
		<div class="card-body">
			<form method="POST" action="?/create" class="grid gap-5">
				<!-- Primary info -->
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<label class="form-control">
						<div class="label"><span class="label-text">Month</span></div>
						<input class="input input-bordered" type="month" name="month" bind:value={month} required />
					</label>

					<label class="form-control">
						<div class="label"><span class="label-text">Programme</span></div>
						<select class="select select-bordered" name="programme" bind:value={programme} required>
							<option value="" disabled selected>Select programme</option>
							{#each Programme as p}
								<option value={p}>{p}</option>
							{/each}
						</select>
					</label>

					<label class="form-control sm:col-span-2 lg:col-span-1">
						<div class="label"><span class="label-text">Total Achievements</span></div>
						<input
							class="input input-bordered"
							name="totalAchievements"
							type="number"
							min="0"
							inputmode="numeric"
							value={numVal(totalAchievements)}
							oninput={setNum((v) => (totalAchievements = v))}
							required
						/>
					</label>
				</div>

				<!-- Location -->
				<div class="divider my-1">Location</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<label class="form-control">
						<div class="label"><span class="label-text">District</span></div>
						<input class="input input-bordered" name="district" bind:value={district} placeholder="District" required />
					</label>

					<label class="form-control">
						<div class="label"><span class="label-text">Upazilla</span></div>
						<input class="input input-bordered" name="upazilla" bind:value={upazilla} placeholder="Upazilla" required />
					</label>

					<label class="form-control">
						<div class="label"><span class="label-text">Union</span></div>
						<input class="input input-bordered" name="union" bind:value={union} placeholder="Union" required />
					</label>
				</div>

				<!-- Branch & Activity -->
				<div class="divider my-1">Branch & Activity</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<label class="form-control">
						<div class="label"><span class="label-text">Branch Name</span></div>
						<select class="select select-bordered" name="branchId" bind:value={branchId} required>
							<option value="" disabled selected>Select branch</option>
							{#each data.branches as b}
								<option value={b.id}>{b.name}</option>
							{/each}
						</select>
					</label>

					<label class="form-control">
						<div class="label"><span class="label-text">Activity</span></div>
						<select class="select select-bordered" name="activityId" bind:value={activityId} required>
							<option value="" disabled selected>Select activity</option>
							{#each data.activities as a}
								<option value={a.id}>{a.name}</option>
							{/each}
						</select>
					</label>
				</div>

				<!-- Collapsible Disaggregation -->
				<div class="divider my-1">Disaggregation</div>

				<div class="collapse collapse-arrow bg-base-200">
					<input type="checkbox" checked />
					<div class="collapse-title text-base font-semibold">Gender</div>
					<div class="collapse-content">
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<label class="form-control">
								<div class="label"><span class="label-text">Male</span></div>
								<input
									class="input input-bordered"
									name="male"
									type="number"
									min="0"
									inputmode="numeric"
									value={numVal(male)}
									oninput={setNum((v) => (male = v))}
								/>
							</label>

							<label class="form-control">
								<div class="label"><span class="label-text">Female</span></div>
								<input
									class="input input-bordered"
									name="female"
									type="number"
									min="0"
									inputmode="numeric"
									value={numVal(female)}
									oninput={setNum((v) => (female = v))}
								/>
							</label>

							<label class="form-control">
								<div class="label"><span class="label-text">Others</span></div>
								<input
									class="input input-bordered"
									name="others"
									type="number"
									min="0"
									inputmode="numeric"
									value={numVal(others)}
									oninput={setNum((v) => (others = v))}
								/>
							</label>
						</div>
					</div>
				</div>

				<div class="collapse collapse-arrow bg-base-200">
					<input type="checkbox" />
					<div class="collapse-title text-base font-semibold">Disability</div>
					<div class="collapse-content">
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<label class="form-control">
								<div class="label"><span class="label-text">Disable Male</span></div>
								<input
									class="input input-bordered"
									name="disableMale"
									type="number"
									min="0"
									inputmode="numeric"
									value={numVal(disableMale)}
									oninput={setNum((v) => (disableMale = v))}
								/>
							</label>

							<label class="form-control">
								<div class="label"><span class="label-text">Disable Female</span></div>
								<input
									class="input input-bordered"
									name="disableFemale"
									type="number"
									min="0"
									inputmode="numeric"
									value={numVal(disableFemale)}
									oninput={setNum((v) => (disableFemale = v))}
								/>
							</label>

							<label class="form-control">
								<div class="label"><span class="label-text">Disable Others</span></div>
								<input
									class="input input-bordered"
									name="disableOthers"
									type="number"
									min="0"
									inputmode="numeric"
									value={numVal(disableOthers)}
									oninput={setNum((v) => (disableOthers = v))}
								/>
							</label>
						</div>
					</div>
				</div>

				<!-- Sticky actions (mobile-friendly) -->
				<div class="sticky bottom-0 -mx-6 mt-2 bg-base-100 px-6 py-3 border-t border-base-200">
					<div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
						<button
							type="reset"
							class="btn btn-ghost"
							onclick={() => {
								month = '';
								programme = '';
								district = '';
								upazilla = '';
								union = '';
								branchId = '';
								activityId = '';
								totalAchievements = '';
								male = '';
								female = '';
								others = '';
								disableMale = '';
								disableFemale = '';
								disableOthers = '';
							}}
						>
							Clear
						</button>

						<button type="submit" class="btn btn-primary btn-block sm:btn-wide">Save</button>
					</div>
				</div>
			</form>

			<p class="mt-3 text-xs opacity-60">
				On mobile: sections collapse to reduce scrolling; action buttons stay visible at the bottom.
			</p>
		</div>
	</div>
