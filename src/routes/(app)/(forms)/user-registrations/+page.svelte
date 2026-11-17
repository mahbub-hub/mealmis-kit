<script lang="ts">
	import { enhance } from "$app/forms";

	type UserRole = "USER" | "ADMIN" | "MANAGER";
	type Option = { id: number; name: string };

	type UserFormState = {
		email: string;
		username: string;
		name: string;
		role: UserRole;

		password: string;
		confirmPassword: string;

		projectIds: number[];
		branchIds: number[];
	};

	type FormValues = {
		email: string;
		username: string;
		name: string;
		role: string;
		password: string;
		confirmPassword: string;
		projectIds: string;
		branchIds: string;
	};

	type FormPayload = {
		ok?: boolean;
		error?: string;
		fieldErrors?: Record<string, string>;
		values?: Partial<FormValues>;
	};

	let { data, form } = $props<{
		data: {
			roles: UserRole[];
			projects: Option[];
			branches: Option[];
		};
		form?: FormPayload;
	}>();

	function toInt(v: unknown) {
		const n = Number(v);
		return Number.isFinite(n) ? n : 0;
	}

	function parseIdsFromFormJson(key: keyof FormValues) {
		try {
			const raw = form?.values?.[key];
			if (!raw) return [];
			const parsed = JSON.parse(raw);
			if (!Array.isArray(parsed)) return [];
			return parsed.map((x) => toInt(x)).filter((x) => x > 0);
		} catch {
			return [];
		}
	}

	function buildInitialState(): UserFormState {
		return {
			email: "",
			username: "",
			name: "",
			role: data.roles?.[0] ?? "USER",

			password: "",
			confirmPassword: "",

			projectIds: parseIdsFromFormJson("projectIds"),
			branchIds: parseIdsFromFormJson("branchIds")
		};
	}

	const state = $state<UserFormState>(buildInitialState());

	const fieldError = (k: string) => form?.fieldErrors?.[k];

	function toggleId(list: number[], id: number) {
		const s = new Set(list);
		if (s.has(id)) s.delete(id);
		else s.add(id);
		return [...s];
	}
</script>

