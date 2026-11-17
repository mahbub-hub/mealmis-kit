<script lang="ts">
 import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
 import { cn } from "$lib/utils.js";
 import { navigationMenuTriggerStyle } from "$lib/components/ui/navigation-menu/navigation-menu-trigger.svelte";
 import type { HTMLAttributes } from "svelte/elements";
 import CircleHelpIcon from "@lucide/svelte/icons/circle-help";
 import CircleIcon from "@lucide/svelte/icons/circle";
 import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
 
//  import { IsMobile } from "$lib/components/hooks/is-mobile.svelte.js";
 
//  const isMobile = new IsMobile();
 
 const components: { title: string; href: string; description: string }[] = [
  {
   title: "Alert Dialog",
   href: "/docs/components/alert-dialog",
   description:
    "A modal dialog that interrupts the user with important content and expects a response."
  },
  {
   title: "Hover Card",
   href: "/docs/components/hover-card",
   description:
    "For sighted users to preview content available behind a link."
  },
  {
   title: "Progress",
   href: "/docs/components/progress",
   description:
    "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar."
  },
  {
   title: "Scroll-area",
   href: "/docs/components/scroll-area",
   description: "Visually or semantically separates content."
  },
  {
   title: "Tabs",
   href: "/docs/components/tabs",
   description:
    "A set of layered sections of content—known as tab panels—that are displayed one at a time."
  },
  {
   title: "Tooltip",
   href: "/docs/components/tooltip",
   description:
    "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it."
  }
 ];
 
 type ListItemProps = HTMLAttributes<HTMLAnchorElement> & {
  title: string;
  href: string;
  content: string;
 };
</script>
  
<NavigationMenu.Root>
 <NavigationMenu.List class="flex-wrap">
  <NavigationMenu.Item class="hidden md:block">
   <NavigationMenu.Trigger>List</NavigationMenu.Trigger>
   <NavigationMenu.Content>
    <ul class="grid w-[300px] gap-4 p-2">
     <li>
      <NavigationMenu.Link href="##">
       <div class="font-medium">Components</div>
            </NavigationMenu.Link>
      <NavigationMenu.Link href="##">
       <div class="font-medium">Documentation</div>
         </NavigationMenu.Link>
      <NavigationMenu.Link href="##">
       <div class="font-medium">Blog</div>
         </NavigationMenu.Link>
     </li>
    </ul>
   </NavigationMenu.Content>
  </NavigationMenu.Item>
  <NavigationMenu.Item class="hidden md:block">
   <NavigationMenu.Trigger>Simple</NavigationMenu.Trigger>
   <NavigationMenu.Content>
    <ul class="grid w-[200px] gap-4 p-2">
     <li>
      <NavigationMenu.Link href="##">Components</NavigationMenu.Link>
      <NavigationMenu.Link href="##">Documentation</NavigationMenu.Link>
      <NavigationMenu.Link href="##">Blocks</NavigationMenu.Link>
     </li>
    </ul>
   </NavigationMenu.Content>
  </NavigationMenu.Item>
  <NavigationMenu.Item class="hidden md:block">
   <NavigationMenu.Trigger>With Icon</NavigationMenu.Trigger>
 
   <NavigationMenu.Content>
    <ul class="grid w-[200px] gap-4 p-2">
     <li>
      <NavigationMenu.Link href="##" class="flex-row items-center gap-2">
       <CircleHelpIcon />
       Backlog
      </NavigationMenu.Link>
 
      <NavigationMenu.Link href="##" class="flex-row items-center gap-2">
       <CircleIcon />
       To Do
      </NavigationMenu.Link>
 
      <NavigationMenu.Link href="##" class="flex-row items-center gap-2">
       <CircleCheckIcon />
       Done
      </NavigationMenu.Link>
     </li>
    </ul>
   </NavigationMenu.Content>
  </NavigationMenu.Item>
 </NavigationMenu.List>
</NavigationMenu.Root>