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
    <div
      class={`relative rounded overflow-hidden shadow-lg h-52 p-4 ${
        showDefinition.value ? 'bg-gradient-to-l' : 'bg-gradient-to-r'
      } from-red-100 to-red-200 text-sky-900`}
      onClick$={() => (showDefinition.value = !showDefinition.value)}
    >
      <p
        class={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full text-center ${
          showDefinition.value ? 'invisible' : 'visible'
        }`}
      >
        {props.card.word}
      </p>
      <div
        class={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full overflow-y-auto flex justify-center max-h-52 ${
          showDefinition.value ? 'visible' : 'invisible'
        }`}
      >
        <p>{props.card.definition}</p>
      </div>
      <div class="flex gap-2 justify-end">
        <button onClick$={() => props.onDelete$(props.card.id)} class="ml-2" preventdefault:click>
          <i class="fa-solid fa-trash-can" />
        </button>
        <button onClick$={() => props.onEdit$(props.card)} class="ml-2" preventdefault:click>
          <i class="fa-solid fa-pencil" />
        </button>
      </div>
    </div>
  );
});
