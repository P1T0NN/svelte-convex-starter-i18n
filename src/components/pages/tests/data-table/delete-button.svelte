<script lang="ts">
	// LIBRARIES
	import { useMutation } from 'convex-svelte';
	import { api } from '@convex/_generated/api';
	import { m } from '@/lib/paraglide/messages';

	// COMPONENTS
	import { Button } from '@/components/ui/button';
	import NativeDialog from '@/components/ui/native-components/native-dialog/native-dialog.svelte';

	// UTILS
	import { toastMessage } from '@/utils/toastMessage.js';

	// TYPES
	import type { Id } from '@convex/_generated/dataModel';

	let {
		selectedKeys,
		count,
		onClear
	}: {
		selectedKeys: ReadonlySet<PropertyKey>;
		count: number;
		onClear: () => void;
	} = $props();

	let deleting = $state(false);
	const deleteTodo = useMutation(api.tables.tasks.mutations.deleteTodo.deleteTodo);

	async function confirmDelete() {
		deleting = true;
		try {
			// SAFETY: the table's key fn returns Convex task ids.
			const deleted = await deleteTodo({ ids: [...selectedKeys] as Id<'tasks'>[] });
			toastMessage({
				type: 'success',
				message: m['TestsDataTablePage.DeleteButton.deletedTasks']({ count: deleted })
			});
			onClear();
		} catch (error) {
			toastMessage({
				type: 'error',
				error,
				message: m['TestsDataTablePage.DeleteButton.deleteFailed']()
			});
		} finally {
			deleting = false;
		}
	}
</script>

<NativeDialog>
	{#snippet trigger({ open })}
		<Button variant="destructive" size="xs" onclick={open}>
			<span class="icon-[lucide--trash-2] size-3.5"></span>
			{m['TestsDataTablePage.DeleteButton.deleteSelected']({ count })}
		</Button>
	{/snippet}

	{#snippet children({ close })}
		<div class="relative p-6">
			<button
				type="button"
				aria-label={m['TestsDataTablePage.DeleteButton.close']()}
				onclick={close}
				class="absolute top-4 right-4 cursor-pointer rounded-full p-1 transition-transform outline-none focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-95"
			>
				<span class="icon-[lucide--x] size-4"></span>
			</button>

			<div class="space-y-1.5">
				<h2 class="text-lg font-semibold">
					{m['TestsDataTablePage.DeleteButton.deleteConfirmation']({ count })}
				</h2>
				<p class="text-sm text-muted-foreground">
					{m['TestsDataTablePage.DeleteButton.deleteDescription']()}
				</p>
			</div>

			<div class="mt-6 flex justify-end gap-2">
				<Button variant="outline" size="sm" onclick={close} disabled={deleting}>
					{m['TestsDataTablePage.DeleteButton.cancel']()}
				</Button>
				<Button
					variant="destructive"
					size="sm"
					disabled={deleting}
					onclick={async () => {
						await confirmDelete();
						close();
					}}
				>
					{m['TestsDataTablePage.DeleteButton.delete']()}
				</Button>
			</div>
		</div>
	{/snippet}
</NativeDialog>
