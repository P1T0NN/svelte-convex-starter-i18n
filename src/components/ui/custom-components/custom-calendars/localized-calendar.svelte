<script lang="ts">
	// LIBRARIES
	import { CalendarDate } from '@internationalized/date';
	import { getLocale } from '@/lib/paraglide/runtime';

	// COMPONENTS
	import * as Card from '@/components/ui/card/index.js';
	import { NativeSelect } from '@/components/ui/select/index.js';
	import RangeCalendar from '@/components/ui/range-calendar/range-calendar.svelte';

	// TYPES
	import type { DateRange } from 'bits-ui';

	let value = $state<DateRange | undefined>({
		start: new CalendarDate(2025, 9, 9),
		end: new CalendarDate(2025, 9, 17)
	});

	const currentLocale = getLocale();
	let locale = $state(currentLocale);

	const languageOptions = [
		{
			label: 'English',
			value: 'en'
		},
		{
			label: 'Español',
			value: 'es'
		}
	];
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Book an appointment</Card.Title>

		<Card.Description>Select the dates for your appointment</Card.Description>

		<Card.Action>
			<NativeSelect
				class="w-[100px]"
				ariaLabel="Select language"
				value={locale}
				onChange={(v) => (locale = v as typeof locale)}
				options={languageOptions}
			/>
		</Card.Action>
	</Card.Header>

	<Card.Content>
		<RangeCalendar
			bind:value
			numberOfMonths={2}
			{locale}
			class="bg-transparent p-0"
			buttonVariant="outline"
		/>
	</Card.Content>
</Card.Root>
