import { component$, $, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { ButtonStd } from '~/components/ui/button-std';
import type { DocumentHead } from '@builder.io/qwik-city';
import { useNavigate } from '@builder.io/qwik-city';
import { supabase } from '~/utils/supabase';
import { Navigation } from '~/components/site/navigation/navigation';

interface NewCardType {
  id?: number;
  word: string;
  definition: string;
}

interface CardType {
  id: number;
  word: string;
  definition: string;
}

export default component$(() => {
  const isShow = useSignal(true);
  const isShowModal = useSignal(false);
  const isShowEditModal = useSignal(false);
  const cardsSignal = useSignal<CardType[]>([]);
  const newCard = useStore<NewCardType>({ word: '', definition: '' });
  const language = useSignal('English');
  const errorTextSignal = useSignal('');
  const user = useSignal<any>(null);
  const nav = useNavigate();

  const fetchUserProfile = $(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.log('error', error);
    } else {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id);
      if (profileError) {
        console.log('profileError', profileError);
      } else {
        user.value = profile[0];
      }
    }
  });

  useVisibleTask$(() => {
    fetchUserProfile();
    const timeout = setTimeout(async () => {
      const { data, error } = await supabase.auth.getUser();

      if (data?.user?.id && !error) {
        isShow.value = true;
      } else {
        console.error(error);
        await nav('/login');
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  });

  const fetchCards = $(async () => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('id', { ascending: true });
    if (error) {
      console.log('error', error);
    } else {
      cardsSignal.value = [...data];
    }
  });

  const closeModal = $(async () => {
    isShowModal.value = false;
    isShowEditModal.value = false;
  });

  const addCard = $(async (cardText: { word: string; definition: string }) => {
    const word = cardText.word.trim();
    const definition = cardText.definition.trim();
    if (word.length && definition.length && user.value?.id) {
      const { data: card, error } = await supabase
        .from('cards')
        .insert({ word, definition, user_id: user.value.id })
        .select()
        .single();

      if (error) {
        errorTextSignal.value = error.message;
      } else {
        cardsSignal.value = [...cardsSignal.value, card];
        newCard.word = '';
        newCard.definition = '';
        closeModal();
      }
    }
  });

  const editCard = $(async (cardText: { word: string; definition: string }) => {
    const word = cardText.word.trim();
    const definition = cardText.definition.trim();
    if (word.length && definition.length) {
      const { data: card, error } = await supabase
        .from('cards')
        .update({ word, definition })
        .eq('id', newCard.id)
        .select()
        .single();

      if (error) {
        errorTextSignal.value = error.message;
      } else {
        cardsSignal.value = cardsSignal.value.map((x) => (x.id === card.id ? card : x));
        newCard.word = '';
        newCard.definition = '';
        closeModal();
      }
    }
  });

  const deleteCard = $(async (id: number) => {
    try {
      await supabase.from('cards').delete().eq('id', id);
      cardsSignal.value = cardsSignal.value.filter((x) => x.id != id);
    } catch (error) {
      console.log('error', error);
    }
  });

  useVisibleTask$(() => {
    fetchCards();
  });

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

  const setEditCard = $(async (card: CardType) => {
    newCard.id = card.id;
    newCard.word = card.word;
    newCard.definition = card.definition;
    isShowEditModal.value = !isShowEditModal.value;
  });

  const displayCard = (card: CardType) => {
    const showDefinition = useSignal(false);

    return (
      <div
        key={card.id}
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
          {card.word}
        </p>
        <div
          class={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full overflow-y-auto flex justify-center max-h-52 ${
            showDefinition.value ? 'visible' : 'invisible'
          }`}
        >
          <p>{card.definition}</p>
        </div>
        <div class="flex gap-2 justify-end">
          <button onClick$={() => deleteCard(card.id)} class="ml-2" preventdefault:click>
            <i class="fa-solid fa-trash-can" />
          </button>
          <button onClick$={() => setEditCard(card)} class="ml-2" preventdefault:click>
            <i class="fa-solid fa-pencil" />
          </button>
        </div>
      </div>
    );
  };

  const modal = (action: string) => {
    const title = action === 'edit' ? 'Edit the card' : 'Add new card';
    const onSumit = $(async () => {
      if (action === 'edit') {
        editCard(newCard);
      } else {
        addCard(newCard);
      }
    });

    return (
      <div class="fixed z-10 inset-0 overflow-y-auto bg-white h-[38rem] w-[60rem] m-auto text-sky-900 p-8">
        <h1 class="text-3xl">{title}</h1>
        <button class="absolute top-8 right-8" onClick$={closeModal}>
          Close
        </button>
        <form class="mt-10" preventdefault:submit onSubmit$={() => onSumit()}>
          <div class="mb-4">
            <label class="block text-sm font-bold mb-2" for="word">
              {action === 'edit' ? 'Word' : 'New word'}
            </label>
            <textarea
              class="border-red-200 shadow appearance-none border h-28 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-wrap"
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
              class="ml-2 border-2 border-sky-900 hover:border-sky-800 rounded-sm transition-all duration-300 px-4 py-2"
            >
              Translate
            </button>
          </div>
          <div class="mb-6">
            <label class="block text-sm font-bold mb-2" for="definition">
              Definition
            </label>
            <textarea
              class="border-red-200 shadow appearance-none border h-28 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="definition"
              value={newCard.definition}
              onInput$={(_, el) => (newCard.definition = el.value)}
            />
          </div>
          <div class="flex justify-center">
            <ButtonStd
              title="Submit"
              classText="border-sky-800 border-2 hover:bg-sky-800 shadow-xl hover:shadow-none hover:text-red-200 font-semibold"
            />
          </div>
        </form>
      </div>
    );
  };

  return (
    <main>
      <Navigation />
      {isShow.value && (
        <div class="text-white bg-sky-900 min-h-screen">
          {isShowModal.value && modal('register')}
          {isShowEditModal.value && modal('edit')}
          <div class="container mx-auto py-7">
            <ButtonStd
              title="Add new card"
              handleFunction={$(() => (isShowModal.value = !isShowModal.value))}
              classText="text-sky-900 bg-red-200 shadow font-semibold hover:bg-red-100 my-5"
            />
            <h1 class="text-3xl my-5">Your Cards</h1>
            <div class="grid grid-cols-3 gap-4">
              {cardsSignal.value.map((card) => {
                return displayCard(card);
              })}
            </div>
          </div>
        </div>
      )}
      {(isShowModal.value || isShowEditModal.value) && (
        <div class="bg-black/70 h-screen w-screen absolute top-0" onClick$={() => closeModal()} />
      )}
    </main>
  );
});

export const head: DocumentHead = {
  title: 'Dashboard',
  meta: [
    {
      name: 'description',
      content: 'users dashboard for AI anki',
    },
  ],
};
