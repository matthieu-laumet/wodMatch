type Guard = (go: () => void) => void;

let current: Guard | null = null;

// L'écran d'édition enregistre son garde ici (null quand il disparaît)
export const setLeaveGuard = (g: Guard | null) => {
  current = g;
};

// À utiliser pour toute navigation qui peut quitter un écran avec des modifications
export const navigateGuarded = (go: () => void) => (current ? current(go) : go());