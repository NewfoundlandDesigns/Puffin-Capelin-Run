/* Languages. English is written in place in the code and data files; this file holds the
   interface text for each language and the French for the level, tutorial, outfit and chatter
   data. t('key', { n: 3 }) gives the text for the current language, falling back to English.
   French is Canadian French (no space before ! ? ;, a space before : and %), in the familiar
   "tu", to match the game's tone. Add a language by adding it to LANGS, TEXT and DATA. */

const LANGS = { en: 'English', fr: 'Français' };
const LANG_KEY = 'capelin-run-lang';

function pickLang() {
  const saved = store.get(LANG_KEY);
  if (saved && LANGS[saved]) return saved;
  const nav = (typeof navigator !== 'undefined' && (navigator.language || '')).toLowerCase();
  return nav.startsWith('fr') ? 'fr' : 'en';
}
let LANG = pickLang();

const plural = (n, one, many) => (n === 1 ? one : many);          // English: 1 fish, 0 fish... 0 deliveries
const pluralFr = (n, one, many) => (n < 2 ? one : many);         // French: 0 and 1 are singular

const TEXT = {
  en: {
    'page.title': 'Beakful: A Puffin Game',
    'stage': 'Beakful, a puffin game',
    'lang': 'Language',
    'hud.score': 'Score', 'hud.beak': 'In beak', 'hud.puffling': 'Puffling', 'hud.full': 'Full',
    'tut.skip': 'Skip tutorial', 'tut.step': 'Step {n} of {total}', 'tut.nice': 'Nice!',
    'tut.doneLevel': 'How to play', 'tut.doneTitle': 'You’re ready',
    'tut.doneText': 'Start with {name}. Each level adds one new danger, and its preview in the level picker shows you what to expect.',
    'tut.replay': 'Replay tutorial',
    'start.subtitle': 'A Puffin Game',
    'start.lede': 'Hold to dive. Let go to rise.',
    'start.intro': 'Your puffling is hungry. Stack capelin in your beak and deliver them to burrows along the way to keep it fed, and make it home by nightfall. Bigger stacks score more; golden capelin count double.',
    'start.chooser': 'Choose a level', 'start.prev': 'Previous level', 'start.next': 'Next level',
    'start.play': 'Play', 'start.how': 'How to play', 'start.howNew': 'New here? How to play', 'start.wardrobe': 'Wardrobe',
    'start.keys': 'Hold with mouse, finger, or space bar. Arrow keys change level. P pauses. M toggles sound.',
    'picker.level': 'Level {n} of {total}', 'picker.best': 'Best {score}', 'picker.lock': 'Finish {name} to unlock',
    'picker.locked': 'Locked', 'picker.playLevel': 'Play {name}', 'picker.dot': 'Level {n}: {name}',
    'level.start': 'Level {n}',
    'end.level': 'Level {n}: {name}', 'end.home': 'Home by nightfall', 'end.nightFalls': 'Night falls',
    'end.seal': 'Caught by a seal', 'end.gull': 'Caught by a gull', 'end.whale': 'Swallowed by a whale', 'end.hungry': 'Puffling too hungry',
    'end.bonus': 'Home bonus {n}. ', 'end.progress': 'Made it {pct}% of the way. ',
    'end.deliveries': v => `${v.n} ${plural(v.n, 'delivery', 'deliveries')}, biggest stack ${v.big}`,
    'end.golden': ', {n} golden capelin.', 'end.period': '.',
    'end.grew': ' Your puffling grew from 40 g to {w} g.',
    'end.again': 'Play again', 'end.choose': 'Choose level', 'end.nextLevel': 'Next level', 'end.next': 'Next: {name}',
    'end.newBest': 'New best score.', 'end.best': 'Your best: {n}', 'end.credit': 'Made in Newfoundland by Fun Puffin',
    'unlock.more': v => `And ${v.n} more in the Wardrobe.`, 'unlock.wear': 'Wear it', 'unlock.wearing': 'Wearing it',
    'ward.title': 'Wardrobe', 'ward.intro': 'Wear one of each. Hover or tap a greyed-out one to see how to earn it.',
    'ward.none': 'None', 'ward.noneLabel': 'No {slot}', 'ward.lockedLabel': '{name}, locked. To earn it: {unlock}',
    'ward.lockedNote': '{name}: {unlock}', 'ward.earn': 'How to earn it: {unlock}',
    'ward.tookOff': 'Took off: {name}.', 'ward.nowWearing': 'Wearing: {name}.',
    'ward.tipWorn': 'Wearing it. Tap to take it off.', 'ward.tipWear': 'Tap to wear it.', 'ward.done': 'Done',
    'pause.title': 'Paused', 'pause.text': 'Your puffin is treading water till you’re back.', 'pause.resume': 'Resume',
    'pause.keys': 'P or Esc pauses and resumes.', 'pause.button': 'Pause',
    'sound.mute': 'Mute sound', 'sound.on': 'Turn sound on',
    'pop.justInTime': 'Just in time!', 'pop.lastChance': 'Last chance! Get fish to a burrow', 'pop.tooHungry': 'Your puffling is too hungry',
    'pop.gulp': 'Gulp!', 'pop.noAir': 'Out of air', 'pop.noAirDrop': 'Out of air. Catch dropped', 'pop.golden': 'Golden capelin',
    'pop.beakFull': 'Beak full. Head for a burrow', 'pop.bonk': 'Bonk', 'pop.sunset': 'Sunset', 'pop.night': 'Night is coming',
    'pop.gullTook': 'A gull took your catch', 'pop.gannet': 'A gannet knocked your catch loose', 'pop.berg': 'Bumped an iceberg',
    'pop.jaeger': 'A jaeger stole your catch', 'pop.whoa': 'Whoa!', 'pop.home': 'Home!', 'pop.homeBonus': '+{n} home bonus',
    'note.capelin': v => `${v.n} capelin`, 'note.golden': v => `${v.n} capelin, golden ×${v.m}`, 'note.best': 'Biggest drop yet',
    'say.phew': 'Phew!', 'say.peckish': 'Getting a bit peckish...',
    'stars.home': 'Make it home by nightfall', 'stars.feed': 'Make it home without your puffling running out of food',
    'retry.again': 'Try again', 'retry.hint': 'Tap anywhere or press Space to try again', 'retry.attempt': 'Attempt {n}',
    'retry.far': '{pct}% of the way \u00b7 best {best}%', 'retry.farthest': '{pct}% of the way \u00b7 farthest yet!',
    'picker.bestBoth': 'Best {score} \u00b7 {pct}%', 'picker.bestFar': 'Best {pct}%',
    'stars.score': 'Score {n}', 'stars.new': 'New', 'stars.of': '{n} of 3 stars', 'stars.total': 'Stars: {n} of {total}'
  },
  fr: {
    'page.title': 'Beakful : un jeu de macareux',
    'stage': 'Beakful, un jeu de macareux',
    'lang': 'Langue',
    'hud.score': 'Pointage', 'hud.beak': 'Au bec', 'hud.puffling': 'Poussin', 'hud.full': 'Plein',
    'tut.skip': 'Passer le tutoriel', 'tut.step': 'Étape {n} sur {total}', 'tut.nice': 'Bravo!',
    'tut.doneLevel': 'Comment jouer', 'tut.doneTitle': 'C’est parti!',
    'tut.doneText': 'Commence par {name}. Chaque niveau ajoute un nouveau danger, et son aperçu te montre à quoi t’attendre.',
    'tut.replay': 'Refaire le tutoriel',
    'start.subtitle': 'Un jeu de macareux',
    'start.lede': 'Maintiens pour plonger. Relâche pour remonter.',
    'start.intro': 'Ton poussin a faim. Empile du capelan dans ton bec et livre-le aux terriers en chemin pour le nourrir, puis rentre avant la nuit. Plus la pile est grosse, plus ça rapporte; le capelan doré compte double.',
    'start.chooser': 'Choisir un niveau', 'start.prev': 'Niveau précédent', 'start.next': 'Niveau suivant',
    'start.play': 'Jouer', 'start.how': 'Comment jouer', 'start.howNew': 'Nouveau? Comment jouer', 'start.wardrobe': 'Garde-robe',
    'start.keys': 'Maintiens avec la souris, le doigt ou la barre d’espacement. Les flèches changent de niveau. P met en pause. M coupe le son.',
    'picker.level': 'Niveau {n} sur {total}', 'picker.best': 'Record {score}', 'picker.lock': 'Termine {name} pour débloquer',
    'picker.locked': 'Verrouillé', 'picker.playLevel': 'Jouer : {name}', 'picker.dot': 'Niveau {n} : {name}',
    'level.start': 'Niveau {n}',
    'end.level': 'Niveau {n} : {name}', 'end.home': 'Rentré avant la nuit', 'end.nightFalls': 'La nuit tombe',
    'end.seal': 'Attrapé par un phoque', 'end.gull': 'Attrapé par un goéland', 'end.whale': 'Avalé par une baleine', 'end.hungry': 'Poussin affamé',
    'end.bonus': 'Prime de retour {n}. ', 'end.progress': 'Tu as fait {pct} % du chemin. ',
    'end.deliveries': v => `${v.n} ${pluralFr(v.n, 'livraison', 'livraisons')}, plus grosse pile ${v.big}`,
    'end.golden': v => `, ${v.n} ${pluralFr(v.n, 'capelan doré', 'capelans dorés')}.`, 'end.period': '.',
    'end.grew': ' Ton poussin est passé de 40 g à {w} g.',
    'end.again': 'Rejouer', 'end.choose': 'Choisir un niveau', 'end.nextLevel': 'Niveau suivant', 'end.next': 'Suivant : {name}',
    'end.newBest': 'Nouveau record!', 'end.best': 'Ton record : {n}', 'end.credit': 'Fait à Terre-Neuve par Fun Puffin',
    'unlock.more': v => `Et ${v.n} ${pluralFr(v.n, 'autre', 'autres')} dans la garde-robe.`, 'unlock.wear': 'Mettre', 'unlock.wearing': 'C’est mis',
    'ward.title': 'Garde-robe', 'ward.intro': 'Porte un article de chaque sorte. Survole ou touche un article grisé pour savoir comment l’obtenir.',
    'ward.none': 'Aucun', 'ward.noneLabel': 'Aucun article : {slot}', 'ward.lockedLabel': '{name}, verrouillé. Pour l’obtenir : {unlock}',
    'ward.lockedNote': '{name} : {unlock}', 'ward.earn': 'Pour l’obtenir : {unlock}',
    'ward.tookOff': 'Enlevé : {name}.', 'ward.nowWearing': 'Tu portes : {name}.',
    'ward.tipWorn': 'Tu le portes. Touche pour l’enlever.', 'ward.tipWear': 'Touche pour le porter.', 'ward.done': 'Terminé',
    'pause.title': 'Pause', 'pause.text': 'Ton macareux fait du surplace en t’attendant.', 'pause.resume': 'Reprendre',
    'pause.keys': 'P ou Échap met en pause et reprend.', 'pause.button': 'Pause',
    'sound.mute': 'Couper le son', 'sound.on': 'Activer le son',
    'pop.justInTime': 'Juste à temps!', 'pop.lastChance': 'Dernière chance! Livre du poisson à un terrier', 'pop.tooHungry': 'Ton poussin a trop faim',
    'pop.gulp': 'Glup!', 'pop.noAir': 'Plus d’air', 'pop.noAirDrop': 'Plus d’air. Poissons échappés', 'pop.golden': 'Capelan doré',
    'pop.beakFull': 'Bec plein. File vers un terrier', 'pop.bonk': 'Bong', 'pop.sunset': 'Coucher de soleil', 'pop.night': 'La nuit s’en vient',
    'pop.gullTook': 'Un goéland t’a volé tes poissons', 'pop.gannet': 'Un fou de Bassan t’a fait échapper tes poissons', 'pop.berg': 'Tu as heurté un iceberg',
    'pop.jaeger': 'Un labbe t’a volé tes poissons', 'pop.whoa': 'Oups!', 'pop.home': 'Arrivé!', 'pop.homeBonus': '+{n} prime de retour',
    'note.capelin': v => `${v.n} ${pluralFr(v.n, 'capelan', 'capelans')}`, 'note.golden': v => `${v.n} ${pluralFr(v.n, 'capelan', 'capelans')}, doré ×${v.m}`, 'note.best': 'Plus grosse livraison!',
    'say.phew': 'Ouf!', 'say.peckish': 'J’ai un petit creux...',
    'stars.home': 'Rentre avant la nuit', 'stars.feed': 'Rentre sans que ton poussin manque de nourriture',
    'retry.again': 'R\u00e9essayer', 'retry.hint': 'Touche l\u2019\u00e9cran ou appuie sur Espace pour r\u00e9essayer', 'retry.attempt': 'Essai {n}',
    'retry.far': '{pct}\u00a0% du chemin \u00b7 record {best}\u00a0%', 'retry.farthest': '{pct}\u00a0% du chemin \u00b7 plus loin que jamais!',
    'picker.bestBoth': 'Record {score} \u00b7 {pct}\u00a0%', 'picker.bestFar': 'Record {pct}\u00a0%',
    'stars.score': 'Obtiens {n} points', 'stars.new': 'Nouveau', 'stars.of': '{n} étoiles sur 3', 'stars.total': 'Étoiles : {n} sur {total}'
  }
};

