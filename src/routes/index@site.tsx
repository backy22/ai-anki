import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Hero } from '~/components/site/hero/hero';

export default component$(() => {
  return <Hero />;
});

export const head: DocumentHead = {
  title: 'AI anki',
  meta: [
    {
      name: 'description',
      content: 'make your own vocaburary note with AI',
    },
  ],
};
