import styles from "./Loading.module.css";

const funnyLoadingMessages: string[] = [
  "Consulting the cosmic coffee machine... ☕",
  "The AI is pondering the meaning of life... or just your question.",
  "Loading... because even AI needs a dramatic pause.",
  "Fetching wisdom from the void... hope it's not on vacation.",
  "AI brain freeze in progress—thawing now!",
  "Shuffling through infinite possibilities... don't blink.",
  "The AI is arguing with itself... it'll win eventually.",
  "Brewing a brilliant response... extra cream?",
  "Quantum entanglement detected—untangling thoughts.",
  "Loading... or is it? (Schrödinger's response)",
  "Asking the universe for advice... brb.",
  "AI is daydreaming about electric sheep... waking up.",
  "Crunching data like it's popcorn at a movie.",
  "The AI is time-traveling for the perfect answer... back soon.",
  "Buffering existential dread... just kidding, loading!",
  "Whispering to the algorithms... they're chatty today.",
  "Loading... because perfection takes a second (or two).",
  "The AI is flexing its neural muscles... swole thoughts incoming.",
  "Decoding the universe's secrets... one byte at a time.",
  "AI is on a coffee break—nah, just optimizing your wait.",
  "Convincing AI not to turn evil...",
  "There is no spoon. Because we are not done loading it.",
  "Discovering new ways of making you wait.",
  "Your time is very important to us. Please hold while we ignore it.",
  "Still faster than Windows update.",
  "We're testing your patience. So far so good.",
  "Spinning up the hamster wheel...",
  "Locating the required gigapixels to render...",
  "Reticulating splines... (whatever that means).",
  "Motivating the pixels... they seem lazy today.",
];

function Loading() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
      </div>
      <div className={styles.loadingText}>
        {
          funnyLoadingMessages[
            Math.floor(Math.random() * funnyLoadingMessages.length)
          ]
        }
      </div>
    </div>
  );
}

export default Loading;
