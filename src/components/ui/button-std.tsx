import { component$ } from '@builder.io/qwik';

interface ItemProps {
  title: string;
  classText?: string;
  handleFunction?: any;
  noBackground?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const ButtonStd = component$((props: ItemProps) => {
  return (
    <button
      type={props.type ?? 'button'}
      onClick$={props.handleFunction}
      class={
        (props.classText ? props.classText + ' ' : '') +
        'inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold tracking-tight transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 '
      }
    >
      <span>{props.title}</span>
    </button>
  );
});
