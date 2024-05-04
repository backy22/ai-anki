import { component$, useVisibleTask$, useSignal } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { useNavigate } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';
import { supabase } from '~/utils/supabase';

export default component$(() => {
  const isProtectedOk = useSignal(false);
  const nav = useNavigate();

  useVisibleTask$(() => {
    const timeout = setTimeout(async () => {
      const { data, error } = await supabase.auth.getUser();

      if (data?.user?.id && !error) {
        isProtectedOk.value = true;
        await nav('/users/dashboard');
      } else {
        console.error(error);
        await nav('/login');
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  });

  return (
    <>
      <div>
        {isProtectedOk && (
          <>
            <span>Redirecting to </span>
            <Link href="/users/dashboard">
              <button class="text-sky-500 hover:text-sky-600">Dashboard</button>
            </Link>
          </>
        )}
        {!isProtectedOk && <>Please log in</>}
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: 'Staging',
  meta: [
    {
      name: 'description',
      content: 'Authorization check for Code Raiders',
    },
  ],
};
