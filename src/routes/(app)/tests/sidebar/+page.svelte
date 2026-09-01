<script lang="ts">
	// LIBRARIES
	import ListTodoIcon from '@lucide/svelte/icons/list-todo';
	import PanelLeftIcon from '@lucide/svelte/icons/panel-left';
	import Rows3Icon from '@lucide/svelte/icons/rows-3';
	import Table2Icon from '@lucide/svelte/icons/table-2';

	// COMPONENTS
	import NativeSidebar from '@/components/ui/native-components/native-sidebar/native-sidebar.svelte';
	import NativeSidebarContent from '@/components/ui/native-components/native-sidebar/native-sidebar-content.svelte';
	import NativeSidebarLink from '@/components/ui/native-components/native-sidebar/native-sidebar-link.svelte';
	import NativeSidebarPageHeader from '@/components/ui/native-components/native-sidebar/native-sidebar-page-header.svelte';
	import NativeSidebarSection from '@/components/ui/native-components/native-sidebar/native-sidebar-section.svelte';
	import SvelteHead from '@/components/ui/custom-components/svelte-head/svelte-head.svelte';

	let mobileSidebarOpen = $state(false);
</script>

<SvelteHead title="Sidebar test" noindex />

<div class="flex min-h-screen w-full bg-sidebar">
	<NativeSidebar label="Test navigation" bind:openMobile={mobileSidebarOpen}>
		{#snippet sidebarHeader()}
			<span class="truncate text-sm font-semibold">Native sidebar</span>
		{/snippet}

		<div class="flex flex-col gap-4 p-3">
			<nav aria-label="Test navigation" class="flex flex-col gap-1">
				<NativeSidebarSection title="General">
					<NativeSidebarLink href="/sidebar">
						<PanelLeftIcon aria-hidden="true" />
						<span>Sidebar</span>
					</NativeSidebarLink>
					<NativeSidebarLink href="/todo">
						<ListTodoIcon aria-hidden="true" />
						<span>Todos</span>
					</NativeSidebarLink>
					<NativeSidebarLink href="/tests/data-list">
						<Rows3Icon aria-hidden="true" />
						<span>Data list</span>
					</NativeSidebarLink>
					<NativeSidebarLink href="/tests/data-table">
						<Table2Icon aria-hidden="true" />
						<span>Data table</span>
					</NativeSidebarLink>
				</NativeSidebarSection>
			</nav>
		</div>
	</NativeSidebar>

	<main class="flex min-w-0 flex-1 flex-col bg-background md:overflow-hidden md:rounded-s-2xl">
		<NativeSidebarPageHeader
			title="Sidebar test"
			onOpenSidebar={() => (mobileSidebarOpen = true)}
		/>

		<NativeSidebarContent>
			<div class="mx-auto flex w-full max-w-3xl flex-col gap-8">
				<header class="flex flex-col gap-2">
					<p class="text-sm text-muted-foreground">Component test</p>
					<h1 class="text-2xl font-semibold tracking-tight">Native sidebar</h1>
					<p class="max-w-prose text-sm text-muted-foreground">
						This uses a compact hover rail on desktop and a full-screen sheet on mobile.
					</p>
				</header>

				<section class="rounded-xl border bg-muted/30 p-4 text-sm">
					<p>Resize the page and hover or focus the sidebar to test its expanded state.</p>
				</section>
			</div>
		</NativeSidebarContent>
	</main>
</div>
