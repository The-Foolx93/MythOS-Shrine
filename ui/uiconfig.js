// ui/config.js

// IDs must match the <section id="…"> in index.html.
// Titles populate the sidebar and search.
export const SECTIONS = [
  { id: 'history-panel',      title: 'Easter-Egg Origins & Cinematic Highlights' },
  { id: 'visuals-cryptics',   title: 'Visuals & Cryptics' },
  { id: 'achievements-panel', title: 'Achievements' },
  { id: 'fools-quest',        title: 'The Fool’s Quest' },
];

// Each achievement fires a toast on page load.
// Make sure you have matching icon files in ui/images/.
export const ACHIEVEMENTS = [
  {
    id:    'origin-egg',
    label: 'Origin Egg Found',
    icon:  'images/egg-icon.png'
  },
  {
    id:    'eeaao-oscars',
    label: 'Oscar Sweep',
    icon:  'images/oscar-icon.png'
  },
  {
    id:    'fools-quest',
    label: 'Fool’s Quest Complete',
    icon:  'images/fool-icon.png'
  },
  {
    id:    'sovereign',
    label: 'I am Sovereign',
    icon:  'images/sovereign-icon.png'
  }
];