// French for the game's data. English lives with the data itself (levels.js, tutorial.js, outfits.js, chatter.js).
const DATA = {
  fr: {
    level: {
      'capelin-scull': { name: 'La montée du capelan', blurb: 'Des phoques en bas et des goélands voleurs en haut. Un bon endroit pour commencer.' },
      'gull-island': { name: 'Gull Island', blurb: 'Des phoques en bas, et quelques goélands marins qui chassent d’en haut. Plonge pour les semer.' },
      'baccalieu-tickle': { name: 'Baccalieu Tickle', blurb: 'Mer agitée, plus de phoques et plus de goélands chasseurs. Nulle part où être tranquille longtemps.' },
      'cape-st-marys': { name: 'Cap St. Mary’s', blurb: 'Les labbes pourchassent tout macareux qui transporte du poisson. Plonge pour les semer. Gare au goéland chasseur de temps en temps.' },
      'iceberg-alley': { name: 'L’allée des icebergs', blurb: 'Des icebergs qui sortent de la brume, presque tout cachés sous l’eau. Quelques labbes dans les parages.' },
      'trinity-bay': { name: 'Baie de la Trinité', blurb: 'Les baleines à bosse surgissent au milieu du capelan. Quand les bulles montent, sors de l’anneau ou plonge dessous. Quelques phoques aussi.' },
      'funk-island': { name: 'Île Funk', blurb: 'Les fous de Bassan te suivent, puis tombent du ciel comme des lances. Quand leur ombre devient rouge, change de profondeur ou plonge plus bas. Quelques baleines aussi.' },
      'tutorial': { name: 'Comment jouer' }
    },
    tutorial: [
      { title: 'Maintiens pour plonger', text: 'Appuie n’importe où sur l’écran et maintiens, ou utilise la barre d’espacement. Ton macareux plonge dans la mer.' },
      { title: 'Relâche pour remonter', text: 'Relâche et ton macareux remonte à la surface et s’envole. Maintiens et relâche pour monter et descendre.' },
      { title: 'Attrape du capelan', text: 'Nage dans un banc de capelans. Chaque poisson attrapé s’empile dans ton bec. Attrapes-en trois.',
        hint: 'La barre au-dessus de ta tête, c’est ton air. Remonte avant qu’elle se vide.' },
      { title: 'Livre au terrier', text: 'Vole à la hauteur du terrier sur le rocher. Ton macareux se pose et y dépose les poissons.' },
      { title: 'Nourris ton poussin', text: 'Les livraisons remplissent la jauge du poussin en haut à droite et le font grandir. La partie rayée montre ce que ton bec va ajouter; les poissons en trop lui donnent le ventre plein. Si la jauge se vide, file vers un terrier.' },
      { title: 'Les grosses piles rapportent plus', text: 'Chaque poisson de plus dans une pile vaut plus que le précédent. Le capelan doré multiplie une livraison. Attrape le doré.' },
      { title: 'Attention', text: 'Les phoques mettent fin à la partie et les goélands font tomber ta pile. Chaque niveau ajoute un nouveau danger, et son aperçu te montre à quoi t’attendre.' },
      { title: 'Rentre avant la nuit', text: 'La barre du haut montre le chemin qu’il te reste pendant que le jour tombe. Va jusqu’au bout et pose-toi à la colonie.' }
    ],
    slot: {
      hat: { name: 'Chapeaux', label: 'Nouveau chapeau' },
      glasses: { name: 'Lunettes', label: 'Nouvelles lunettes' },
      neck: { name: 'Foulards et colliers', label: 'Nouveau pour ton cou' },
      boots: { name: 'Bottes', label: 'Nouvelles bottes' },
      feathers: { name: 'Plumes', label: 'Nouvelles plumes' }
    },
    outfit: {
      souwester: { name: 'Suroît', unlock: 'Termine Baccalieu Tickle.' },
      toque: { name: 'Tuque tricotée', unlock: 'Termine L’allée des icebergs.' },
      crown: { name: 'Couronne de sarracénies', unlock: 'Fais grandir ton poussin au maximum en une partie.' },
      captain: { name: 'Casquette de capitaine', unlock: 'Termine Île Funk.' },
      mummer: { name: 'Déguisement de mummer', unlock: 'Termine les sept niveaux.' },
      reading: { name: 'Lunettes de lecture de grand-maman', unlock: 'Termine Comment jouer.' },
      shades: { name: 'Lunettes de soleil', unlock: 'Obtiens 5 000 points dans Baie de la Trinité.' },
      goggles: { name: 'Lunettes de ski', unlock: 'Fais 100 livraisons au total.' },
      tricolour: { name: 'Foulard rose, blanc et vert', unlock: 'Termine La montée du capelan.' },
      tartan: { name: 'Foulard tartan de Terre-Neuve', unlock: 'Livre une pile complète de 12 poissons.' },
      horseshoe: { name: 'Fer à cheval porte-bonheur', unlock: 'Sauve ton poussin à la dernière seconde 5 fois.' },
      boots: { name: 'Bottes de caoutchouc', unlock: 'Livre 250 capelans au total.' },
      vamps: { name: 'Bas de laine tricotés', unlock: 'Joue 20 parties.' },
      fisherman: { name: 'Bottes de pêcheur', unlock: 'Termine Cap St. Mary’s.' },
      golden: { name: 'Macareux doré', unlock: 'Attrape 50 capelans dorés au total.' },
      starglasses: { name: 'Lunettes étoiles', unlock: 'Gagne 5 étoiles.' },
      medal: { name: 'Médaille d’or', unlock: 'Gagne 10 étoiles.' },
      aurora: { name: 'Plumes d’aurore boréale', unlock: 'Gagne 15 étoiles.' },
      goldcrown: { name: 'Couronne dorée', unlock: 'Gagne les 21 étoiles.' }
    },
    lines: {
      hungry: ['NOURRIS-MOIIII!', 'Grouille-toi, mon vieux!', 'Mon bedon fait plus de bruit que la mer!', 'C’est l’heure du capelan?',
        'Je mangerais un chabot au complet.', 'Maman? Papa? Quelqu’un?', 'Je mangerais même une méduse.', 'Je dépéris ici dedans!',
        'Dites aux goélands que je les aimais.'],
      fed: ['Miam, du capelan!', 'Ouiii! Merci!', 'Meilleur parent au monde.', 'Miam miam miam.'],
      full: ['Tellement... plein...', '*rot*', 'Plus une bouchée.', 'Plein comme un œuf!'],
      lastChance: ['OUAAAAAIN!', 'Je m’évanouis!', 'Dernier appel pour le capelan!', 'Du poisson! N’importe lequel!'],
      saved: ['T’es revenu!', 'Juste à temps!', 'Je savais que tu y arriverais.'],
      air: ['Mmmph!', 'Glou glou!', 'De l’air... vite!', 'Monte, monte, monte!', 'J’aurais dû prendre un plus gros respir.', 'C’est pas un poisson. C’est pas un poisson.']
    }
  }
};

