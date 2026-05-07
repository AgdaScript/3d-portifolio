import * as THREE from 'three';

/**
 * position: [x, y, z] (offset em relacao a posicao base do Avatar)
 * rotation: [x, y, z] (offset em radianos, relacao a rotacao base do Avatar)
 *
 * playback.mode:
 * - "full": executa ate o fim do clip
 * - "limit": executa por durationSeconds e avanca
 * - "loop": fica em loop (se tiver durationSeconds, loopa por esse tempo e avanca)
 *
 * transition.type:
 * - "fade": usa fade entre clips
 * - "none": troca instantanea
 */
export const AVATAR_ANIMATION_SEQUENCE = [
  {
    id: 'greeting',
    clip: 'Greeting',
    transform: {
      position: [-0.65, 0, -0.35],
      rotation: [0, 0, 0],
    },
    playback: { mode: 'full' },
    transition: { type: 'fade', duration: 0.35 },
    nextId: 'leftTurn',
  },
  {
    id: 'leftTurn',
    clip: 'LeftTurn',
    transform: {
      position: [0, 0, 0],
      // rotation: [0, Math.PI / 2, 0],
    },
    playback: { mode: 'full' },
    transition: { type: 'fade', duration: 0.35 },
    nextId: 'standToSit',
  },
  {
    id: 'standToSit',
    clip: 'StandToSit',
    transform: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
    },
    playback: { mode: 'full' },
    transition: { type: 'fade', duration: 0.35 },
    nextId: 'typing',
  },
  {
    id: 'typing',
    clip: 'Typing',
    transform: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
    },
    playback: { mode: 'loop' },
    transition: { type: 'fade', duration: 0.35 },
    autoAdvance: false,
  },
];
