import { component$, $, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { ButtonStd } from '~/components/ui/button-std';
import type { DocumentHead } from '@builder.io/qwik-city';
import { useNavigate } from '@builder.io/qwik-city';
import { supabase } from '~/utils/supabase';
import { Navigation } from '~/components/site/navigation/navigation';
import { DashboardCard, type DashboardCardModel } from '~/components/dashboard/dashboard-card';

interface NewCardType {
  id?: number;
  word: string;
  definition: string;
}

type CardType = DashboardCardModel;

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

  const fetchCards = $(async () => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', user.value.id)
      .order('id', { ascending: true });
    if (error) {
      console.log('error', error);
    } else {
      cardsSignal.value = [...data];
    }
  });

  const fetchUserProfile = $(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      console.log('error', error);
      return;
    }
    const authId = data.user.id;
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authId)
      .maybeSingle();

    if (profileError) {
      console.log('profileError', profileError);
    }

    // Cards use auth user id; a profiles row may not exist yet on a fresh project.
    user.value = profile ? { ...profile, id: authId } : { id: authId };
    fetchCards();
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

  const closeModal = $(async () => {
    errorTextSignal.value = '';
    isShowModal.value = false;
    isShowEditModal.value = false;
  });

  const addCard = $(async (cardText: { word: string; definition: string }) => {
    errorTextSignal.value = '';
    const word = cardText.word.trim();
    const definition = cardText.definition.trim();
    if (!word.length || !definition.length) {
      errorTextSignal.value = 'Please enter both a word and a definition.';
      return;
    }
    if (!user.value?.id) {
      errorTextSignal.value = 'Could not load your account. Try refreshing the page.';
      return;
    }
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
  });

  const editCard = $(async (cardText: { word: string; definition: string }) => {
    errorTextSignal.value = '';
    const word = cardText.word.trim();
    const definition = cardText.definition.trim();
    if (!word.length || !definition.length) {
      errorTextSignal.value = 'Please enter both a word and a definition.';
      return;
    }
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
  });

  const deleteCard = $(async (id: number) => {
    try {
      await supabase.from('cards').delete().eq('id', id);
      cardsSignal.value = cardsSignal.value.filter((x) => x.id != id);
    } catch (error) {
      console.log('error', error);
    }
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
          {errorTextSignal.value && (
            <p class="mb-4 rounded bg-red-100 px-3 py-2 text-sm text-red-800">{errorTextSignal.value}</p>
          )}
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
              type="submit"
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
              handleFunction={$(() => {
                errorTextSignal.value = '';
                isShowModal.value = !isShowModal.value;
              })}
              classText="text-sky-900 bg-red-200 shadow font-semibold hover:bg-red-100 my-5"
            />
            <h1 class="text-3xl my-5">Your Cards</h1>
            <div class="grid grid-cols-3 gap-4">
              {cardsSignal.value.map((card) => (
                <DashboardCard
                  key={card.id}
                  card={card}
                  onDelete$={deleteCard}
                  onEdit$={setEditCard}
                />
              ))}
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
