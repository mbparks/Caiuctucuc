// Origin, trade, burden. Design doc Section 3: each choice mechanically real.
export const ORIGINS = {
  gentry:    { name: 'Tidewater gentry, fallen on hard times', rep: { town: 1 }, words: ['SURVEY'] },
  german:    { name: 'German immigrant craftsman', rep: { hills: 1 }, words: ['HEX'] },
  freedman:  { name: 'Freed Black tradesman', rep: {}, words: ['PAPERS'], trust: { freeman: 1 } },
  veteran:   { name: 'Continental Army veteran', rep: { town: 1 }, words: ['FORT'] },
  drover:    { name: 'Scots-Irish drover', rep: { road: 1 }, words: ['ROAD'] }
};

export const TRADES = {
  surveyor:   { name: 'Surveyor', items: [['surveyors_compass', 1]] },
  apothecary: { name: 'Apothecary', items: [['dried_sassafras', 2], ['poultice', 1]] },
  gunsmith:   { name: 'Gunsmith', items: [['flintlock_pistol', 1], ['powder_and_shot', 2]] },
  preacher:   { name: 'Preacher', items: [['preacher_black', 1], ['clergy_hat', 1]], rep: { kirk: 1 } },
  trapper:    { name: 'Trapper', items: [['moccasins', 1], ['fishing_line', 1], ['salt_pork', 2]] }
};

export const BURDENS = {
  debt:        { name: 'Debt', coin: 2, flags: { burdenDebt: true } },
  warrant:     { name: 'A warrant back east', flags: { burdenWarrant: true, WARRANT: true } },
  secondsight: { name: 'Second sight', flags: { burdenSecondSight: true }, sight: 1, words: ['SEEN'] },
  letter:      { name: 'A dead sibling\u2019s unfinished letter', flags: { burdenLetter: true }, items: [['letter', 1]] }
};

export function buildCharacter(base, choices, registry) {
  const o = ORIGINS[choices.origin], t = TRADES[choices.trade], b = BURDENS[choices.burden];
  if (!o || !t || !b) throw new Error('the creator was handed a stranger');
  let s = JSON.parse(JSON.stringify(base));
  s.player.origin = choices.origin;
  s.player.trade = choices.trade;
  s.player.burden = choices.burden;
  for (const src of [o, t, b]) {
    for (const [k, v] of Object.entries(src.rep || {})) s.reputation[k] += v;
    for (const [k, v] of Object.entries(src.trust || {})) s.trust[k] = (s.trust[k] || 0) + v;
    for (const w of src.words || []) if (!s.keywordsLearned.includes(w)) s.keywordsLearned.push(w);
    for (const [id, qty] of src.items || []) {
      const def = registry[id];
      if (def.condition) {
        for (let i = 0; i < qty; i++) s.inventory.push({ id, qty: 1, cond: 'sound', wear: 0 });
      } else {
        const e = s.inventory.find(x => x.id === id);
        if (e && !def.condition) e.qty += qty;
        else s.inventory.push({ id, qty });
      }
    }
    Object.assign(s.flags, src.flags || {});
  }
  if (b.coin !== undefined) s.player.coin = b.coin;
  if (b.sight) s.player.sight = b.sight;
  return s;
}
