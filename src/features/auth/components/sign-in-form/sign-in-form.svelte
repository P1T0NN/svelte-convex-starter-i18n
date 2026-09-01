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
	import PasswordInput from '@/components/ui/custom-components/password-input/password-input.svelte';
	import { Spinner } from '@/components/ui/spinner/index.js';

	// DATA
	import { ERROR_MESSAGE_KEYS } from '@/shared/features/auth/data/authData';

	// TYPES
	import type { ComponentProps } from 'svelte';

	type SignInFormProps = ComponentProps<typeof Card.Root>;

	let { ...restProps }: SignInFormProps = $props();

	const auth = useAuth();

	let email = $state('');
	let password = $state('');

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		await auth.signInWithEmail(email, password);
	}

	async function handleGoogleSignIn() {
		await auth.signInWithGoogle();
	}
</script>

<Card.Root class="w-full max-w-sm" {...restProps}>
	<Card.Header>
		<Card.Title>{m['AuthFeature.SignInForm.welcomeBack']()}</Card.Title>
		<Card.Description>{m['AuthFeature.SignInForm.loginDescription']()}</Card.Description>
	</Card.Header>

	<Card.Content>
		<form onsubmit={handleSubmit}>
			<Field.Group>
				<Field.Field>
					<Field.Label for="email">{m['AuthFeature.SignInForm.email']()}</Field.Label>
					<EmailInput id="email" required bind:value={email} />
				</Field.Field>

				<Field.Field>
					<Field.Label for="password">{m['AuthFeature.SignInForm.password']()}</Field.Label>
					<PasswordInput id="password" required bind:value={password} />

					<Field.Description class="flex items-center justify-between">
						<span>{m['AuthFeature.SignInForm.rememberSession']()}</span>
						<a href={UNPROTECTED_PAGE_ENDPOINTS.FORGOT_PASSWORD}
							>{m['AuthFeature.SignInForm.forgotYourPassword']()}</a
						>
					</Field.Description>
				</Field.Field>

				{#if auth.error}
					<p class="text-sm font-medium text-red-500">
						{m[ERROR_MESSAGE_KEYS[auth.error]]()}
					</p>
				{/if}

				<Field.Group>
					<Field.Field>
						<Button type="submit" disabled={auth.submitting}>
							{#if auth.submitting}
								<Spinner />
							{/if}
							{m['AuthFeature.SignInForm.signIn']()}
						</Button>
						<Button
							variant="outline"
							type="button"
							disabled={auth.submitting}
							onclick={handleGoogleSignIn}
							>{m['AuthFeature.SignInForm.continueWithGoogle']()}</Button
						>

						<Field.Description class="px-6 text-center">
							{m['AuthFeature.SignInForm.noAccount']()}
							<a href={UNPROTECTED_PAGE_ENDPOINTS.SIGN_UP}>{m['AuthFeature.SignInForm.signUp']()}</a
							>
						</Field.Description>
					</Field.Field>
				</Field.Group>
			</Field.Group>
		</form>
	</Card.Content>
</Card.Root>
