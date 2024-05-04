import { component$, useSignal, $, useStore } from '@builder.io/qwik';
import { ButtonStd } from '~/components/ui/button-std';
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
    <section class="py-24 w-full bg-red-100 shadow-xl h-svh">
      <div class="w-full">
        <form class="px-8 pt-6 pb-8 mb-4">
          <div class="mb-4">
            <label class="block text-sky-900 text-sm font-semibold mb-2" for="username">
              New word
            </label>
            <textarea
              class="shadow appearance-none border h-28 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-wrap"
              id="word"
              value={newCard.word}
              onInput$={(_, el) => (newCard.word = el.value)}
            />
          </div>
          <div class="my-4">
            <label class="mr-2">Select language and translate or add your own definition</label>
            <select id="language" onChange$={(_, el) => (language.value = el.value)} class="border">
              <option value="English" selected>
                English
              </option>
              <option value="Japanese">Japanese</option>
              <option value="Korean">Korean</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </select>
            <button
              preventdefault:click
              onClick$={$(() => translate())}
              class="ml-2 border-2 border-sky-800 rounded-sm transition-all duration-300 px-4 py-2  hover:bg-sky-900 hover:text-white"
            >
              Translate
            </button>
          </div>
          <div class="mb-6">
            <label class="block text-sky-900 text-sm font-semibold mb-2" for="password">
              Definition
            </label>
            <textarea
              class="shadow appearance-none border h-28 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="definition"
              value={newCard.definition}
              onInput$={(_, el) => (newCard.definition = el.value)}
            />
          </div>
          <div class="flex justify-center">
            <Link href="/signup">
              <ButtonStd
                title="Register"
                classText="bg-sky-800 hover:bg-sky-900 mt-5 shadow-xl hover:shadow-none text-white"
              />
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
});
