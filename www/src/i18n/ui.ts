export const locales = ["pl", "ua", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pl";

/** BCP-47 tags for <html lang> and hreflang ("ua" is the app's internal code) */
export const langTags: Record<Locale, string> = {
  pl: "pl",
  ua: "uk",
  en: "en",
};

export const localePath = (locale: Locale, path = "/") =>
  locale === defaultLocale ? path : `/${locale}${path}`;

export const localeFlags: Record<Locale, { flag: string; name: string }> = {
  pl: { flag: "🇵🇱", name: "Polski" },
  ua: { flag: "🇺🇦", name: "Українська" },
  en: { flag: "🇬🇧", name: "English" },
};

export const ui = {
  pl: {
    "meta.title": "Cera — kalendarz pielęgnacji twarzy",
    "meta.description":
      "Cera pamięta o Twojej rutynie pielęgnacyjnej — rano i wieczorem. Dołącz do listy oczekujących.",
    "a11y.skip": "Przejdź do treści",
    "a11y.langSwitch": "Zmień język",
    "hero.morning": "Rano",
    "hero.evening": "Wieczorem",
    "hero.h1": "Twoja cera ma swój rytm.",
    "hero.sub":
      "Cera pamięta, co i kiedy nałożyć — rano i wieczorem. Ty po prostu dbasz o siebie.",
    "hero.phoneAlt":
      "Aplikacja Cera: kalendarz rutyny na dziś, jasny i ciemny motyw",
    "waitlist.label": "Adres e-mail",
    "waitlist.placeholder": "Twój e-mail",
    "waitlist.cta": "Dołącz do listy",
    "waitlist.sending": "Zapisuję…",
    "waitlist.hint": "Zero spamu. Damy znać, gdy wystartujemy.",
    "waitlist.success": "Jesteś na liście! Do zobaczenia wkrótce.",
    "waitlist.error": "Nie udało się zapisać. Spróbuj jeszcze raz za chwilę.",
    "waitlist.invalid": "Sprawdź adres e-mail.",
    "how.title": "Jak działa Cera?",
    "how.1.title": "Dodaj swoje kosmetyki",
    "how.1.body": "Serum, kremy, kwasy — wszystko, co stoi na Twojej półce.",
    "how.2.title": "Zaplanuj rytm",
    "how.2.body":
      "Codziennie, co trzy dni albo w konkretne dni tygodnia — tak, jak potrzebuje Twoja skóra.",
    "how.3.title": "Odhaczaj rano i wieczorem",
    "how.3.body": "Kalendarz pokazuje, co dziś nałożyć. Ty tylko odhaczasz.",
    "shelf.title": "Półka, która pilnuje terminów",
    "shelf.body":
      "Cera liczy PAO za Ciebie i przypomni, zanim krem się przeterminuje. Koniec z wąchaniem słoiczków.",
    "shelf.imgAlt": "Ekran półki z kosmetykami i datami ważności",
    "freq.title": "Kwas co trzy dni? Ogarnięte.",
    "freq.body":
      "Retinol w poniedziałki i czwartki, peeling co dziesięć dni, reszta codziennie. Cera pamięta cały harmonogram — nawet kiedy Ty nie musisz.",
    "freq.imgAlt":
      "Formularz częstotliwości: codziennie, wybrane dni, interwał",
    "freq.viz.retinol": "Retinol",
    "freq.viz.acid": "Kwas",
    "freq.viz.cream": "Krem",
    "freq.viz.caption": "Dwa tygodnie rutyny w Cerze",
    "final.title": "Zadbaj o swój wieczorny rytuał",
    "final.sub": "Zapisz się — damy Ci znać, gdy Cera będzie gotowa.",
    "footer.privacy": "Polityka prywatności",
    "footer.terms": "Regulamin",
    "footer.copyright": "© 2026 Roksolana Sainchuk",
    "badges.title": "Wkrótce w App Store i Google Play",
  },
  ua: {
    "meta.title": "Cera — календар догляду за шкірою",
    "meta.description":
      "Cera пам'ятає про твою доглядову рутину — вранці та ввечері. Приєднуйся до списку очікування.",
    "a11y.skip": "Перейти до вмісту",
    "a11y.langSwitch": "Змінити мову",
    "hero.morning": "Вранці",
    "hero.evening": "Ввечері",
    "hero.h1": "Твоя шкіра має свій ритм.",
    "hero.sub":
      "Cera пам'ятає, що і коли нанести — вранці та ввечері. Ти просто дбаєш про себе.",
    "hero.phoneAlt":
      "Застосунок Cera: календар рутини на сьогодні, світла й темна тема",
    "waitlist.label": "Адреса e-mail",
    "waitlist.placeholder": "Твій e-mail",
    "waitlist.cta": "Приєднатися",
    "waitlist.sending": "Записую…",
    "waitlist.hint": "Жодного спаму. Повідомимо, коли запустимось.",
    "waitlist.success": "Ти в списку! До зустрічі незабаром.",
    "waitlist.error": "Не вдалося записатися. Спробуй ще раз за хвилину.",
    "waitlist.invalid": "Перевір адресу e-mail.",
    "how.title": "Як працює Cera?",
    "how.1.title": "Додай свою косметику",
    "how.1.body": "Сироватки, креми, кислоти — усе, що стоїть на твоїй полиці.",
    "how.2.title": "Сплануй ритм",
    "how.2.body":
      "Щодня, раз на три дні або в певні дні тижня — так, як потребує твоя шкіра.",
    "how.3.title": "Відмічай вранці та ввечері",
    "how.3.body": "Календар показує, що нанести сьогодні. Ти просто відмічаєш.",
    "shelf.title": "Полиця, що стежить за термінами",
    "shelf.body":
      "Cera рахує PAO за тебе й нагадає, перш ніж крем зіпсується. Жодного нюхання баночок.",
    "shelf.imgAlt": "Екран полиці з косметикою та термінами придатності",
    "freq.title": "Кислота раз на три дні? Без проблем.",
    "freq.body":
      "Ретинол по понеділках і четвергах, пілінг раз на десять днів, решта — щодня. Cera пам'ятає весь розклад — навіть коли ти не мусиш.",
    "freq.imgAlt": "Форма частоти: щодня, обрані дні, інтервал",
    "freq.viz.retinol": "Ретинол",
    "freq.viz.acid": "Кислота",
    "freq.viz.cream": "Крем",
    "freq.viz.caption": "Два тижні рутини в Cera",
    "final.title": "Подбай про свій вечірній ритуал",
    "final.sub": "Запишись — повідомимо, щойно Cera буде готова.",
    "footer.privacy": "Політика конфіденційності",
    "footer.terms": "Умови користування",
    "footer.copyright": "© 2026 Роксолана Саїнчук",
    "badges.title": "Незабаром в App Store і Google Play",
  },
  en: {
    "meta.title": "Cera — your skincare routine calendar",
    "meta.description":
      "Cera remembers your skincare routine — morning and evening. Join the waitlist.",
    "a11y.skip": "Skip to content",
    "a11y.langSwitch": "Change language",
    "hero.morning": "Morning",
    "hero.evening": "Evening",
    "hero.h1": "Your skin has its own rhythm.",
    "hero.sub":
      "Cera remembers what to apply and when — morning and evening. You just take care of yourself.",
    "hero.phoneAlt":
      "Cera app: today's routine calendar in light and dark theme",
    "waitlist.label": "Email address",
    "waitlist.placeholder": "Your email",
    "waitlist.cta": "Join the waitlist",
    "waitlist.sending": "Signing up…",
    "waitlist.hint": "No spam. We'll tell you when we launch.",
    "waitlist.success": "You're on the list! See you soon.",
    "waitlist.error": "Couldn't sign you up. Try again in a moment.",
    "waitlist.invalid": "Check the email address.",
    "how.title": "How Cera works",
    "how.1.title": "Add your products",
    "how.1.body": "Serums, creams, acids — everything on your shelf.",
    "how.2.title": "Plan your rhythm",
    "how.2.body":
      "Daily, every three days, or specific weekdays — whatever your skin needs.",
    "how.3.title": "Check off, morning & evening",
    "how.3.body":
      "The calendar shows what to apply today. You just tick it off.",
    "shelf.title": "A shelf that watches expiry dates",
    "shelf.body":
      "Cera counts PAO for you and nudges you before a cream goes off. No more jar-sniffing.",
    "shelf.imgAlt": "Product shelf screen with expiry dates",
    "freq.title": "Acids every third day? Handled.",
    "freq.body":
      "Retinol on Mondays and Thursdays, a peel every ten days, the rest daily. Cera keeps the whole schedule — even when you don't have to.",
    "freq.imgAlt": "Frequency form: daily, specific days, interval",
    "freq.viz.retinol": "Retinol",
    "freq.viz.acid": "Acid",
    "freq.viz.cream": "Cream",
    "freq.viz.caption": "Two weeks of a routine in Cera",
    "final.title": "Protect your evening ritual",
    "final.sub": "Sign up — we'll tell you the moment Cera is ready.",
    "footer.privacy": "Privacy policy",
    "footer.terms": "Terms of service",
    "footer.copyright": "© 2026 Roksolana Sainchuk",
    "badges.title": "Coming soon to the App Store and Google Play",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type UIKey = keyof (typeof ui)["pl"];

export const t = (locale: Locale) => (key: UIKey) =>
  (ui[locale][key] ?? ui[defaultLocale][key]) as string;
