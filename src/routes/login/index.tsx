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
    <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/">
          <div class="bg-red-200 rounded-full h-24 w-24 mx-auto">
            <img class="w-24 h-24 mx-auto" src={'/img/icon.png'} />
          </div>
        </Link>
        <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Log in</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link href="/signup" class="font-medium text-sky-900 hover:text-sky-800">
            create an account
          </Link>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-sm sm:px-10">
          <form
            preventdefault:submit
            onSubmit$={handleEmailLogin}
            class="space-y-6"
            action="#"
            method="POST"
          >
            <div>
              <label class="block text-sm font-medium text-gray-700">Email address</label>
              <div class="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  class="block w-full appearance-none rounded-sm border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
                />
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="text-sm">
                <Link href="/contact" class="font-medium text-sky-900 hover:text-sky-800">
                  Problems signing in?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                class="transition-all duration-300 flex w-full justify-center rounded-sm border border-transparent bg-sky-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-800 disabled:bg-gray-500 disabled:hover:bg-gray-500 focus:ring-offset-2"
              >
                Log in
              </button>
              <p class="text-xs text-center text-gray-500 mt-1">
                No password required. Authorize via email.
              </p>
            </div>
          </form>
          <Message message={message} classText="mt-3" />
        </div>
      </div>
    </div>
  );
});
