<script lang="ts">
	// SVELTEKIT IMPORTS
	import { goto } from '$app/navigation';

	// LIBRARIES
	import { api } from '@convex/_generated/api';
	import { m } from '@/lib/paraglide/messages';

	// SCHEMAS
	import { updateTodoSchema } from '@/shared/features/todo/schemas/todoSchemas.js';

	// CONFIG
	import { todoEditFields } from '@/features/todos/forms/editTodoForm.js';

	// CONSTANTS
	import { PROTECTED_PAGE_ENDPOINTS } from '@/shared/constants/pageEndpoints.js';

	// COMPONENTS
	import { Button } from '@/components/ui/button';
	import Form from '@/components/ui/custom-components/form/form.svelte';
	import { Spinner } from '@/components/ui/spinner';

	// TYPES
	import type { Id } from '@convex/_generated/dataModel';
	import type { PreviewFile } from '@/features/uploadFile/types/uploadFileTypes.js';

	type TodoEditTask = {
		_id: Id<'tasks'>;
		title: string;
		done: boolean;
		images: string[];
		imageKeys: string[];
	};

	let { task }: { task: TodoEditTask } = $props();

	// svelte-ignore state_referenced_locally (the parent keys this component by task._id, so values intentionally initializes once per todo)
	let values = $state({ title: task.title, done: task.done });
	// svelte-ignore state_referenced_locally (the parent keys this component by task._id, so files intentionally initialize once per todo)
	let uploadFiles = $state<PreviewFile[]>(
		task.images.map((url, index) => ({
			id: task.imageKeys[index] ?? url,
			key: task.imageKeys[index] ?? url,
			url
		}))
	);
	let submitting = $state(false);
</script>

<Form
	class="w-full"
	function={api.tables.tasks.mutations.updateTodo.updateTodo}
	schema={updateTodoSchema}
	extraFields={{ id: task._id }}
	fields={todoEditFields}
	uploadNamespace="todos"
	bind:values
	bind:uploadFiles
	bind:submitting
	onSuccess={() => goto(PROTECTED_PAGE_ENDPOINTS.TODO)}
	successMessage={m['EditTodoPage.EditTodoButton.todoUpdated']()}
	errorMessage={m['EditTodoPage.EditTodoButton.updateError']()}
	resetOnSuccess={false}
>
	<Button type="submit" disabled={submitting}>
		{#if submitting}
			<Spinner />
		{/if}
		{m['EditTodoPage.EditTodoButton.saveChanges']()}
	</Button>
</Form>
