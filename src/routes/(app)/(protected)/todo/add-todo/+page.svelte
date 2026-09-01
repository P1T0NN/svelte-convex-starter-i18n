<script lang="ts">
	// SVELTEKIT IMPORTS
	import { goto } from '$app/navigation';

	// LIBRARIES
	import { api } from '@convex/_generated/api';
	import { m } from '@/lib/paraglide/messages';

	// CONSTANTS
	import { PROTECTED_PAGE_ENDPOINTS } from '@/shared/constants/pageEndpoints';

	// COMPONENTS
	import { Button } from '@/components/ui/button';
	import Form from '@/components/ui/custom-components/form/form.svelte';
	import SvelteHead from '@/components/ui/custom-components/svelte-head/svelte-head.svelte';
	import { Spinner } from '@/components/ui/spinner';

	// TYPES
	import type { FieldConfig } from '@/components/ui/custom-components/form/formTypes.js';

	let submitting = $state(false);

	const createTodoFields = [
		{
			kind: 'section',
			title: m['AddTodoPage.newTodo'](),
			description: m['AddTodoPage.description'](),
			fields: [
				{
					kind: 'input',
					name: 'title',
					label: m['AddTodoPage.title'](),
					type: 'text',
					maxLength: 255,
					required: true
				},
				{ kind: 'checkbox', name: 'done', label: m['AddTodoPage.done']() },
				{
					kind: 'upload',
					name: 'images',
					label: m['AddTodoPage.images'](),
					mode: 'multiple'
				}
			]
		}
	] satisfies FieldConfig[];
</script>

<SvelteHead title={m['AddTodoPage.pageTitle']()} noindex />

<div class="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-8">
	<Form
		class="w-full"
		function={api.tables.tasks.mutations.createTodo.createTodo}
		fields={createTodoFields}
		uploadNamespace="todos"
		values={{ done: false }}
		bind:submitting		
		onSuccess={() => goto(PROTECTED_PAGE_ENDPOINTS.TODO)}
		successMessage={m['AddTodoPage.todoAdded']()}
		errorMessage={m['AddTodoPage.addError']()}
	>
		<Button type="submit" disabled={submitting}>
			{#if submitting}
				<Spinner />
			{/if}
			{m['AddTodoPage.addTodo']()}
		</Button>
	</Form>
</div>
