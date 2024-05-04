import { component$ } from '@builder.io/qwik';

export const Footer = component$(() => {
  return (
    <footer class="bg-gray-900">
      <div class="mx-auto w-full overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
        <p class="text-center text-base text-gray-400">&copy; 2024 Aya Tsubakino</p>
      </div>
    </footer>
  );
});
