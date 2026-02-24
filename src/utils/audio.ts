import * as THREE from "three";

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

let lastSpeechTime = 0;

export const playRandomGreeting = (
  cameraPosition: THREE.Vector3,
  characterPosition: THREE.Vector3,
  muted: boolean,
) => {
  if (muted || !window.speechSynthesis) return;

  const now = Date.now();
  if (now - lastSpeechTime < 2000) return; // Cooldown to prevent spam
  lastSpeechTime = now;

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

  // Calculate spatial volume
  const distance = cameraPosition.distanceTo(characterPosition);
  const maxDistance = 15;
  const volume = Math.max(0, 1 - distance / maxDistance);
  utterance.volume = volume;

  window.speechSynthesis.speak(utterance);
};
