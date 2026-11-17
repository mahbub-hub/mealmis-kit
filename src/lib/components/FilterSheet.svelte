<script lang="ts">
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
    import * as Sheet from "$lib/components/ui/sheet/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { SlidersHorizontal } from "lucide-svelte";

	type Option = {
		label: string;
		value: string;
	};

	type Filters = {
		cluster: string;
		programme: string;
		division: string;
		district: string;
		year: string;
	};

	let {
		open = false,
		clusters = [],
		programmes = [],
		divisions = [],
		districts = [],
		districtsByDivision = {},
		years = [],
		value = {
			cluster: "all",
			programme: "all",
			division: "all",
			district: "all",
			year: new Date().getFullYear().toString()
		},
		onApply
	} = $props<{
		open?: boolean;
		clusters?: Option[];
		programmes?: Option[];
		divisions?: Option[];
		districts?: Option[];
		districtsByDivision?: Record<string, Option[]>;
		years?: Option[];
		value?: Filters;
		onApply?: (filters: Filters) => void;
	}>();

	let isOpen = $state(false);

	let filters = $state<Filters>({
		cluster: "all",
		programme: "all",
		division: "all",
		district: "all",
		year: new Date().getFullYear().toString()
	});

	$effect(() => {
		isOpen = open;
	});

	$effect(() => {
		filters = {
			cluster: value.cluster,
			programme: value.programme,
			division: value.division,
			district: value.district,
			year: value.year
		};
	});

	const availableDistricts = $derived(
		filters.division !== "all"
			? (districtsByDivision[filters.division] ?? [])
			: districts
	);

	$effect(() => {
		const exists = availableDistricts.some((d: { value: string; }) => d.value === filters.district);
		if (!exists) filters.district = "all";
	});

	function resetFilters() {
		filters = {
			cluster: "all",
			programme: "all",
			division: "all",
			district: "all",
			year: new Date().getFullYear().toString()
		};
	}

	function applyFilters() {
		onApply?.({ ...filters });
		isOpen = false;
	}

	function labelOf(list: Option[], value: string, fallback: string) {
		return list.find((x) => x.value === value)?.label ?? fallback;
	}
</script>

<Sheet.Root bind:open={isOpen}>
	<Sheet.Trigger>
	   {#snippet child({props})}
		<Button variant="outline" class="gap-2" {...props}>
			<SlidersHorizontal class="size-6" />
			Filters
		</Button>
	   {/snippet}
	</Sheet.Trigger>

	<Sheet.Content side="right" class=" bg-base-300 w-full sm:max-w-lg p-0">
	
		<div class="flex h-full flex-col">
			<div class="border-b border-border px-5 py-4">
				<Sheet.Header class="space-y-1 text-left">
					<Sheet.Title>Dashboard Filters</Sheet.Title>
					<Sheet.Description>
						Filter overview data by cluster, programme, division, district, and year.
					</Sheet.Description>
				</Sheet.Header>
			</div>
				
			<div class="flex-1 overflow-y-auto px-5 py-5">
				<div class="space-y-5">
					<div class="space-y-2">
						<Label for="cluster">Cluster</Label>
						<Select.Root type="single" name="cluster" bind:value={filters.cluster}>
							<Select.Trigger id="cluster" class="w-full">
								{labelOf(clusters, filters.cluster, "All Clusters")}
							</Select.Trigger>
							<Select.Content>
								{#each clusters as item}
									<Select.Item value={item.value} label={item.label}>
										{item.label}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<div class="space-y-2">
						<Label for="programme">Programme</Label>
						<Select.Root type="single" name="programme" bind:value={filters.programme}>
							<Select.Trigger id="programme" class="w-full">
								{labelOf(programmes, filters.programme, "All Programmes")}
							</Select.Trigger>
							<Select.Content>
								{#each programmes as item}
									<Select.Item value={item.value} label={item.label}>
										{item.label}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<div class="grid grid-cols-1 gap-5 sm:grid-cols-1">
						<div class="space-y-2">
							<Label for="division">Division</Label>
							<Select.Root type="single" name="division" bind:value={filters.division}>
								<Select.Trigger id="division" class="w-full">
									{labelOf(divisions, filters.division, "All Divisions")}
								</Select.Trigger>
								<Select.Content>
									{#each divisions as item}
										<Select.Item value={item.value} label={item.label}>
											{item.label}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>

						<div class="space-y-2">
							<Label for="district">District</Label>
							<Select.Root type="single" name="district" bind:value={filters.district}>
								<Select.Trigger id="district" class="w-full">
									{labelOf(availableDistricts, filters.district, "All Districts")}
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="all" label="All Districts">
										All Districts
									</Select.Item>
									{#each availableDistricts.filter((d: { value: string; }) => d.value !== "all") as item}
										<Select.Item value={item.value} label={item.label}>
											{item.label}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
					</div>

					<div class="space-y-2">
						<Label for="year">Year</Label>
						<Select.Root type="single" name="year" bind:value={filters.year}>
							<Select.Trigger id="year" class="w-full">
								{labelOf(years, filters.year, filters.year)}
							</Select.Trigger>
							<Select.Content>
								{#each years as item}
									<Select.Item value={item.value} label={item.label}>
										{item.label}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				</div>
			</div>

			<!-- sticky footer -->
			<div class="border-t border-border px-5 py-4">
				<div class="flex items-center justify-between gap-3">
					<Button type="button" variant="ghost" onclick={resetFilters}>
						Reset
					</Button>

					<div class="flex gap-2">
						<Sheet.Close>
							<Button type="button" variant="outline">
								Cancel
							</Button>
						</Sheet.Close>

						<Button type="button" onclick={applyFilters}>
							Apply Filters
						</Button>
					</div>
				</div>
			</div>
		</div>
	</Sheet.Content>
</Sheet.Root>