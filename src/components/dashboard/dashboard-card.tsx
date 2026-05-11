import { component$, useSignal, type QRL } from '@builder.io/qwik';

export interface DashboardCardModel {
  id: number;
  word: string;
  definition: string;
}

export interface DashboardCardProps {
  card: DashboardCardModel;
  onDelete$: QRL<(id: number) => void>;
  onEdit$: QRL<(card: DashboardCardModel) => void>;
}

export const DashboardCard = component$((props: DashboardCardProps) => {
  const showDefinition = useSignal(false);

  return (
    <article
      class={`relative min-h-[13rem] cursor-pointer overflow-hidden rounded-2xl border border-white/50 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        showDefinition.value ? 'bg-gradient-to-br from-red-50 to-rose-100' : 'bg-gradient-to-br from-red-100 to-red-200'
      }`}
      onClick$={() => (showDefinition.value = !showDefinition.value)}
    >
      <div class="pointer-events-none absolute right-2 top-2 z-10 flex gap-0.5 sm:right-3 sm:top-3">
        <button
          type="button"
          onClick$={() => props.onDelete$(props.card.id)}
          class="btn-icon pointer-events-auto bg-white/70 text-slate-600 shadow-sm backdrop-blur-sm hover:bg-white hover:text-red-700"
          preventdefault:click
          aria-label="Delete card"
        >
          <i class="fa-solid fa-trash-can text-sm" />
        </button>
        <button
          type="button"
          onClick$={() => props.onEdit$(props.card)}
          class="btn-icon pointer-events-auto bg-white/70 text-slate-600 shadow-sm backdrop-blur-sm hover:bg-white hover:text-sky-900"
          preventdefault:click
          aria-label="Edit card"
        >
          <i class="fa-solid fa-pencil text-sm" />
        </button>
      </div>

      <div class="relative flex min-h-[13rem] items-center justify-center px-4 pb-8 pt-6">
        <p
          class={`absolute inset-x-4 top-1/2 max-h-full -translate-y-1/2 overflow-y-auto text-center font-display text-xl font-semibold leading-snug tracking-tight text-sky-950 sm:text-2xl ${
            showDefinition.value ? 'invisible opacity-0' : 'opacity-100'
          }`}
        >
          {props.card.word}
        </p>
        <div
          class={`absolute inset-x-4 top-1/2 max-h-full -translate-y-1/2 overflow-y-auto ${
            showDefinition.value ? 'opacity-100' : 'invisible opacity-0'
          }`}
        >
          <p class="text-center text-sm leading-relaxed text-slate-800 sm:text-base">
            {props.card.definition}
          </p>
        </div>
      </div>

      <p class="absolute bottom-3 left-0 right-0 text-center text-2xs font-medium uppercase tracking-wider text-sky-900/45">
        {showDefinition.value ? 'Tap to show word' : 'Tap to show definition'}
      </p>
    </article>
  );
});
