<script lang="ts">
	// COMPONENTS
	import FormField from './form-field.svelte';

	// TYPES
	import type { SelectField } from './formTypes.js';

	type Props = {
		field: SelectField;
		value: string;
		disabled?: boolean;
		error?: string;
		onValueChange: (value: string) => void;
	};

	let { field, value, disabled = false, error, onValueChange }: Props = $props();
</script>

<FormField {field} {disabled} {error}>
	<select
		id={field.name}
		name={field.name}
		{value}
		class="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
		required={field.required}
		{disabled}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${field.name}-error` : undefined}
		onchange={(event) => onValueChange(event.currentTarget.value)}
	>
		{#each field.options as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
</FormField>
