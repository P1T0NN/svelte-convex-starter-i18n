<script lang="ts">
	// LIBRARIES
	import { useAuth } from '../../hooks/useAuth.svelte';
	import { m } from '@/lib/paraglide/messages';

	// CONSTANTS
	import { UNPROTECTED_PAGE_ENDPOINTS } from '@/shared/constants/pageEndpoints';

	// COMPONENTS
	import * as Card from '@/components/ui/card/index.js';
	import * as Field from '@/components/ui/field/index.js';
	import { Button } from '@/components/ui/button/index.js';
	import EmailInput from '@/components/ui/custom-components/email-input/email-input.svelte';
	import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp/index.js';
	import PasswordInput from '@/components/ui/custom-components/password-input/password-input.svelte';
	import { Spinner } from '@/components/ui/spinner/index.js';

	// DATA
	import { ERROR_MESSAGE_KEYS } from '@/shared/features/auth/data/authData';

	// TYPES
	import type { ComponentProps } from 'svelte';

	let { ...restProps }: ComponentProps<typeof Card.Root> = $props();

	const auth = useAuth();

	let step = $state<'email' | 'reset'>('email');
	let email = $state('');
	let otp = $state('');
	let password = $state('');
	let confirmPassword = $state('');

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (step === 'email') {
			await auth.requestPasswordReset(email);
			if (!auth.error) step = 'reset';
			return;
		}

		if (password !== confirmPassword) {
			auth.setError('PASSWORDS_DO_NOT_MATCH');
			return;
		}

		await auth.resetPassword(email, otp, password);
	}
</script>

<Card.Root {...restProps}>
	<Card.Header>
		{#if step === 'email'}
			<Card.Title>{m['AuthFeature.ForgotPasswordForm.forgotYourPassword']()}</Card.Title>
			<Card.Description
				>{m['AuthFeature.ForgotPasswordForm.emailResetDescription']()}</Card.Description
			>
		{:else}
			<Card.Title>{m['AuthFeature.ForgotPasswordForm.setNewPassword']()}</Card.Title>
			<Card.Description
				>{m['AuthFeature.ForgotPasswordForm.resetCodeDescription']()}</Card.Description
			>
		{/if}
	</Card.Header>

	<Card.Content>
		<form onsubmit={handleSubmit}>
			<Field.Group>
				{#if step === 'email'}
					<Field.Field>
						<Field.Label for="email">{m['AuthFeature.ForgotPasswordForm.email']()}</Field.Label>
						<EmailInput id="email" required bind:value={email} />
					</Field.Field>
				{:else}
					<Field.Field>
						<Field.Label>{m['AuthFeature.ForgotPasswordForm.verificationCode']()}</Field.Label>
						<InputOTP maxlength={6} bind:value={otp}>
							{#snippet children({ cells })}
								<InputOTPGroup>
									{#each cells as cell, i (i)}
										<InputOTPSlot {cell} />
									{/each}
								</InputOTPGroup>
							{/snippet}
						</InputOTP>
					</Field.Field>

					<Field.Field>
						<Field.Label for="password"
							>{m['AuthFeature.ForgotPasswordForm.newPassword']()}</Field.Label
						>
						<PasswordInput id="password" required bind:value={password} />
						<Field.Description
							>{m['AuthFeature.ForgotPasswordForm.passwordLengthDescription']()}</Field.Description
						>
					</Field.Field>

					<Field.Field>
						<Field.Label for="confirm-password"
							>{m['AuthFeature.ForgotPasswordForm.confirmPassword']()}</Field.Label
						>
						<PasswordInput id="confirm-password" required bind:value={confirmPassword} />
					</Field.Field>
				{/if}

				{#if auth.error}
					<p class="text-sm font-medium text-red-500">
						{m[ERROR_MESSAGE_KEYS[auth.error]]()}
					</p>
				{/if}

				<Field.Field>
					{#if step === 'email'}
						<Button type="submit" disabled={auth.submitting}>
							{#if auth.submitting}
								<Spinner />
							{/if}
							{m['AuthFeature.ForgotPasswordForm.sendResetCode']()}
						</Button>
					{:else}
						<Button type="submit" disabled={auth.submitting || otp.length < 6}>
							{#if auth.submitting}
								<Spinner />
							{/if}
							{m['AuthFeature.ForgotPasswordForm.resetPassword']()}
						</Button>
					{/if}
				</Field.Field>
			</Field.Group>
		</form>
	</Card.Content>

	<Card.Footer class="flex justify-center">
		<Field.Description>
			<a href={UNPROTECTED_PAGE_ENDPOINTS.SIGN_IN} class="text-sm font-medium"
				>{m['AuthFeature.ForgotPasswordForm.backToSignIn']()}</a
			>
		</Field.Description>
	</Card.Footer>
</Card.Root>
