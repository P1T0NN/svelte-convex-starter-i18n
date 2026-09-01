<script lang="ts">
	// LIBRARIES
	import UsersIcon from '@lucide/svelte/icons/users';
	import ScrollTextIcon from '@lucide/svelte/icons/scroll-text';
	import { page } from '$app/state';
	import { useCachedConvexQuery } from '@/hooks/useCachedConvexQuery.svelte.js';

	// CONVEX
	import { api } from '@convex/_generated/api';

	// CONFIG
	import { COMPANY_DATA } from '@/shared/config';

	// COMPONENTS
	import NativeSidebar from '@/components/ui/native-components/native-sidebar/native-sidebar.svelte';
	import NativeSidebarContent from '@/components/ui/native-components/native-sidebar/native-sidebar-content.svelte';
	import NativeSidebarLink from '@/components/ui/native-components/native-sidebar/native-sidebar-link.svelte';
	import NativeSidebarPageHeader from '@/components/ui/native-components/native-sidebar/native-sidebar-page-header.svelte';
	import NativeSidebarSection from '@/components/ui/native-components/native-sidebar/native-sidebar-section.svelte';
	import NativeSidebarUser from '@/components/ui/native-components/native-sidebar/native-sidebar-user.svelte';

	let { children } = $props();
	let mobileSidebarOpen = $state(false);

	const breadcrumbUserId = $derived(
		page.route.id === '/admin/users/[id]' ? page.params.id : undefined
	);
	const breadcrumbUser = useCachedConvexQuery(
		api.betterAuth.tables.users.queries.fetchUserBreadcrumbAdmin.fetchUserBreadcrumbAdmin,
		() => (breadcrumbUserId ? { id: breadcrumbUserId } : 'skip')
	);
</script>

<svelte:head>
	<title>Admin</title>
</svelte:head>

<div class="flex min-h-screen w-full bg-sidebar">
	<NativeSidebar label="Admin navigation" bind:openMobile={mobileSidebarOpen}>
		{#snippet sidebarHeader()}
			<span class="truncate text-sm font-semibold">{COMPANY_DATA.NAME}</span>
		{/snippet}

		{#snippet sidebarFooter()}
			<NativeSidebarUser />
		{/snippet}

		<div class="flex flex-col gap-4 p-3">
			<nav aria-label="Admin" class="flex flex-col gap-1">
				<NativeSidebarSection title="General">
					<NativeSidebarLink href="/admin/users">
						<UsersIcon aria-hidden="true" />
						<span>Users</span>
					</NativeSidebarLink>
					<NativeSidebarLink href="/admin/logs">
						<ScrollTextIcon aria-hidden="true" />
						<span>Logs</span>
					</NativeSidebarLink>
				</NativeSidebarSection>
			</nav>
		</div>
	</NativeSidebar>

	<main class="flex min-w-0 flex-1 flex-col bg-background md:overflow-hidden md:rounded-s-2xl">
		<NativeSidebarPageHeader
			title="Admin"
			rootHref="/admin/dashboard"
			pageName={breadcrumbUser.data?.name}
			sidebarLabel="Open admin navigation"
			onOpenSidebar={() => (mobileSidebarOpen = true)}
		/>

		<NativeSidebarContent>
			{@render children()}
		</NativeSidebarContent>
	</main>
</div>
