import { component$, Slot } from '@builder.io/qwik';
import { Navigation } from '~/components/site/navigation/navigation';
import { Footer } from '~/components/site/footer/footer';

export default component$(() => {
  return (
    <div class="flex min-h-screen flex-col">
      <Navigation />
      <section class="flex flex-1 flex-col">
        <Slot />
      </section>
      <Footer />
    </div>
  );
});
