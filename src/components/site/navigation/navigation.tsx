import { component$, useVisibleTask$, useSignal, $ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import { ButtonStd } from '~/components/ui/button-std';
import { Link } from '@builder.io/qwik-city';
import { supabase } from '~/utils/supabase';

export const Navigation = component$(() => {
  const isProtectedOk = useSignal(false);
  const nav = useNavigate();

  const fetchUser = $(async () => {
    const { data, error } = await supabase.auth.getUser();

    if (data?.user?.id && !error) {
      isProtectedOk.value = true;
    } else {
      isProtectedOk.value = false;
    }
  });

  useVisibleTask$(() => {
    fetchUser();
  });

  const handleLogout = $(async () => {
    supabase.auth.signOut();
    isProtectedOk.value = false;
    await nav('/login');
  });

  return (
    <header class="sticky top-0 z-40 border-b border-sky-900/10 bg-white/90 backdrop-blur-md">
      <nav class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" class="group flex items-center gap-2">
          <span class="font-display text-xl font-semibold tracking-tight text-sky-950 transition-colors group-hover:text-sky-800">
            AI Anki
          </span>
        </Link>
        <div class="flex items-center gap-2 sm:gap-3">
          {isProtectedOk.value && (
            <ButtonStd
              title="Log out"
              classText="btn-ghost border-0 text-sky-900 hover:bg-sky-50"
              handleFunction={$(() => handleLogout())}
            />
          )}
          {!isProtectedOk.value && (
            <>
              <Link href="/login" class="btn-secondary px-4 py-2 text-sm shadow-none">
                Log in
              </Link>
              <Link
                href="/signup"
                class="inline-flex items-center justify-center rounded-lg bg-red-200 px-4 py-2 text-sm font-semibold text-sky-950 shadow-sm transition-colors hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
});
