import { atom } from 'jotai';

/**
 * Controls the open/closed state of the Control Center sheet (drawer).
 */
export const isControlCenterOpenAtom = atom(false);

/**
 * Controls if the AppHeader should be in immersive mode (e.g., for games).
 * In immersive mode, the header might only show essential controls and have no background.
 */
export const isImmersiveModeAtom = atom(false);

