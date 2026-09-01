<script lang="ts">
	// LIBRARIES
	import { useMutation } from 'convex-svelte';
	import { api } from '@convex/_generated/api';
	import { m } from '@/lib/paraglide/messages';

	// COMPONENTS
	import { Button } from '@/components/ui/button';
	import NativeDialog from '@/components/ui/native-components/native-dialog/native-dialog.svelte';
	import { Spinner } from '@/components/ui/spinner';

	// UTILS
	import { toastMessage } from '@/utils/toastMessage.js';

	// TYPES
	import type { Id } from '@convex/_generated/dataModel';

	let { id, title }: { id: Id<'tasks'>; title: string } = $props();

	let deleting = $state(false);
	const deleteTodo = useMutation(api.tables.tasks.mutations.deleteTodo.deleteTodo);

	async function confirmDelete(close: () => void) {
		deleting = true;
		try {
			await deleteTodo({ ids: [id] });
			toastMessage({ type: 'success', message: m['TodoPage.DeleteTodoButton.todoDeleted']() });
			close();
		} catch (error) {
			toastMessage({
				type: 'error',
				error,
				message: m['TodoPage.DeleteTodoButton.deleteError']()
			});
		} finally {
			deleting = false;
		}
	}
</script>

<NativeDialog>
	{#snippet trigger({ open })}
		<Button
			variant="ghost"
			size="icon-sm"
			title={m['TodoPage.DeleteTodoButton.deleteTodo']()}
			aria-label={m['TodoPage.DeleteTodoButton.deleteTodo']()}
			onclick={open}
		>
			<span class="icon-[lucide--trash-2] size-3.5" aria-hidden="true"></span>
		</Button>
	{/snippet}

	{#snippet children({ close })}
		<div class="p-6">
			<div class="flex flex-col gap-1.5">
				<h2 class="text-lg font-semibold">
					{m['TodoPage.DeleteTodoButton.deleteConfirmation']()}
				</h2>
				<p class="text-sm text-muted-foreground">
					{m['TodoPage.DeleteTodoButton.deleteDescription']({ title })}
				</p>
			</div>

			<div class="mt-6 flex justify-end gap-2">
				<Button variant="outline" size="sm" onclick={close} disabled={deleting}>
					{m['TodoPage.DeleteTodoButton.cancel']()}
				</Button>
				<Button
					variant="destructive"
					size="sm"
					disabled={deleting}
					onclick={() => confirmDelete(close)}
				>
					{#if deleting}<Spinner />{/if}
					{m['TodoPage.DeleteTodoButton.delete']()}
				</Button>
			</div>
		</div>
	{/snippet}
</NativeDialog>
