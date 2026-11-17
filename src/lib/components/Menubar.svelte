<script lang="ts">
  import { page } from '$app/stores';
  import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
  import { cn } from "$lib/utils.js";
  import { navigationMenuTriggerStyle } from "$lib/components/ui/navigation-menu/navigation-menu-trigger.svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import CircleHelpIcon from "@lucide/svelte/icons/circle-help";
  import CircleIcon from "@lucide/svelte/icons/circle";
  import CircleCheckIcon from "@lucide/svelte/icons/circle-check";

	// import Navbar from '$lib/components/Navbar.svelte';
	
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

<header class="sticky top-0 z-50 bg-base-100 shadow-sm">
	<div class="navbar mx-auto max-w-500 px-3 lg:flex-1 lg:px-4">
      <div class="navbar-start">
        <div class="dropdown lg:hidden">
          <button tabindex="0" class="btn btn-ghost btn-circle" aria-label="Open menu">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </button>

          <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
          <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-60 mt-3 w-72 p-2 shadow">
            <li><a href="/">Home</a></li>
            <li>
              <details>
                <summary>Dashboard</summary>
                <ul>
                  <li><a href="/dashboard/overview">Overview</a></li>
                  <li><a href="/dashboard/programs">Programs</a></li>
                  <li><a href="/dashboard/reports">Reports</a></li>
                </ul>
              </details>
            </li>
            <li>
              <details>
                <summary>Data Views</summary>
                <ul>
                  <li><a href="/data/branch">Branch data</a></li>
                  <li><a href="/data/region">Regional data</a></li>
                  <li><a href="/data/analytics">Analytics</a></li>
                </ul>
              </details>
            </li>
            <li>
              <details>
                <summary>Submission forms</summary>
                <ul>
                  <li><a href="/forms/monthly">Monthly form</a></li>
                  <li><a href="/forms/quarterly">Quarterly form</a></li>
                  <li><a href="/forms/special">Special request</a></li>
                </ul>
              </details>
            </li>
            <li><a href="/">Impact</a></li>
            <li><a href="/insights">Insights</a></li>
          </ul>
        </div>

        <a href="/" class="btn btn-ghost px-2 text-xl font-bold">BRAC MIS</a>
      </div>

      <div class="navbar-center hidden flex-1 justify-center lg:flex">
        <NavigationMenu.Root class="relative z-20 w-full max-w-max">
          <NavigationMenu.List class="flex items-center justify-between w-full gap-1">
            <NavigationMenu.Item>
              <NavigationMenu.Trigger>Dashboard</NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <ul class="grid w-62.5 gap-3 p-4 md:grid-cols-1">
				{#each menuItems as item}
				{@const Icon = item.icon}
                <li>
                <NavigationMenu.Link href={item.href} class="flex-row items-center gap-2">
              	<Icon />
              	{item.name}
            	</NavigationMenu.Link>
 				 </li>
				{/each}                 
                </ul>
              </NavigationMenu.Content>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <NavigationMenu.Trigger>Data Views</NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <ul class="grid w-62.5 gap-3 p-4 md:grid-cols-1">
					{#each menu3Items as item}
					{@const Icon = item.icon}
                  <li>
                    <NavigationMenu.Link href={item.href} class="flex-row items-center gap-2">
					  <Icon />
					  {item.name}
                    </NavigationMenu.Link>
                  </li>
				{/each}
                </ul>
              </NavigationMenu.Content>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <NavigationMenu.Trigger>Submission forms</NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <ul class="grid w-62.5 gap-3 p-4 md:grid-cols-1">
					{#each menu2Items as item}
					{@const Icon = item.icon}
                  <li>
                    <NavigationMenu.Link href={item.href} class="flex-row items-center gap-2">
                      <Icon />
                      {item.name}
                    </NavigationMenu.Link>
                  </li>
				  {/each}
                  
                </ul>
              </NavigationMenu.Content>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <NavigationMenu.Link href="/" class="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                Impact
              </NavigationMenu.Link>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <NavigationMenu.Link href="/insights" class="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                Insights
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          </NavigationMenu.List>

          <NavigationMenu.Viewport class="top-full mt-2" />
        </NavigationMenu.Root>
      </div>

      <div class="navbar-end gap-1">
        <button class="btn btn-ghost btn-circle" aria-label="Search">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <button class="btn btn-ghost btn-circle" aria-label="Notifications">
          <div class="indicator">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span class="badge badge-xs badge-primary indicator-item"></span>
          </div>
        </button>
        <button class="btn btn-ghost btn-circle avatar" aria-label="Profile">
          <div class="w-10 rounded-full">
            <img alt="Profile avatar" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          </div>
        </button>
      </div>
    </div>

  	</header>

	
	