// The text for key in the current language, with {name} placeholders filled from vars
function t(key, vars = {}) {
  let s = TEXT[LANG] && TEXT[LANG][key];
  if (s === undefined) s = TEXT.en[key];
  if (s === undefined) return key;
  if (typeof s === 'function') return s(vars);
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : ''));
}
// A field of a piece of game data in the current language (English is the data's own field)
function tr(kind, id, field, english) {
  const d = DATA[LANG] && DATA[LANG][kind] && DATA[LANG][kind][id];
  return d && d[field] !== undefined ? d[field] : english;
}
const lvName = lv => tr('level', lv.id, 'name', lv.name);
const lvBlurb = lv => tr('level', lv.id, 'blurb', lv.blurb);
const outName = o => tr('outfit', o.id, 'name', o.name);
const outUnlock = o => tr('outfit', o.id, 'unlock', o.unlock);
const slotName = sl => tr('slot', sl.id, 'name', sl.name);
const slotLabel = sl => tr('slot', sl.id, 'label', sl.label);
const tutStepText = (i, step, field) => tr('tutorial', i, field, step[field]);
const lines = (kind, english) => (DATA[LANG] && DATA[LANG].lines && DATA[LANG].lines[kind]) || english;
const fmtNum = n => Number(n).toLocaleString(LANG === 'fr' ? 'fr-CA' : 'en-CA');

// Fill in the page's fixed text: elements with data-i18n (text) and data-i18n-aria (aria-label)
function applyI18n() {
  document.documentElement.lang = LANG;
  document.title = t('page.title');
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of document.querySelectorAll('[data-i18n-aria]')) el.setAttribute('aria-label', t(el.dataset.i18nAria));
  for (const b of document.querySelectorAll('[data-lang]')) b.setAttribute('aria-pressed', b.dataset.lang === LANG ? 'true' : 'false');
}
function setLang(l) {
  if (!LANGS[l]) return;
  LANG = l; store.set(LANG_KEY, l);
  applyI18n();
}
