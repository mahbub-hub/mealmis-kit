<script lang="ts">
	import '../routes/app.css';
	import { ModeWatcher } from "mode-watcher";
	let { children } = $props();
</script>

	<!-- Main content area -->
	<main>
	<ModeWatcher />
	{@render children()}
	</main>
	
	



