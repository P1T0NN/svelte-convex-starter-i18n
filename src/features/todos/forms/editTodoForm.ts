// COMPONENTS
import { m } from '@/lib/paraglide/messages';

// TYPES
import type { FieldConfig } from '@/components/ui/custom-components/form/formTypes.js';

export const todoEditFields = [
	{
		kind: 'section',
		title: m['EditTodoPage.EditTodoButton.editTodo'](),
		description: m['EditTodoPage.EditTodoButton.description'](),
		fields: [
			{
				kind: 'input',
				name: 'title',
				label: m['EditTodoPage.EditTodoButton.title'](),
				type: 'text',
				maxLength: 255,
				required: true
			},
			{ kind: 'checkbox', name: 'done', label: m['EditTodoPage.EditTodoButton.done']() },
			{
				kind: 'upload',
				name: 'images',
				label: m['EditTodoPage.EditTodoButton.images'](),
				mode: 'multiple'
			}
		]
	}
] satisfies FieldConfig[];
