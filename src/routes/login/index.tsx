import { component$, useStore, useSignal, $ } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';
import { validateEmail } from '~/utils/helpers';
import { supabase } from '~/utils/supabase';
import { Message } from '~/components/ui/message';

export default component$(() => {
  const message: any = useStore({ message: undefined, status: 'error' });
  const isLoading = useSignal(false);
  const loc = useLocation();

  // Handle email signup
  const handleEmailLogin = $(async (event: any) => {
    // Initialize resets
    message.message = undefined;
    message.status = 'error';
    isLoading.value = true;

    // Value extraction
    const email = event.target.email.value;
    const isEmailValid = validateEmail(email);

    // Email validation
    if (!isEmailValid) {
      message.message = 'You must have a valid email';
      isLoading.value = false;
      return;
    }

    // Create user in supabase
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: loc.url.href + 'staging',
      },
    });

    // Confirm login
    if (data && !error) {
      message.message = 'Success. Please check your email/spam folder';
      message.status = 'success';
      isLoading.value = false;
      return;
    } else {
      message.message = 'There was a problem creating a user. ' + error?.message;
      isLoading.value = false;
      return;
    }
  });

  return (
    <div class="flex min-h-[calc(100dvh-5rem)] flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" class="block">
          <div class="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-200 shadow-inner ring-4 ring-white">
            <img class="h-20 w-20" width={80} height={80} src={'/img/icon.png'} alt="" />
          </div>
        </Link>
        <h2 class="font-display mt-8 text-center text-3xl font-semibold tracking-tight text-slate-900">
          Log in
        </h2>
        <p class="mt-2 text-center text-sm text-slate-600">
          Or{' '}
          <Link href="/signup" class="font-semibold text-sky-800 underline-offset-4 hover:underline">
            create an account
          </Link>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="rounded-2xl border border-slate-100 bg-white px-5 py-8 shadow-card sm:px-8">
          <form preventdefault:submit onSubmit$={handleEmailLogin} class="space-y-6" action="#" method="POST">
            <div>
              <label class="ui-label" for="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                class="ui-input"
              />
            </div>

            <div class="flex items-center justify-between">
              <Link href="/contact" class="text-sm font-medium text-sky-800 hover:text-sky-900">
                Problems signing in?
              </Link>
            </div>

            <div>
              <button type="submit" class="btn-primary w-full">
                Log in
              </button>
              <p class="mt-2 text-center text-xs text-slate-500">No password — we email you a magic link.</p>
            </div>
          </form>
          <Message message={message} classText="mt-4" />
        </div>
      </div>
    </div>
  );
});
