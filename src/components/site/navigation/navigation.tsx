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
    <nav class="bg-white py-4 px-7 sticky">
      <div class="flex justify-between items-center">
        <Link href="/">
          <div>AI Anki</div>
        </Link>
        <div class="flex items-center text-sm">
          <div class="border-r border-gray-300 h-10 ml-10"></div>
          {/* @ts-ignore */}
          {isProtectedOk.value && (
            <ButtonStd
              title="Logout"
              classText="mr-2 ml-10 border border-sky-800 text-sky-800 hover:text-sky-600 hover:border-sky-600"
              noBackground
              handleFunction={$(() => handleLogout())}
            />
          )}
          {/* @ts-ignore */}
          {!isProtectedOk.value && (
            <>
              <Link href="/login">
                <ButtonStd
                  title="Log In"
                  classText="mr-2 ml-10 border border-sky-800 text-sky-800 hover:text-sky-600 hover:border-sky-600"
                  noBackground
                />
              </Link>
              <Link href="/signup">
                <ButtonStd
                  title="Sign Up"
                  classText="mr-5 ml-5 bg-teal-600 border border-teal-600 hover:bg-teal-500 text-white"
                />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
});
