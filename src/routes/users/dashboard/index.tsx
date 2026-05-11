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
      <>
        <div
          class="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-[2px]"
          onClick$={() => closeModal()}
          aria-hidden="true"
        />
        <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6">
          <div
            class="relative mt-8 w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 text-sky-900 shadow-modal sm:mt-0 sm:p-8"
          >
            <button
              type="button"
              class="btn-ghost absolute right-3 top-3 text-slate-500 hover:text-slate-800"
              onClick$={closeModal}
            >
              Close
            </button>
            <h2 class="font-display pr-16 text-2xl font-semibold tracking-tight text-sky-950">{title}</h2>
            <form class="mt-8 space-y-5" preventdefault:submit onSubmit$={() => onSumit()}>
              {errorTextSignal.value && (
                <p
                  role="alert"
                  class="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-900"
                >
                  {errorTextSignal.value}
                </p>
              )}
              <div>
                <label class="ui-label" for="word">
                  {action === 'edit' ? 'Word' : 'New word'}
                </label>
                <textarea
                  class="ui-textarea border-red-100"
                  id="word"
                  value={newCard.word}
                  onInput$={(_, el) => (newCard.word = el.value)}
                />
              </div>
              <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div class="min-w-0 flex-1">
                  <label class="ui-label" for="language">
                    Translate to
                  </label>
                  <select
                    id="language"
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
                  class="btn-primary shrink-0 sm:min-w-[8rem]"
                >
                  Translate
                </button>
              </div>
              <div>
                <label class="ui-label" for="definition">
                  Definition
                </label>
                <textarea
                  class="ui-textarea border-red-100"
                  id="definition"
                  value={newCard.definition}
                  onInput$={(_, el) => (newCard.definition = el.value)}
                />
              </div>
              <div class="flex justify-end border-t border-slate-100 pt-2">
                <ButtonStd title="Save card" type="submit" classText="btn-primary min-w-[9rem]" />
              </div>
            </form>
          </div>
        </div>
      </>
    );
  };

  return (
    <main>
      <Navigation />
      {isShow.value && (
        <div class="min-h-screen bg-sky-900 pb-16 text-white">
          {isShowModal.value && modal('register')}
          {isShowEditModal.value && modal('edit')}
          <div class="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8 lg:pt-10">
            <header class="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 class="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Your cards
                </h1>
                <p class="mt-2 max-w-xl text-sm leading-relaxed text-sky-200/95">
                  Tap a card to flip between word and definition. Use the icons to edit or delete.
                </p>
              </div>
              <ButtonStd
                title="Add card"
                handleFunction={$(() => {
                  errorTextSignal.value = '';
                  isShowModal.value = !isShowModal.value;
                })}
                classText="btn-primary shrink-0 bg-red-200 font-semibold text-sky-950 shadow-md hover:bg-red-100 hover:text-sky-950"
              />
            </header>

            {cardsSignal.value.length === 0 ? (
              <div class="rounded-2xl border border-sky-700/50 bg-sky-800/40 px-6 py-14 text-center">
                <p class="font-display text-lg text-sky-100">No cards yet</p>
                <p class="mt-2 text-sm text-sky-200/80">Add your first card to start studying.</p>
              </div>
            ) : (
              <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {cardsSignal.value.map((card) => (
                  <DashboardCard
                    key={card.id}
                    card={card}
                    onDelete$={deleteCard}
                    onEdit$={setEditCard}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
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
