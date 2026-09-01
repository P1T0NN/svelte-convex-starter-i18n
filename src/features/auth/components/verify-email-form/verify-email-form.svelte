<script lang="ts">
	// LIBRARIES
	import { useAuth } from '../../hooks/useAuth.svelte';
	import { useSearchParams } from '@/hooks/useSearchParams.svelte';
	import { m } from '@/lib/paraglide/messages';
	import { onMount } from 'svelte';

	// CONSTANTS
	import { UNPROTECTED_PAGE_ENDPOINTS } from '@/shared/constants/pageEndpoints';

	// COMPONENTS
	import * as Card from '@/components/ui/card/index.js';
	import * as Field from '@/components/ui/field/index.js';
	import { Button } from '@/components/ui/button/index.js';
	import { Input } from '@/components/ui/input/index.js';
	import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp/index.js';
	import { Spinner } from '@/components/ui/spinner/index.js';
	import { toast } from 'svelte-sonner';

	// DATA
	import { ERROR_MESSAGE_KEYS } from '@/shared/features/auth/data/authData';

	// TYPES
	import type { ComponentProps } from 'svelte';

	let { ...restProps }: ComponentProps<typeof Card.Root> = $props();

	const auth = useAuth();
	const params = useSearchParams();

	// Pre-fill from the redirect after sign-up: /verify-email?email=...
	let email = $state(params.get('email') ?? '');
	let otp = $state('');
	let currentTime = $state(Date.now());
	let resendAvailableAt = $state<number | null>(null);

	const RESEND_COOLDOWN_MS = 60_000;

	const resendCooldown = $derived(
		resendAvailableAt === null
			? 0
			: Math.max(0, Math.ceil((resendAvailableAt - currentTime) / 1000))
	);

	onMount(() => {
		const timer = setInterval(() => {
			if (resendAvailableAt === null) return;

			currentTime = Date.now();

			if (currentTime >= resendAvailableAt) {
				resendAvailableAt = null;
			}
		}, 1000);

		return () => clearInterval(timer);
	});

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		await auth.verifyEmail(email, otp);
	}

	async function handleResend() {
		if (auth.submitting || resendCooldown > 0 || email.length === 0) return;

		await auth.sendVerificationOtp(email);

		if (auth.error) return;

		currentTime = Date.now();
		resendAvailableAt = currentTime + RESEND_COOLDOWN_MS;
		toast.success(m['AuthFeature.VerifyEmailForm.anotherVerificationCode']());
	}
</script>

<Card.Root {...restProps}>
	<Card.Header>
		<Card.Title>{m['AuthFeature.VerifyEmailForm.verifyYourEmail']()}</Card.Title>
		<Card.Description>{m['AuthFeature.VerifyEmailForm.verifyEmailDescription']()}</Card.Description>
	</Card.Header>

	<Card.Content>
		<form onsubmit={handleSubmit}>
			<Field.Group>
				<Field.Field>
					<Field.Label for="email">{m['AuthFeature.VerifyEmailForm.email']()}</Field.Label>
					<Input
						id="email"
						type="email"
						placeholder={m['AuthFeature.VerifyEmailForm.emailPlaceholder']()}
						required
						bind:value={email}
					/>
				</Field.Field>

				<Field.Field>
					<Field.Label>{m['AuthFeature.VerifyEmailForm.verificationCode']()}</Field.Label>
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

				{#if auth.error}
					<p class="text-sm font-medium text-red-500">
						{m[ERROR_MESSAGE_KEYS[auth.error]]()}
					</p>
				{/if}

				<Field.Field>
					<Button type="submit" disabled={auth.submitting || otp.length < 6}>
						{#if auth.submitting}
							<Spinner />
						{/if}
						{m['AuthFeature.VerifyEmailForm.verifyEmail']()}
					</Button>
				</Field.Field>
			</Field.Group>
		</form>
	</Card.Content>

	<Card.Footer class="flex justify-center">
		<Field.Description class="flex items-center justify-center gap-2">
			<span>{m['AuthFeature.VerifyEmailForm.didntReceiveCode']()}</span>
			<Button
				variant="outline"
				size="sm"
				type="button"
				disabled={auth.submitting || resendCooldown > 0 || email.length === 0}
				onclick={handleResend}
			>
				{#if resendCooldown > 0}
					{m['AuthFeature.VerifyEmailForm.resendCodeIn']({ seconds: resendCooldown })}
				{:else}
					{m['AuthFeature.VerifyEmailForm.resendCode']()}
				{/if}
			</Button>
		</Field.Description>
	</Card.Footer>

	<Card.Footer class="flex justify-center">
		<Field.Description>
			<a href={UNPROTECTED_PAGE_ENDPOINTS.SIGN_IN} class="text-sm font-medium"
				>{m['AuthFeature.VerifyEmailForm.backToSignIn']()}</a
			>
		</Field.Description>
	</Card.Footer>
</Card.Root>
