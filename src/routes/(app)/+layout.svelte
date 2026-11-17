<script lang="ts">
	import '../../routes/app.css';
	import type { LayoutData } from './$types';
	import { page } from '$app/stores';
	let { data, children } = $props();


	// Simple active link check
	const isActive = (path: string) => $page.url.pathname === path || $page.url.pathname.startsWith(path + '/');
	import { GitBranchPlus, MapPinHouse,  Map, PanelsTopLeft, Library, UserPlus, Cog, ChartLine, SquareChartGantt, type Icon as IconType } from '@lucide/svelte';

type MenuItem = {
  name: string;
  href: string;
  icon: typeof IconType;
};

const menuItems: MenuItem[] = [
  {
	name: 'Overview',
	href: '/',
	icon: PanelsTopLeft
  },
   {
	name: 'Activity',
	href: '/activities',
	icon: SquareChartGantt
  },
    {
	name: 'Indicator',
	href: '/indicators',
	icon: ChartLine
  },
   {
	name: 'Geolocation',
	href: '/geolocation',
	icon:  Map
  },
    {
	name: 'Project',
	href: '/',
	icon: Cog
  },
 
];


const menu2Items: MenuItem[] = [
  {
	name: 'Project Registration',
	href: '/project-registration',
	icon: GitBranchPlus
  },
   {
	name: 'Activity Registration',
	href: '/activity-registration',
	icon: ChartLine
  },
     {
	name: 'Activity Achievement',
	href: '/activity-achievement',
	icon: SquareChartGantt
  },
  
  {
	name: 'Donor Registration',
	href: '/donor',
	icon: Library
  },
  {
	name: 'Branch Registration',
	href: '/branch-registration',
	icon: Cog
  },
  {
	name: 'User Registration',
	href: '/user-registrations',
	icon: UserPlus
  }
];

const menu3Items: MenuItem[] = [
  {
	name: 'Indicator View',
	href: '/indicator-view',
	icon: ChartLine
  },
   {
	name: 'Project View',
	href: '/project-view',
	icon: PanelsTopLeft
  },
  {
	name: 'Activity View',
	href: '/activity-view',
	icon: SquareChartGantt
  },
  {
	name: 'Branch View',
	href: '/branch-view',
	icon: MapPinHouse
  }
];

</script>

<div class="drawer lg:drawer-open">
	<input id="app-drawer" type="checkbox" class="drawer-toggle" />

	<!-- Page content -->
	<div class="drawer-content flex min-h-screen flex-col bg-base-300">
		<!-- Top navbar -->
		<div class="navbar bg-base-100 shadow-sm">
			<div class="flex-none lg:hidden">
				<label for="app-drawer" class="btn btn-square btn-ghost" aria-label="Open menu">
					<!-- hamburger icon -->
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</label>
			</div>

			<div class="flex-1">
				<a href="/" class="btn btn-ghost text-lg">BRAC MIS</a>
				<label class="input">
  <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <g
      stroke-linejoin="round"
      stroke-linecap="round"
      stroke-width="2.5"
      fill="none"
      stroke="currentColor"
    >
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.3-4.3"></path>
    </g>
  </svg>
  <input type="search" required placeholder="Search" />
</label>
	</div>

			<div class="flex-none gap-2">
				<!-- Right side actions -->
				<a href="/activity-achievement" class="btn btn-primary btn-sm hidden sm:inline-flex">+ Login</a>
			</div>
		</div>

		<!-- Main content area -->
		<main class="p-3 sm:p-5 lg:p-8">
			{@render children()}
		</main>
	</div>

	<!-- Sidebar -->
	<div class="drawer-side">
		<label for="app-drawer" class="drawer-overlay"></label>

		<aside class="w-72 bg-base-100">
			<div class="p-4">
				<div class="text-xl font-semibold">BRAC MIS</div>
				<div class="text-sm opacity-60">Result Management</div>
			</div>

			<ul class="menu px-3">
				<li class="menu-title"><span>DASHBOARD MENU</span></li>
				{#each menuItems as item }
				{@const Icon = item.icon}
				<li>
					<a href={item.href}>
					<Icon />
					<span>{item.name}</span>	
					</a>
				</li>
				{/each}

				<div class="divider my-2"></div>

				<li class="menu-title"><span>DATA VIEW</span></li>
				{#each menu3Items as item3 }
				{@const Icon = item3.icon}
				<li>
					<a href={item3.href}>
					<Icon />
					<span>{item3.name}</span>	
					</a>
				</li>
				{/each}
			
			
				<div class="divider my-2"></div>

				<li class="menu-title"><span>SUBMISSION FORM</span></li>
				{#each menu2Items as item2 }
				{@const Icon = item2.icon}
				<li>
					<a href={item2.href}>
					<Icon />
					<span>{item2.name}</span>	
					</a>
				</li>
				{/each}
			</ul>

			<div class="p-4">
				<div class="alert alert-info">
					<span class="text-sm">Tip: Use filters in Result Entry List to find records quickly.</span>
				</div>
			</div>
		</aside>
	</div>
</div>