<svelte:head>
	<title>User Registration</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<div class="mx-auto max-w-[1800px] px-3 py-5 sm:px-6 lg:px-8 2xl:px-10 2xl:py-8">
		<!-- Header -->
		<div class="mb-5">
			<h1 class="text-xl font-semibold">User Registration</h1>
			<p class="text-sm text-base-content/60">Create a user and assign projects/branches</p>
		</div>

		<div class="card bg-base-100 shadow-sm">
			<div class="card-body">
				<form method="POST" action="?/create" use:enhance class="space-y-6">
					{#if form?.error}
						<div class="alert alert-error"><span>{form.error}</span></div>
					{/if}
					{#if form?.ok}
						<div class="alert alert-success"><span>User created successfully.</span></div>
					{/if}

					<!-- 12-col layout -->
					<div class="grid grid-cols-12 gap-4 2xl:gap-6">
						<!-- Email -->
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">Email</span></div>
							<input
								class={"input input-bordered w-full " + (fieldError("email") ? "input-error" : "")}
								name="email"
								type="email"
								placeholder="user@brac.net"
								bind:value={state.email}
								autocomplete="email"
							/>
							{#if fieldError("email")}
								<div class="label"><span class="label-text-alt text-error">{fieldError("email")}</span></div>
							{/if}
						</label>

						<!-- Username -->
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">Username</span></div>
							<input
								class={"input input-bordered w-full " + (fieldError("username") ? "input-error" : "")}
								name="username"
								placeholder="e.g. mahbubur.rah"
								bind:value={state.username}
								autocomplete="username"
							/>
							{#if fieldError("username")}
								<div class="label"><span class="label-text-alt text-error">{fieldError("username")}</span></div>
							{/if}
						</label>

						<!-- Name (optional) -->
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label">
								<span class="label-text">Full Name</span>
								<span class="label-text-alt text-base-content/50">(optional)</span>
							</div>
							<input class="input input-bordered w-full" name="name" placeholder="Full name" bind:value={state.name} />
						</label>

						<!-- Role -->
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">Role</span></div>
							<select class="select select-bordered w-full" name="role" bind:value={state.role}>
								{#each data.roles as r}
									<option value={r}>{r}</option>
								{/each}
							</select>
						</label>

						<!-- Password -->
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">Password</span></div>
							<input
								class={"input input-bordered w-full " + (fieldError("password") ? "input-error" : "")}
								name="password"
								type="password"
								bind:value={state.password}
								autocomplete="new-password"
							/>
							{#if fieldError("password")}
								<div class="label"><span class="label-text-alt text-error">{fieldError("password")}</span></div>
							{/if}
						</label>

						<!-- Confirm password -->
						<label class="form-control col-span-12 xl:col-span-6">
							<div class="label"><span class="label-text">Confirm Password</span></div>
							<input
								class={"input input-bordered w-full " + (fieldError("confirmPassword") ? "input-error" : "")}
								name="confirmPassword"
								type="password"
								bind:value={state.confirmPassword}
								autocomplete="new-password"
							/>
							{#if fieldError("confirmPassword")}
								<div class="label"><span class="label-text-alt text-error">{fieldError("confirmPassword")}</span></div>
							{/if}
						</label>

						<!-- Assignments card -->
						<div class="col-span-12">
							<div class="rounded-xl border border-base-200 bg-base-100">
								<div class="px-4 py-3 border-b border-base-200">
									<p class="text-sm font-semibold">Assignments</p>
									<p class="text-xs text-base-content/60">Select projects and branches this user can access</p>
								</div>

								<div class="p-4 grid grid-cols-12 gap-4">
									<!-- Projects multi-select checklist -->
									<div class="col-span-12 xl:col-span-6">
										<div class="label"><span class="label-text">Projects</span></div>
										<div class="rounded-xl border border-base-200 p-3 max-h-65 overflow-auto">
											{#if data.projects.length === 0}
												<p class="text-sm text-base-content/60">No projects found.</p>
											{:else}
												<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
													{#each data.projects as p (p.id)}
														<label class="label cursor-pointer justify-start gap-3 py-1">
															<input
																type="checkbox"
																class="checkbox checkbox-sm"
																checked={state.projectIds.includes(p.id)}
																onchange={() => (state.projectIds = toggleId(state.projectIds, p.id))}
															/>
															<span class="label-text text-sm">{p.name}</span>
														</label>
													{/each}
												</div>
											{/if}
										</div>
										<input type="hidden" name="projectIds" value={JSON.stringify(state.projectIds)} />
									</div>

									<!-- Branches multi-select checklist -->
									<div class="col-span-12 xl:col-span-6">
										<div class="label"><span class="label-text">Branches</span></div>
										<div class="rounded-xl border border-base-200 p-3 max-h-65 overflow-auto">
											{#if data.branches.length === 0}
												<p class="text-sm text-base-content/60">No branches found.</p>
											{:else}
												<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
													{#each data.branches as b (b.id)}
														<label class="label cursor-pointer justify-start gap-3 py-1">
															<input
																type="checkbox"
																class="checkbox checkbox-sm"
																checked={state.branchIds.includes(b.id)}
																onchange={() => (state.branchIds = toggleId(state.branchIds, b.id))}
															/>
															<span class="label-text text-sm">{b.name}</span>
														</label>
													{/each}
												</div>
											{/if}
										</div>
										<input type="hidden" name="branchIds" value={JSON.stringify(state.branchIds)} />
									</div>
								</div>
							</div>
						</div>

						<!-- Actions -->
						<div class="col-span-12 flex items-center justify-end gap-2 pt-2">
							<a class="btn btn-ghost" href="/users">Cancel</a>
							<button class="btn btn-primary" type="submit">Create User</button>
						</div>
					</div>
				</form>

				<p class="mt-4 text-xs text-base-content/50">
					Passwords should be hashed on the server (example below uses bcrypt).
				</p>
			</div>
		</div>
	</div>
</div>
