import { component$ } from '@builder.io/qwik';

export const Footer = component$(() => {
  return (
    <footer class="mt-auto border-t border-slate-800/80 bg-slate-900">
      <div class="mx-auto max-w-6xl px-4 py-10 text-center sm:px-6">
        <p class="text-sm text-slate-400">&copy; 2024 Aya Tsubakino</p>
      </div>
    </footer>
  );
});
