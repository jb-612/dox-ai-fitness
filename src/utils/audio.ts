const greetings = [
  "Welcome to the gym!",
  "Let's get a pump going.",
  "Good to see you here.",
  "Ready for a workout?",
  "Don't forget to stretch.",
  "Light weight, baby!",
  "Form is everything.",
  "Hydrate between sets.",
];

export const playRandomGreeting = () => {
  if (!window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  const utterance = new SpeechSynthesisUtterance(greeting);

  // Try to find a good voice
  const voices = window.speechSynthesis.getVoices();
  const englishVoices = voices.filter((v) => v.lang.startsWith("en"));
  if (englishVoices.length > 0) {
    utterance.voice =
      englishVoices[Math.floor(Math.random() * englishVoices.length)];
  }

  utterance.rate = 0.9 + Math.random() * 0.2;
  utterance.pitch = 0.8 + Math.random() * 0.4;

  window.speechSynthesis.speak(utterance);
};
