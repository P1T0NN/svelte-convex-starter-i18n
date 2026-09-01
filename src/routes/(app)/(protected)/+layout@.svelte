<script lang="ts">
	// LIBRARIES
	import ListIcon from '@lucide/svelte/icons/list';

	// CONFIG
	import { COMPANY_DATA } from '@/shared/config';

	// COMPONENTS
	import NativeSidebar from '@/components/ui/native-components/native-sidebar/native-sidebar.svelte';
	import NativeSidebarContent from '@/components/ui/native-components/native-sidebar/native-sidebar-content.svelte';
	import NativeSidebarLink from '@/components/ui/native-components/native-sidebar/native-sidebar-link.svelte';
	import NativeSidebarPageHeader from '@/components/ui/native-components/native-sidebar/native-sidebar-page-header.svelte';
	import NativeSidebarSection from '@/components/ui/native-components/native-sidebar/native-sidebar-section.svelte';
	import NativeSidebarUser from '@/components/ui/native-components/native-sidebar/native-sidebar-user.svelte';

	// CONSTANTS
	import { PROTECTED_PAGE_ENDPOINTS } from '@/shared/constants/pageEndpoints.js';

	let { children } = $props();

	let mobileSidebarOpen = $state(false);
</script>

<svelte:head>
	<title>Todos</title>
</svelte:head>

<div class="flex min-h-screen w-full bg-sidebar">
	<NativeSidebar label="Workspace navigation" bind:openMobile={mobileSidebarOpen}>
		{#snippet sidebarHeader()}
			<span class="truncate text-sm font-semibold">{COMPANY_DATA.NAME}</span>
		{/snippet}

		{#snippet sidebarFooter()}
			<NativeSidebarUser />
		{/snippet}

		<div class="flex flex-col gap-4 p-3">
			<nav aria-label="Workspace" class="flex flex-col gap-1">
				<NativeSidebarSection title="General">
					<NativeSidebarLink href={PROTECTED_PAGE_ENDPOINTS.TODO}>
						<ListIcon aria-hidden="true" />
						<span>Todos</span>
					</NativeSidebarLink>
				</NativeSidebarSection>
			</nav>
		</div>
	</NativeSidebar>

	<main class="flex min-w-0 flex-1 flex-col bg-background md:overflow-hidden md:rounded-s-2xl">
		<NativeSidebarPageHeader
			title="Todos"
			sidebarLabel="Open workspace navigation"
			onOpenSidebar={() => (mobileSidebarOpen = true)}
		/>

		<NativeSidebarContent>
			{@render children()}
		</NativeSidebarContent>
	</main>
</div>
