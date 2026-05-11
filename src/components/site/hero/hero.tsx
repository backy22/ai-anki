import { component$, useSignal, $, useStore } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export const Hero = component$(() => {
  const newCard = useStore({ word: '', definition: '' });
  const language = useSignal('English');

  const translate = $(async () => {
    if (!newCard.word) {
      return;
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_OPEN_AI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Please translate ${newCard.word} in ${language.value}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 60,
        frequency_penalty: 0.8,
      }),
    };

    const response = await fetch(`${import.meta.env.VITE_OPEN_AI_URL}`, options);
    const json = await response.json();
    const data = json.choices[0].message.content.trim();
    newCard.definition = data;
  });

  return (
    <section class="min-h-[calc(100svh-4rem)] w-full bg-gradient-to-b from-red-100 via-red-50 to-slate-100 py-14 sm:py-20">
      <div class="mx-auto max-w-xl px-4 sm:px-6">
        <div class="mb-8 text-center sm:mb-10">
          <h1 class="font-display text-3xl font-semibold tracking-tight text-sky-950 sm:text-4xl">
            Build decks with AI
          </h1>
          <p class="mt-3 text-base text-slate-600 sm:text-lg">
            Add a word, pick a language, and let AI suggest a translation — then save cards after you sign up.
          </p>
        </div>

        <div class="rounded-2xl border border-red-200/80 bg-white/90 p-6 shadow-card backdrop-blur-sm sm:p-8">
          <form class="space-y-5" preventdefault:submit>
            <div>
              <label class="ui-label" for="hero-word">
                New word or phrase
              </label>
              <textarea
                class="ui-textarea border-red-100 focus:border-sky-500 focus:ring-sky-500/20"
                id="hero-word"
                placeholder="e.g. perseverance"
                value={newCard.word}
                onInput$={(_, el) => (newCard.word = el.value)}
              />
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div class="min-w-0 flex-1">
                <label class="ui-label" for="hero-language">
                  Translate to
                </label>
                <select
                  id="hero-language"
                  class="ui-select border-red-100"
                  onChange$={(_, el) => (language.value = el.value)}
                >
                  <option value="English">English</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Korean">Korean</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </select>
              </div>
              <button
                type="button"
                preventdefault:click
                onClick$={$(() => translate())}
                class="btn-primary shrink-0 sm:min-w-[8.5rem]"
              >
                Translate
              </button>
            </div>

            <div>
              <label class="ui-label" for="hero-definition">
                Definition
              </label>
              <textarea
                class="ui-textarea border-red-100 focus:border-sky-500 focus:ring-sky-500/20"
                id="hero-definition"
                placeholder="Translation or your own definition"
                value={newCard.definition}
                onInput$={(_, el) => (newCard.definition = el.value)}
              />
            </div>

            <div class="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/signup"
                class="btn-primary inline-flex w-full justify-center text-center sm:w-auto sm:min-w-[12rem]"
              >
                Create an account
              </Link>
              <Link
                href="/login"
                class="btn-secondary inline-flex w-full justify-center text-center sm:w-auto sm:min-w-[10rem]"
              >
                Log in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
});
