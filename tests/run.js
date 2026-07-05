// Minimal test harness, no dependencies. Run: node tests/run.js
import { newGame, serialize, deserialize, SAVE_FORMAT } from '../src/game/save.js';
import { canAsk, learn } from '../src/game/keywords.js';
import { addHeat, decay, levelFor, LEVELS } from '../src/game/huecry.js';
import { attemptRank } from '../src/game/sight.js';
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log('  ok  ' + name); }
  catch (err) { fail++; console.error(' FAIL ' + name + ': ' + err.message); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

console.log('save');
test('round trip preserves state', () => {
  const s = newGame();
  s.flags.testFlag = true;
  const back = deserialize(serialize(s));
  assert(back.flags.testFlag === true, 'flag lost');
  assert(back.player.coin === 8, 'coin lost');
});
test('wrong format is rejected', () => {
  let threw = false;
  try { deserialize('{"format": 99}'); } catch { threw = true; }
  assert(threw, 'accepted an unsupported format');
});

console.log('keywords');
test('open gate always answers', () => {
  assert(canAsk({ gate: 'open' }, {}), 'open gate refused');
});
test('trust gate respects threshold', () => {
  const ctx = { trust: { feig: 1 } };
  assert(!canAsk({ gate: 'trust', npc: 'feig', min: 2 }, ctx), 'answered below threshold');
  ctx.trust.feig = 2;
  assert(canAsk({ gate: 'trust', npc: 'feig', min: 2 }, ctx), 'refused at threshold');
});
test('sight gate hides keywords below rank', () => {
  assert(!canAsk({ gate: 'sight', min: 2 }, { sight: 1 }), 'MURMUR leaked at rank 1');
  assert(canAsk({ gate: 'sight', min: 2 }, { sight: 2 }), 'MURMUR refused at rank 2');
});
test('learning is idempotent', () => {
  const l = learn(learn(['NAME'], 'SEEN'), 'SEEN');
  assert(l.filter(k => k === 'SEEN').length === 1, 'learned twice');
});

console.log('hue and cry');
test('heat quantizes into the four public levels', () => {
  assert(levelFor(0) === 0 && levelFor(10) === 1 && levelFor(30) === 2 && levelFor(60) === 3 && levelFor(100) === 4, 'thresholds wrong');
  assert(LEVELS[4] === 'bounty', 'level names wrong');
});
test('crossing the river decays heat six times faster', () => {
  const hot = addHeat({ heat: 0, level: 0 }, 60);
  const home = decay(hot, 2);
  const away = decay(hot, 2, 1, true);
  assert(away.heat < home.heat, 'the Potomac did nothing');
  assert(home.heat - away.heat === 20, 'jurisdiction factor wrong');
});

console.log('sight');
test('ranks are crossed in order and by threshold', () => {
  const s = newGame();
  assert(!attemptRank(s, 2).ok, 'skipped rank 1');
  assert(!attemptRank(s, 1).ok, 'rank 1 without sleeping in the fort');
  s.flags.sleptInFort = true;
  const r = attemptRank(s, 1);
  assert(r.ok && r.state.player.sight === 1, 'the Glimmer did not open');
});

console.log('content');
test('all 24 named NPCs are present with signatures', () => {
  const npcs = JSON.parse(readFileSync(new URL('../src/data/npcs.json', import.meta.url)));
  assert(npcs.length === 24, 'roster is ' + npcs.length);
  assert(npcs.every(n => n.signature && n.signature.keyword), 'an NPC lacks a signature keyword');
});
test('the rank 0 evidence chain exists in tiers 1, 2, and 4', () => {
  const kw = JSON.parse(readFileSync(new URL('../src/data/keywords.json', import.meta.url)));
  const mundane = [...kw.tier1, ...kw.tier2, ...kw.tier4];
  for (const k of ['SINGING', 'PLAT', 'BOOTS', 'GENTLEMAN', 'LIST', 'GRAVES'])
    assert(mundane.includes(k), k + ' is not reachable at rank 0');
});

console.log('tiled loader');
const { parseMap } = await import('../src/engine/tiledmap.js');
const rawMap = JSON.parse(readFileSync(new URL('../assets/maps/test_field.json', import.meta.url)));
test('sample map parses with expected dimensions', () => {
  const m = parseMap(rawMap);
  assert(m.width === 30 && m.height === 20 && m.tileWidth === 16, 'dimensions wrong');
});
test('collision layer drives solidity, ford is passable', () => {
  const m = parseMap(rawMap);
  assert(m.solidAt(14, 8), 'creek is not solid');
  assert(!m.solidAt(14, 10), 'the ford is blocked');
  assert(!m.solidAt(5, 5), 'open field is blocked');
  assert(m.solidAt(-1, 5) && m.solidAt(5, 999), 'out of bounds is not solid');
});
test('object layer yields spawn and npc with properties', () => {
  const m = parseMap(rawMap);
  const spawn = m.findObject('spawns', 'player');
  assert(spawn && spawn.type === 'spawn', 'player spawn missing');
  const doyle = m.findObject('spawns', 'doyle');
  assert(doyle && doyle.props.npcId === 'doyle', 'npc properties not normalized');
});
test('flip flags in gids are masked off', () => {
  const flipped = JSON.parse(JSON.stringify(rawMap));
  flipped.layers[0].data[31] = (5 | 0x80000000) >>> 0;
  const m = parseMap(flipped);
  assert(m.gidAt('ground', 1, 1) === 5, 'flip bits leaked: ' + m.gidAt('ground', 1, 1));
});
test('infinite maps are rejected', () => {
  let threw = false;
  try { parseMap({ ...rawMap, infinite: true }); } catch { threw = true; }
  assert(threw, 'accepted an infinite map');
});

console.log('dialog');
const { ask, extractTaught, DEFAULT_SHRUG } = await import('../src/game/dialog.js');
const doyle = JSON.parse(readFileSync(new URL('../src/data/dialogs/doyle.json', import.meta.url)));
const tiers = JSON.parse(readFileSync(new URL('../src/data/keywords.json', import.meta.url)));
const vocab = Object.values(tiers).flat();
test('unknown words get the shrug', () => {
  const r = ask(doyle, 'ZEPPELIN', newGame(), vocab);
  assert(r.text === doyle.shrug || r.text === DEFAULT_SHRUG, 'no shrug');
});
test('open entries answer and never mutate the input state', () => {
  const s = newGame();
  const r = ask(doyle, 'NAME', s, vocab);
  assert(r.text.includes('Peg Doyle'), 'wrong answer');
  assert(s.player.coin === 8 && r.state.player.coin === 8, 'coin changed on a free answer');
});
test('capitalized words spoken by the NPC are learned', () => {
  const s = newGame();
  const r = ask(doyle, 'TOWN', s, vocab);
  assert(r.state.keywordsLearned.includes('FORT'), 'FORT not learned');
  assert(r.state.keywordsLearned.includes('CREEK'), 'CREEK not learned');
  assert(!s.keywordsLearned.includes('FORT'), 'input state mutated');
});
test('extractTaught only yields real keywords', () => {
  const t = extractTaught('Mind the FORT and the ZEPPELIN.', vocab);
  assert(t.includes('FORT') && !t.includes('ZEPPELIN'), 'extraction wrong');
});
test('reputation gate deflects, then answers and charges', () => {
  let s = newGame();
  let r = ask(doyle, 'GENTLEMAN', s, vocab);
  assert(r.text.includes('strangers'), 'did not deflect a stranger');
  s = { ...s, reputation: { ...s.reputation, road: 1 } };
  r = ask(doyle, 'GENTLEMAN', s, vocab);
  assert(r.state.player.coin === 6, 'two silver not charged: ' + r.state.player.coin);
  assert(r.state.flags.askedGentleman === true, 'flag not set');
});
test('a priced answer refuses an empty purse', () => {
  const s = { ...newGame(), reputation: { town: 0, kirk: 0, hills: 0, road: 1 } };
  s.player = { ...s.player, coin: 1 };
  const r = ask(doyle, 'GENTLEMAN', s, vocab);
  assert(r.text.includes('Two silver'), 'did not refuse');
  assert(r.state.player.coin === 1, 'charged an empty purse');
});

console.log('vertical slice');
const { seekStep, caught } = await import('../src/game/pursuit.js');
test('the market theft raises heat straight to the constable', () => {
  const after = addHeat({ heat: 0, level: 0 }, 35);
  assert(after.level === 2 && LEVELS[after.level] === 'constable', 'theft did not summon Beall');
});
test('a night at the Blue Mule cools constable to gossip', () => {
  const hot = addHeat({ heat: 0, level: 0 }, 35);
  const rested = decay(hot, 6);
  assert(rested.level === 1 && LEVELS[rested.level] === 'gossip', 'lay low did not work: heat ' + rested.heat);
});
test('seekStep closes distance and slides along walls', () => {
  const open = () => false;
  const a = seekStep({ x: 0, y: 0 }, { x: 100, y: 0 }, 50, 1, open);
  assert(a.x === 50 && a.y === 0, 'did not close distance');
  const wallAhead = (px) => px >= 70;
  const b = seekStep({ x: 50, y: 0 }, { x: 100, y: 80 }, 50, 1, (px) => wallAhead(px));
  assert(b.x < 70 && b.y > 0, 'did not slide along the wall: ' + JSON.stringify(b));
});
test('caught radius is honest', () => {
  assert(caught({ x: 0, y: 0 }, { x: 10, y: 0 }), 'missed at ten pixels');
  assert(!caught({ x: 0, y: 0 }, { x: 20, y: 0 }), 'caught at twenty pixels');
});
test('the slice map has the crime, the room, and the constable', () => {
  const raw = JSON.parse(readFileSync(new URL('../assets/maps/baltimore_street.json', import.meta.url)));
  const m = parseMap(raw);
  const theft = (m.objects.interact || []).find(o => o.type === 'steal');
  const room = (m.objects.interact || []).find(o => o.type === 'laylow');
  const beall = m.findObject('spawns', 'beall');
  assert(theft && theft.props.heat === 35, 'no crime on the street');
  assert(room && room.props.hours === 6, 'nowhere to lay low');
  assert(beall && beall.props.pursuer === true, 'no constable on duty');
});

console.log('slice complete (v0.1.0)');
const { advance, periodFor } = await import('../src/game/clock.js');
const { nextCoat, effectiveLevel, COATS } = await import('../src/game/disguise.js');
const { spotFor, SCHEDULES } = await import('../src/game/schedule.js');
test('the clock wraps midnight and carries the day', () => {
  const c = advance({ day: 1, hour: 22 }, 6);
  assert(c.day === 2 && c.hour === 4, 'clock wrong: ' + JSON.stringify(c));
  assert(periodFor(4) === 'night' && periodFor(12) === 'day' && periodFor(19) === 'dusk', 'periods wrong');
});
test('changing coats drops the effective level by one, never below gossip', () => {
  const hc = { level: 2, heat: 35, witnessedCoat: 'drover' };
  assert(effectiveLevel(hc, 'drover') === 2, 'same coat should not help');
  assert(effectiveLevel(hc, 'frock') === 1, 'new coat did not help');
  assert(effectiveLevel({ level: 1, heat: 12, witnessedCoat: 'drover' }, 'frock') === 1, 'dropped below gossip');
  assert(effectiveLevel({ level: 0, heat: 0, witnessedCoat: null }, 'frock') === 0, 'quiet street misread');
});
test('the coat rack cycles through every coat and comes home', () => {
  let c = 'drover';
  const seen = new Set([c]);
  for (let i = 0; i < COATS.length; i++) { c = nextCoat(c); seen.add(c); }
  assert(seen.size === COATS.length && c === 'drover', 'cycle broken');
});
test('schedules resolve hours, including ranges that wrap midnight', () => {
  assert(spotFor(SCHEDULES.beall, 12) === 'beall_post', 'Beall off his post at noon');
  assert(spotFor(SCHEDULES.beall, 22) === 'beall_tavern', 'Beall missing his pint');
  assert(spotFor(SCHEDULES.beall, 3) === 'beall_home', 'Beall not abed at three');
  assert(spotFor(SCHEDULES.doyle, 3) === 'doyle_home', 'Peg pouring at three in the morning');
});
test('a format 1 save imports and migrates cleanly', () => {
  const v1 = JSON.stringify({
    format: 1, version: '0.0.4',
    player: { x: 3, y: 12, marks: [], sight: 0, coin: 5 },
    hueCry: { level: 1, heat: 12 },
    flags: {}, trust: {}, reputation: { town: 0, kirk: 0, hills: 0, road: 0 },
    keywordsLearned: ['NAME'], inventory: []
  });
  const s = deserialize(v1);
  assert(s.format === SAVE_FORMAT, 'not migrated to current format');
  assert(s.map === 'town' && Array.isArray(s.rumors) && Array.isArray(s.stash) && Array.isArray(s.clues), 'chain migration incomplete');
  assert(s.player.coat === 'drover', 'coat not defaulted');
  assert(s.clock.hour === 18, 'clock not defaulted');
  assert(s.hueCry.witnessedCoat === null, 'witness memory not defaulted');
  assert(s.player.coin === 5 && s.hueCry.heat === 12, 'old data damaged');
});
test('the slice map has the coat rack, the gaol, and every scheduled spot', () => {
  const raw = JSON.parse(readFileSync(new URL('../assets/maps/baltimore_street.json', import.meta.url)));
  const m = parseMap(raw);
  assert((m.objects.interact || []).some(o => o.type === 'coat'), 'no coat rack');
  const names = (m.objects.spots || []).map(o => o.name);
  for (const need of ['gaol', 'beall_post', 'beall_tavern', 'beall_home', 'doyle_bar', 'doyle_home'])
    assert(names.includes(need), 'missing spot: ' + need);
});

console.log('the town (v0.2.0)');
const { applyTrust, TRUST_DELTAS } = await import('../src/game/trust.js');
const { newRumor, knows, arrivalTimes } = await import('../src/game/gossip.js');
const { acceptJob, workJob, JOBS } = await import('../src/game/jobs.js');
test('trust moves by conduct and rejects nonsense', () => {
  let s = newGame();
  s = applyTrust(s, 'feig', 'promiseKept');
  s = applyTrust(s, 'feig', 'promiseKept');
  assert(s.trust.feig === 2, 'two kept promises should make you known');
  s = applyTrust(s, 'feig', 'caughtLying');
  assert(s.trust.feig === 0, 'a caught lie costs double');
  let threw = false;
  try { applyTrust(s, 'feig', 'flattery'); } catch { threw = true; }
  assert(threw, 'flattery should not be a trust event');
});
test('a rumor from the ferry reaches Peg within a game day', () => {
  const r = newRumor('lie', 'shanks', 0);
  assert(!knows('doyle', r, 6), 'Peg heard it impossibly fast');
  assert(knows('doyle', r, 24), 'Peg had not heard by the next day');
});
test('the market theft reaches Beall in an hour, Peg through Beall in five', () => {
  const r = newRumor('markettheft', 'market', 0);
  const t = arrivalTimes(r);
  assert(t.beall === 1, 'Beall time: ' + t.beall);
  assert(t.doyle === 5, 'Peg hears via Beall in five: ' + t.doyle);
  assert(t.cresap === 17, 'Cresap time: ' + t.cresap);
});
test('the widow hears nothing through the network', () => {
  const r = newRumor('anything', 'market', 0);
  assert(!knows('brahm', r, 500), 'Brahm has no gossip edges by design');
});
test('the freight job pays on delivery and refuses the wrong end', () => {
  let s = newGame();
  const a = acceptJob(s, 'freight');
  assert(a.ok, 'could not accept');
  s = a.state;
  let r = workJob(s, 'freight', 'dropoff', 12);
  assert(r.state.job.stage === 0, 'delivered a crate never picked up');
  r = workJob(s, 'freight', 'pickup', 12);
  s = r.state;
  r = workJob(s, 'freight', 'dropoff', 12);
  assert(r.state.job === null && r.state.player.coin === 8 + JOBS.freight.pay, 'not paid: ' + r.state.player.coin);
});
test('the night run in daylight brings heat with the pay', () => {
  let s = newGame();
  s = acceptJob(s, 'nightrun').state;
  s = workJob(s, 'nightrun', 'pickup', 12).state;
  const r = workJob(s, 'nightrun', 'dropoff', 12);
  assert(r.heat === JOBS.nightrun.dayHeat, 'daylight had no eyes');
  const s2 = workJob(workJob({ ...newGame(), job: { id: 'nightrun', stage: 0 } }, 'nightrun', 'pickup', 23).state, 'nightrun', 'dropoff', 23);
  assert(s2.heat === 0, 'the dark should cover the run');
});
test('a format 2 save migrates to 3 with rumors, job, and map', () => {
  const v2 = JSON.stringify({
    format: 2, version: '0.1.0',
    player: { x: 3, y: 12, marks: [], sight: 0, coin: 5, coat: 'frock', mapX: 40, mapY: 40 },
    clock: { day: 2, hour: 9 },
    hueCry: { level: 0, heat: 0, witnessedCoat: null },
    flags: {}, trust: {}, reputation: { town: 0, kirk: 0, hills: 0, road: 0 },
    keywordsLearned: ['NAME'], inventory: []
  });
  const s = deserialize(v2);
  assert(s.format === SAVE_FORMAT && s.map === 'town' && s.job === null && Array.isArray(s.rumors), 'migration incomplete');
  assert(s.player.coat === 'frock' && s.clock.day === 2, 'old data damaged');
});
test('the town map integrity: doors resolve, spots exist, twelve voices load', async () => {
  const { readdirSync } = await import('node:fs');
  const town = parseMap(JSON.parse(readFileSync(new URL('../assets/maps/town.json', import.meta.url))));
  const files = readdirSync(new URL('../assets/maps/', import.meta.url));
  for (const d of town.objects.doors) {
    assert(files.includes(d.props.target + '.json'), 'door to nowhere: ' + d.name);
    assert(town.findObject('spawns', 'from_' + d.props.target), 'no return spawn for ' + d.name);
  }
  const { SCHEDULES } = await import('../src/game/schedule.js');
  const spotNames = (town.objects.spots || []).map(o => o.name);
  for (const [npc, sched] of Object.entries(SCHEDULES))
    for (const s of sched)
      assert(spotNames.includes(s.spot), npc + ' schedules a missing spot: ' + s.spot);
  const dialogFiles = readdirSync(new URL('../src/data/dialogs/', import.meta.url));
  for (const npc of Object.keys(SCHEDULES))
    assert(dialogFiles.includes(npc + '.json'), npc + ' has no voice');
  assert(Object.keys(SCHEDULES).length === 12, 'MVP roster is not twelve');
});

console.log('art pass (v0.3.0)');
const { frameFor } = await import('../src/engine/sprites.js');
function pngSize(path) {
  const buf = readFileSync(new URL(path, import.meta.url));
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}
test('four period tilesheets carry 16 tiles in 2 animation rows', () => {
  for (const p of ['day', 'dusk', 'night', 'fog']) {
    const s = pngSize('../assets/tiles/tileset_' + p + '.png');
    assert(s.w === 256 && s.h === 32, p + ' sheet is ' + s.w + 'x' + s.h);
  }
});
test('every coat has a four-frame sheet at character spec', () => {
  for (const c of ['drover', 'frock', 'preacher']) {
    const s = pngSize('../assets/sprites/player_' + c + '.png');
    assert(s.w === 64 && s.h === 24, c + ' sheet is ' + s.w + 'x' + s.h);
  }
});
test('the walk cycle turns over every stride and loops at four', () => {
  assert(frameFor(0) === 0 && frameFor(10) === 1 && frameFor(39) === 3 && frameFor(40) === 0, 'cycle wrong');
});
test('ink on paper holds WCAG AA in both themes', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  function lum(hex) {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function contrast(a, b) {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  }
  const pairs = [];
  const nightInk = html.match(/--ink: (#[0-9a-f]{6})/)[1];
  const nightPaper = html.match(/--paper: (#[0-9a-f]{6})/)[1];
  pairs.push(['night', nightInk, nightPaper]);
  const hc = html.slice(html.indexOf('high-contrast'));
  pairs.push(['high-contrast', hc.match(/--ink: (#[0-9a-f]{6})/)[1], hc.match(/--paper: (#[0-9a-f]{6})/)[1]]);
  for (const [name, ink, paper] of pairs) {
    const c = contrast(ink, paper);
    assert(c >= 4.5, name + ' theme contrast is ' + c.toFixed(2));
  }
});

console.log('pockets and workbenches (v0.4.0)');
const REG = JSON.parse(readFileSync(new URL('../src/data/items.json', import.meta.url)));
const { addItem, removeItem, equip, countOf, SATCHEL_SIZE } = await import('../src/game/inventory.js');
const { wearItem, fieldRepair, restore, condFor, WORN_AT, BROKE_AT } = await import('../src/game/condition.js');
const { craft, RECIPES } = await import('../src/game/crafting.js');
const { sellPrice, buyPrice } = await import('../src/game/economy.js');
test('the registry holds sixty items and every recipe reference resolves', () => {
  assert(Object.keys(REG).length === 60, 'registry is ' + Object.keys(REG).length);
  for (const r of Object.values(RECIPES)) {
    assert(REG[r.output], 'recipe outputs a ghost: ' + r.output);
    for (const id of Object.keys(r.inputs)) assert(REG[id], 'recipe needs a ghost: ' + id);
  }
});
test('stacks stack, condition items do not, and the satchel has a bottom', () => {
  let s = newGame();
  s = addItem(s, 'johnnycake', REG, 3).state;
  assert(countOf(s, 'johnnycake') === 5 && s.inventory.filter(e => e.id === 'johnnycake').length === 1, 'stacking failed');
  s = addItem(s, 'belt_knife', REG).state;
  assert(s.inventory.filter(e => e.id === 'belt_knife').length === 2, 'condition items stacked');
  while (s.inventory.length < SATCHEL_SIZE) s = addItem(s, 'tomahawk', REG).state;
  const full = addItem(s, 'tricorn', REG);
  assert(!full.ok, 'the satchel has no bottom');
});
test('the flintlock arc: worn to broke, patched to worn, restored to sound', () => {
  let gun = { id: 'flintlock_pistol', qty: 1, cond: 'sound', wear: 0 };
  for (let i = 0; i < 6; i++) gun = wearItem(gun, 2);
  assert(gun.cond === 'worn', 'twelve wear should be worn: ' + gun.cond);
  gun = wearItem(gun, 7, true);
  assert(gun.cond === 'broke', 'rain on a flintlock should break it: ' + gun.wear);
  assert(!fieldRepair({ ...gun, cond: 'sound', wear: 0 }).ok, 'patched a sound gun');
  const patched = fieldRepair(gun, 0);
  assert(patched.ok && patched.entry.cond === 'worn', 'field repair should land at worn');
  assert(patched.entry.wear >= WORN_AT, 'field repair reached sound, which only Feig may do');
  const sound = restore(patched.entry);
  assert(sound.cond === 'sound' && sound.wear === 0, 'Feig failed');
});
test('higher HANDS patches shallower into the worn band', () => {
  const broke = { id: 'belt_knife', qty: 1, cond: 'broke', wear: BROKE_AT };
  const r0 = fieldRepair(broke, 0).entry.wear;
  const r3 = fieldRepair(broke, 3).entry.wear;
  assert(r3 < r0 && r3 >= WORN_AT, 'HANDS rank did nothing: ' + r0 + ' vs ' + r3);
});
test('stew wants the hearth and the makings', () => {
  let s = newGame();
  s = removeItem(s, 'johnnycake', 2).state;   // clear the starting kit's cakes
  s = addItem(s, 'salt_pork', REG).state;
  assert(!craft(s, 'stew', 'smithy', REG).ok, 'stew on an anvil');
  assert(!craft(s, 'stew', 'hearth', REG).ok, 'stew without the johnnycake');
  s = addItem(s, 'johnnycake', REG).state;
  const done = craft(s, 'stew', 'hearth', REG);
  assert(done.ok && countOf(done.state, 'stew') === 1, 'no stew');
  assert(countOf(done.state, 'salt_pork') === 0, 'the pork survived the pot');
  assert(countOf(done.state, 'johnnycake') === 0, 'the cake survived the pot');
});
test('a poultice comes off the hearth from sassafras and whiskey', () => {
  let s = newGame();
  s = addItem(s, 'dried_sassafras', REG).state;
  const done = craft(s, 'poultice', 'hearth', REG);
  assert(done.ok && countOf(done.state, 'poultice') === 1, 'no poultice');
});
test('whiskey sells at the full rate because whiskey is money', () => {
  assert(sellPrice(REG.whiskey) === buyPrice(REG.whiskey), 'whiskey discounted');
  assert(sellPrice(REG.tomahawk) === Math.floor(REG.tomahawk.price / 2), 'barter rate wrong');
});
test('equipping a coat item changes the disguise coat', () => {
  let s = newGame();
  s = addItem(s, 'preacher_black', REG).state;
  const i = s.inventory.findIndex(e => e.id === 'preacher_black');
  const r = equip(s, i, REG);
  assert(r.ok && r.state.player.coat === 'preacher', 'the coat did not follow the cloth');
  assert(r.state.player.equip.coat.id === 'preacher_black', 'not on the back');
});
test('a format 3 save migrates to 4 with equip, stash, and structured entries', () => {
  const v3 = JSON.stringify({
    format: 3, version: '0.2.0',
    player: { marks: [], sight: 0, coin: 5, coat: 'frock' },
    clock: { day: 2, hour: 9 },
    hueCry: { level: 0, heat: 0, witnessedCoat: null },
    flags: {}, trust: {}, reputation: { town: 0, kirk: 0, hills: 0, road: 0 },
    keywordsLearned: ['NAME'], inventory: ['whiskey'], rumors: [], job: null, map: 'town'
  });
  const s = deserialize(v3);
  assert(s.format === SAVE_FORMAT && Array.isArray(s.stash), 'migration incomplete');
  assert(s.inventory[0].id === 'whiskey' && s.inventory[0].qty === 1, 'flat entry not structured');
});
test('the interiors hold the stations, the counter, and the chest', () => {
  const need = { int_bluemule: ['station', 'stash', 'laylow'], int_surgery: ['station'], int_smithy: ['station', 'restore'], int_store: ['vendor'] };
  for (const [mapName, types] of Object.entries(need)) {
    const m = parseMap(JSON.parse(readFileSync(new URL('../assets/maps/' + mapName + '.json', import.meta.url))));
    for (const t of types)
      assert((m.objects.interact || []).some(o => o.type === t), mapName + ' lacks ' + t);
  }
});

console.log('input (v0.4.1)');
const { isEditable } = await import('../src/engine/input.js');
test('typing fields are recognized so movement never eats letters', () => {
  assert(isEditable({ tagName: 'INPUT' }), 'input not editable');
  assert(isEditable({ tagName: 'textarea' }), 'textarea not editable');
  assert(isEditable({ tagName: 'DIV', isContentEditable: true }), 'contenteditable missed');
  assert(!isEditable({ tagName: 'CANVAS' }), 'the canvas is not a typewriter');
  assert(!isEditable(null), 'null crashed or lied');
});

console.log('presentation (v0.4.2)');
const { fitScale, fmtHour } = await import('../src/engine/scale.js');
test('the canvas scales by whole integers and never clips', () => {
  assert(fitScale(1920, 1080, 480, 320) === 3, '1080p should be 3x: ' + fitScale(1920, 1080, 480, 320));
  assert(fitScale(2560, 1440, 480, 320) === 4, '1440p should be 4x');
  assert(fitScale(960, 640, 480, 320) === 2, 'exact double should be 2x');
  assert(fitScale(500, 700, 480, 320) === 1, 'narrow stage floors to 1x');
  const tiny = fitScale(240, 160, 480, 320);
  assert(tiny === 0.5, 'small screens fit fractionally: ' + tiny);
});
test('the clock shows whole hours whatever the accumulator held', () => {
  assert(fmtHour(18.5) === '18:00', 'fractional hour leaked: ' + fmtHour(18.5));
  assert(fmtHour(4) === '04:00' && fmtHour(23.99) === '23:00', 'formatting wrong');
});

console.log('the drowned man (v0.5.0)');
const { advanceCase, addClue, threadDone, cluesFromFlags, CLUES } = await import('../src/game/quest.js');
const { applyCheat } = await import('../src/game/cheats.js');
function freshCase() {
  const s = newGame();
  s.flags.enteredMarket = true;
  return advanceCase(s).state;   // drover fires immediately
}
function findBody(s) {
  s = { ...s, clock: { day: 2, hour: 9 } };
  return advanceCase(s).state;
}
test('beats hold their order: no body before the drover, no act close before Coombs', () => {
  let s = newGame();
  s.clock = { day: 5, hour: 12 };
  s = advanceCase(s).state;
  assert(!s.flags.bodyFound, 'the body predates the drover');
  s = freshCase();
  assert(s.flags.droverDied && !s.flags.bodyFound, 'the body arrived with the drover');
  s = findBody(s);
  assert(s.flags.bodyFound && s.clues.includes('tam_drowned'), 'the body never surfaced');
  assert(!s.flags.act1Complete, 'the act closed early');
});
test('the quarry thread completes Act I on its own', () => {
  let s = findBody(freshCase());
  s = cluesFromFlags({ ...s, flags: { ...s.flags, mcteagueConfessed: true } });
  s = addClue(s, 'calm_bootprints');
  s = advanceCase(s).state;
  assert(s.flags.threadDone === 'quarry', 'quarry thread not recognized');
  s.flags.sleepCount = (s.flags.sleepCount || 0) + 1;
  s = advanceCase(s).state;
  assert(s.flags.coombsDead && s.flags.act1Complete, 'quarry route did not close the act');
});
test('the plat thread completes Act I on its own', () => {
  let s = findBody(freshCase());
  s = cluesFromFlags({ ...s, flags: { ...s.flags, roodShared: true } });
  s = addClue(s, 'plat_mismatch');
  s = advanceCase(s).state;
  assert(s.flags.threadDone === 'plat', 'plat thread not recognized');
  s.flags.sleepCount = (s.flags.sleepCount || 0) + 1;
  s = advanceCase(s).state;
  assert(s.flags.act1Complete, 'plat route did not close the act');
});
test('the fort thread completes Act I on its own', () => {
  let s = findBody(freshCase());
  s = addClue(s, 'gentleman_letter');
  s = advanceCase(s).state;
  assert(s.flags.threadDone === 'fort', 'fort thread not recognized');
  s.flags.sleepCount = (s.flags.sleepCount || 0) + 1;
  s = advanceCase(s).state;
  assert(s.flags.act1Complete, 'fort route did not close the act');
});
test('Coombs waits for a night to pass after the thread pulls taut', () => {
  let s = findBody(freshCase());
  s = addClue(s, 'gentleman_letter');
  s = advanceCase(s).state;
  s = advanceCase(s).state;
  assert(!s.flags.coombsDead, 'Coombs died without a night passing');
});
test('the gossip turn needs two investigation clues, and prologue clues do not count', () => {
  let s = findBody(freshCase());
  s = advanceCase(s).state;
  assert(!s.flags.gossipTurn, 'the turn fired on prologue clues');
  s = addClue(addClue(s, 'razored_ledger'), 'gentleman_letter');
  s = advanceCase(s).state;
  assert(s.flags.gossipTurn && s.reputation.kirk === 1, 'the revival never crested');
});
test('clues never duplicate and all beat clues exist in the registry', () => {
  let s = newGame();
  s = addClue(addClue(s, 'tam_drowned'), 'tam_drowned');
  assert(s.clues.length === 1, 'duplicate clue');
  for (const id of Object.keys(CLUES)) assert(CLUES[id].thread && CLUES[id].text, id + ' malformed');
});
test('the four cheats do exactly what the design doc says and nothing else', () => {
  let s = newGame();
  const specie = applyCheat(s, 'specie');
  assert(specie.ok && specie.state.player.coin === 33, 'SPECIE wrong');
  s.hueCry = { level: 3, heat: 70, witnessedCoat: 'drover' };
  const pardon = applyCheat(s, 'PARDON');
  assert(pardon.state.hueCry.heat === 0 && pardon.state.hueCry.level === 0, 'PARDON wrong');
  const oil = applyCheat(s, 'snakeoil');
  assert(oil.ok && oil.state.flags.snakeOilSalesman, 'the salesman flag missed');
  const lamp = applyCheat(s, 'LANTERNS');
  assert(lamp.state.flags.cheatLanterns, 'LANTERNS wrong');
  assert(!applyCheat(s, 'IDDQD').ok, 'the wrong pantheon answered');
});
test('the world holds the act: zones, the bedroll, the prints, the effects, the plat book', () => {
  const town = parseMap(JSON.parse(readFileSync(new URL('../assets/maps/town.json', import.meta.url))));
  assert((town.objects.zones || []).some(z => z.props.flag === 'enteredMarket'), 'no market zone');
  const clues = (town.objects.interact || []).filter(o => o.type === 'clue');
  assert(clues.some(c => c.props.clue === 'calm_bootprints'), 'no prints at the deep cut');
  assert(clues.some(c => c.props.clue === 'gentleman_letter'), 'no bedroll in the ruins');
  const surgery = parseMap(JSON.parse(readFileSync(new URL('../assets/maps/int_surgery.json', import.meta.url))));
  assert((surgery.objects.interact || []).some(o => o.props.sets === 'hasPlatScrap'), 'no effects at the surgery');
  const court = parseMap(JSON.parse(readFileSync(new URL('../assets/maps/int_courthouse.json', import.meta.url))));
  assert((court.objects.interact || []).some(o => o.props.clue === 'plat_mismatch'), 'no plat book at the courthouse');
});
test('all eleven npc variant sheets exist at character spec', () => {
  for (const n of ['doyle', 'cresap', 'ward', 'feig', 'gantt', 'rood', 'mcteague', 'coombs', 'fenwick', 'shanks', 'bright']) {
    const s = pngSize('../assets/sprites/npc_' + n + '.png');
    assert(s.w === 64 && s.h === 24, n + ' sheet is ' + s.w + 'x' + s.h);
  }
});

console.log('the glimmer and the grave (v0.6.0)');
const { applyDeath, MARK_POOL } = await import('../src/game/death.js');
const { resolveWisp, wardedResolve } = await import('../src/game/wisps.js');
test('the skeptic completes Act I at rank zero, untouched by the other world', () => {
  let s = findBody(freshCase());
  s = addClue(s, 'gentleman_letter');
  s = advanceCase(s).state;
  s.flags.sleepCount = (s.flags.sleepCount || 0) + 1;
  s = advanceCase(s).state;
  assert(s.flags.act1Complete && s.player.sight === 0, 'the skeptic was made to believe');
});
test('dying twice yields two distinct Marks and the CROSSED word once', () => {
  let s = newGame();
  s.player.health = 0;
  let r = applyDeath(s);
  s = r.state;
  assert(s.player.marks.length === 1 && s.keywordsLearned.includes('CROSSED'), 'first crossing unmarked');
  s.player.health = 0;
  s = applyDeath(s).state;
  assert(s.player.marks.length === 2 && s.player.marks[0] !== s.player.marks[1], 'marks repeated');
  assert(s.keywordsLearned.filter(k => k === 'CROSSED').length === 1, 'CROSSED taught twice');
});
test('the Marks cap at five and Storied never scars', () => {
  let s = newGame();
  for (let i = 0; i < 7; i++) { s.player.health = 0; s = applyDeath(s).state; }
  assert(s.player.marks.length === MARK_POOL.length, 'the pool overflowed');
  let st = newGame();
  st.difficulty.combat = 'storied';
  st.player.health = 0;
  st = applyDeath(st).state;
  assert(st.player.marks.length === 0 && !st.flags.crossed, 'Storied broke its promise');
});
test('Perilous charges double the crossing fee', () => {
  const a = newGame(); a.player.health = 0; a.player.coin = 20;
  const frontier = applyDeath(a).state.player.coin;
  const b = newGame(); b.player.health = 0; b.player.coin = 20; b.difficulty.combat = 'perilous';
  const perilous = applyDeath(b).state.player.coin;
  assert(20 - perilous === 2 * (20 - frontier), 'fees wrong: ' + frontier + ' vs ' + perilous);
});
test('the wisp ledger is seeded, even-handed, and respects wards', () => {
  const names = ['a pale light by the creek', 'a light on the glacis', 'a light up the quarry road',
                 'wisp d', 'wisp e', 'wisp f', 'wisp g', 'wisp h'];
  const kinds = names.map(n => resolveWisp(n).kind);
  assert(kinds.includes('cache') && kinds.includes('snare'), 'the table lost its balance');
  assert(resolveWisp('wisp d').kind === resolveWisp('wisp d').kind, 'not deterministic');
  const snareName = names.find(n => resolveWisp(n).kind === 'snare');
  assert(wardedResolve(snareName, true).hurt === 0, 'the ward failed');
  assert(wardedResolve(snareName, false).hurt > 0, 'the snare pulled its punch unwarded');
});
test('the ritual needs the favor, and rank two needs the ritual', () => {
  const doyle2 = JSON.parse(readFileSync(new URL('../src/data/dialogs/brahm.json', import.meta.url)));
  let s = newGame();
  let r = ask(doyle2, 'RITUAL', s, vocab);
  assert(!r.state.flags?.ritualOffered && r.text.includes('herbs'), 'she offered a stranger the door');
  r = ask(doyle2, 'HERBS', s, vocab);
  assert(r.text.includes('sassafras') && !r.state.flags?.brahmFavor, 'she took payment never given');
  s = addItem(addItem(s, 'dried_sassafras', REG).state, 'dried_sassafras', REG).state;
  r = ask(doyle2, 'HERBS', s, vocab);
  assert(r.state.flags.brahmFavor && countOf(r.state, 'dried_sassafras') === 0, 'the herbs were not taken');
  s = r.state;
  r = ask(doyle2, 'RITUAL', s, vocab);
  assert(r.state.flags.ritualOffered, 'the offer never came');
  const s2base = { ...r.state, player: { ...r.state.player, sight: 1 } };
  let s2 = s2base;
  assert(!attemptRank(s2, 2).ok, 'rank two opened without the ritual');
  s2.flags.brahmRitual = true;
  assert(attemptRank(s2, 2).ok, 'the ritual did not open the door');
});
test('the world holds the other world: the grave murmurs PAPER, the ruins offer sleep, three lights burn', () => {
  const town = parseMap(JSON.parse(readFileSync(new URL('../assets/maps/town.json', import.meta.url))));
  const objs = town.objects.interact || [];
  const grave = objs.find(o => o.type === 'murmur' && o.props.teaches === 'PAPER');
  assert(grave && grave.props.rank === 2 && grave.props.requires === 'coombsDead', 'the grave is silent');
  assert(objs.some(o => o.type === 'sleeprough'), 'nowhere to sleep rough');
  assert(objs.filter(o => o.type === 'wisp').length === 3, 'the lights are out');
  assert(town.findObject('spawns', 'brahm'), 'the widow is missing');
});
test('a format 5 save migrates to 6 with health, difficulty, and wards', () => {
  const v5 = JSON.stringify({
    format: 5, version: '0.5.0',
    player: { marks: [], sight: 0, coin: 5, coat: 'drover', equip: {} },
    clock: { day: 2, hour: 9 }, hueCry: { level: 0, heat: 0, witnessedCoat: null },
    flags: {}, trust: {}, reputation: { town: 0, kirk: 0, hills: 0, road: 0 },
    keywordsLearned: ['NAME'], inventory: [], stash: [], clues: [], rumors: [], job: null, map: 'town'
  });
  const s = deserialize(v5);
  assert(s.format === SAVE_FORMAT && s.player.health === 10 && s.difficulty.combat === 'frontier' && Array.isArray(s.wards), 'migration incomplete');
});

console.log('hue and cry, the act (v0.7.0)');
const { verdict, witnessScore, kentScore, GUILTY_AT } = await import('../src/game/trial.js');
const { evidenceScore, EVIDENCE } = await import('../src/game/quest.js');
function throughAct1(warned) {
  let s = findBody(freshCase());
  s = addClue(s, 'gentleman_letter');
  if (warned) s.flags.warnedRood = true;
  s = advanceCase(s).state;
  s.flags.sleepCount = (s.flags.sleepCount || 0) + 1;
  return advanceCase(s).state;   // act1 closes, marks recorded
}
function sleepOnce(s) {
  s = { ...s, flags: { ...s.flags, sleepCount: (s.flags.sleepCount || 0) + 1 } };
  return advanceCase(s).state;
}
test('Rood lives if warned and dies if not, and both roads reach the revival', () => {
  let a = sleepOnce(throughAct1(true));
  assert(a.flags.roodAlive && !a.flags.roodDead, 'the warning failed');
  a = sleepOnce(a);
  assert(a.flags.act2Complete, 'the warned road stalled');
  let b = sleepOnce(throughAct1(false));
  assert(b.flags.roodDead && b.clues.includes('rood_attacked'), 'the razor missed unwarned');
  b = sleepOnce(b);
  assert(b.flags.act2Complete, 'the unwarned road stalled');
});
test('the verdict math holds: rank zero physical evidence convicts alone', () => {
  const ev = EVIDENCE.plat_mismatch + EVIDENCE.boots_matched + EVIDENCE.rubbings_matched;
  assert(ev === 6, 'the physical file weighs ' + ev);
  assert(verdict(ev, 0, 0).verdict === 'guilty', 'mathematics perjured itself');
});
test('a thin file hangs the jury and a thinner one acquits', () => {
  assert(verdict(3, 1, 0).verdict === 'hung', 'four should hang');
  assert(verdict(2, 1, 0).verdict === 'acquitted', 'three should acquit');
});
test('witnesses and the bench lift a hung file over the bar', () => {
  const ev = 3;
  const s = newGame();
  s.flags.beallCertain = true;
  s.flags.widowTestimony = true;
  s.flags.kentAlly = true;
  const total = verdict(ev, witnessScore(s), kentScore(s));
  assert(witnessScore(s) === 3 && kentScore(s) === 1, 'the court misheard');
  assert(total.verdict === 'guilty', 'testimony counted for nothing: ' + total.total);
});
test('the provocation route survives, scars, and convinces Beall, and Storied takes no damage', () => {
  let s = throughAct1(true);
  s.flags.ganttProvoked = true;
  const before = s.player.health;
  s = advanceCase(s).state;
  assert(s.flags.survivedAmbush && s.flags.beallCertain, 'the overlook was empty');
  assert(s.player.health === Math.max(1, before - 3), 'the ambush pulled its chain');
  let st = throughAct1(true);
  st.difficulty.combat = 'storied';
  st.flags.ganttProvoked = true;
  st = advanceCase(st).state;
  assert(st.player.health === st.player.maxHealth || st.player.health === before, 'Storied bled');
});
test('the ambush never kills: health floors at one', () => {
  let s = throughAct1(true);
  s.player.health = 2;
  s.flags.ganttProvoked = true;
  s = advanceCase(s).state;
  assert(s.player.health === 1, 'the beat killed: ' + s.player.health);
});
test('the deal closes the act and wears its poison openly', () => {
  let s = sleepOnce(sleepOnce(throughAct1(true)));
  s.flags.verdict = 'deal';
  s = advanceCase(s).state;
  assert(s.flags.act3Complete, 'the deal did not close the act');
});
test('confession flags become case evidence through the same pipe', () => {
  let s = newGame();
  s.flags.bootsMatched = true;
  s.flags.hasRubbings = true;
  s.flags.benchmarksAll = true;
  s = cluesFromFlags(s);
  assert(evidenceScore(s) === 6, 'the pipe leaked: ' + evidenceScore(s));
  assert(s.flags.clue_boots_matched, 'clue flags did not follow');
});
test('the courtroom, the chambers, the widow, the ferry, and five benchmarks stand in the world', () => {
  const town = parseMap(JSON.parse(readFileSync(new URL('../assets/maps/town.json', import.meta.url))));
  const objs = town.objects.interact || [];
  assert(objs.filter(o => o.type === 'benchmark').length === 5, 'benchmarks miscounted');
  assert(objs.some(o => o.type === 'ferry'), 'the flat is adrift');
  const court = parseMap(JSON.parse(readFileSync(new URL('../assets/maps/int_courthouse.json', import.meta.url))));
  const cobjs = court.objects.interact || [];
  assert(cobjs.some(o => o.type === 'accuse') && cobjs.some(o => o.type === 'chambers'), 'the court is unfurnished');
  assert(cobjs.some(o => o.type === 'murmur' && o.props.clue === 'he_measures'), 'the records room is silent');
  const mule = parseMap(JSON.parse(readFileSync(new URL('../assets/maps/int_bluemule.json', import.meta.url))));
  assert((mule.objects.interact || []).some(o => o.type === 'widow'), 'the widow never arrived');
});

console.log('under the mountain (v0.8.0)');
const { chooseEnding, adoptPet, ENDINGS } = await import('../src/game/quest.js');
function atTheChamber(sight) {
  let s = sleepOnce(sleepOnce(throughAct1(true)));
  s.flags.verdict = 'guilty';
  s = advanceCase(s).state;              // act3 closes
  s = sleepOnce(s);                       // nan goes missing
  assert(s.flags.nanMissing, 'Nan never went missing');
  s.player.sight = sight;
  s.flags.inChamber = true;
  return s;
}
test('both endings branch from one save at the chamber', () => {
  const branch = atTheChamber(2);
  const a = chooseEnding(branch, 'ledger_closed');
  const b = chooseEnding(branch, 'buried_truth');
  assert(a.ok && a.state.flags.ending === 'ledger_closed', 'the seal failed');
  assert(b.ok && b.state.flags.ending === 'buried_truth', 'the rites failed');
  assert(!branch.flags.ending, 'the branch point was consumed');
  const closedA = advanceCase(a.state).state, closedB = advanceCase(b.state).state;
  assert(closedA.flags.act4Complete && closedB.flags.act4Complete, 'an ending did not close the act');
});
test('the Buried Truth asks for the Listening', () => {
  const skeptic = atTheChamber(0);
  const r = chooseEnding(skeptic, 'buried_truth');
  assert(!r.ok, 'the second door opened unasked');
  assert(chooseEnding(skeptic, 'ledger_closed').ok, 'the skeptic was denied the seal');
});
test('an ending chosen is chosen for good', () => {
  const s = chooseEnding(atTheChamber(2), 'ledger_closed').state;
  assert(!chooseEnding(s, 'buried_truth').ok, 'the mountain allowed a second opinion');
});
test('Nan goes missing only after the third act sleeps', () => {
  let s = sleepOnce(sleepOnce(throughAct1(true)));
  s.flags.verdict = 'deal';
  s = advanceCase(s).state;
  assert(!s.flags.nanMissing, 'the mill stopped early');
  s = sleepOnce(s);
  assert(s.flags.nanMissing, 'the mill never stopped');
});
test('one companion at a time, and the swap is honest', () => {
  let s = newGame();
  let r = adoptPet(s, 'dog');
  assert(r.ok && r.state.pet === 'dog', 'the cur stayed');
  r = adoptPet(r.state, 'dog');
  assert(!r.ok, 'adopted the same dog twice');
  r = adoptPet({ ...s, pet: 'dog' }, 'cat');
  assert(r.ok && r.state.pet === 'cat', 'the cat was refused');
});
test('the night run buys road standing, honest work does not', () => {
  let s = newGame();
  s = acceptJob(s, 'nightrun').state;
  s = workJob(s, 'nightrun', 'pickup', 23).state;
  s = workJob(s, 'nightrun', 'dropoff', 23).state;
  assert(s.reputation.road === 2, 'the Road forgot: ' + s.reputation.road);
  let h = newGame();
  h = acceptJob(h, 'freight').state;
  h = workJob(h, 'freight', 'pickup', 12).state;
  h = workJob(h, 'freight', 'dropoff', 12).state;
  assert(h.reputation.road === 0, 'honest freight bought the wrong friends');
});
test('the caves descend: entry, chamber, two lights, the pool, and the way back', () => {
  const caves = parseMap(JSON.parse(readFileSync(new URL('../assets/maps/caves.json', import.meta.url))));
  assert(caves.findObject('spawns', 'entry'), 'no way in');
  const objs = caves.objects.interact || [];
  assert(objs.some(o => o.type === 'chamber'), 'no chamber');
  assert(objs.filter(o => o.type === 'wisp').length === 2, 'the dark is unlit');
  assert((caves.objects.doors || []).some(d => d.props.target === 'town' && d.props.spawn === 'from_caves'), 'no daylight');
  const town = parseMap(JSON.parse(readFileSync(new URL('../assets/maps/town.json', import.meta.url))));
  const mouth = (town.objects.doors || []).find(d => d.props.target === 'caves');
  assert(mouth && mouth.props.requires === 'nanMissing', 'the mouth is open too soon');
  assert(town.findObject('spawns', 'from_caves'), 'no return to daylight');
});
test('the town holds the companions, the crossing, and the four farms', () => {
  const town = parseMap(JSON.parse(readFileSync(new URL('../assets/maps/town.json', import.meta.url))));
  const objs = town.objects.interact || [];
  assert(objs.some(o => o.type === 'dog') && objs.some(o => o.type === 'cat'), 'the companions are strays');
  assert(objs.some(o => o.type === 'noquestions'), 'the crossing never happens');
  assert(objs.filter(o => o.type === 'signfarm').length === 4, 'the farms miscounted');
});
test('pet sprites exist at their small spec', () => {
  for (const n of ['dog', 'cat']) {
    const s = pngSize('../assets/sprites/' + n + '.png');
    assert(s.w === 20 && s.h === 8, n + ' sheet is ' + s.w + 'x' + s.h);
  }
});
test('a format 6 save migrates to 7 with an empty heel', () => {
  const v6 = JSON.stringify({
    format: 6, version: '0.6.0',
    player: { marks: [], sight: 0, coin: 5, coat: 'drover', equip: {}, health: 10, maxHealth: 10, fedAbs: 0 },
    difficulty: { combat: 'frontier', survival: 'buffs', huecry: 'standard' }, wards: [],
    clock: { day: 2, hour: 9 }, hueCry: { level: 0, heat: 0, witnessedCoat: null },
    flags: {}, trust: {}, reputation: { town: 0, kirk: 0, hills: 0, road: 0 },
    keywordsLearned: ['NAME'], inventory: [], stash: [], clues: [], rumors: [], job: null, map: 'town'
  });
  const s = deserialize(v6);
  assert(s.format === SAVE_FORMAT && s.pet === null, 'migration incomplete');
});

test('the loader refuses maps with duplicate layer names', () => {
  const dup = JSON.parse(JSON.stringify(rawMap));
  dup.layers.push(JSON.parse(JSON.stringify(dup.layers[0])));
  let threw = false;
  try { parseMap(dup); } catch { threw = true; }
  assert(threw, 'a shadowed layer slipped through');
});

console.log('the polish pass (v0.9.0)');
const { buildCharacter, ORIGINS, TRADES, BURDENS } = await import('../src/game/creator.js');
const { nextHint } = await import('../src/game/hints.js');
test('every origin, trade, and burden builds a legal character', () => {
  for (const o of Object.keys(ORIGINS)) for (const t of Object.keys(TRADES)) for (const b of Object.keys(BURDENS)) {
    const s = buildCharacter(newGame(), { origin: o, trade: t, burden: b }, REG);
    assert(s.player.origin === o && s.player.trade === t && s.player.burden === b, 'identity lost');
    assert(s.inventory.length <= 16, o + '/' + t + '/' + b + ' overpacks the satchel');
  }
});
test('the burdens carry their weights: debt empties the purse, the warrant primes Cresap, sight opens born', () => {
  const debt = buildCharacter(newGame(), { origin: 'drover', trade: 'trapper', burden: 'debt' }, REG);
  assert(debt.player.coin === 2, 'the debt forgot itself');
  const wanted = buildCharacter(newGame(), { origin: 'veteran', trade: 'gunsmith', burden: 'warrant' }, REG);
  assert(wanted.flags.WARRANT && wanted.flags.burdenWarrant, 'the paper never followed');
  const sighted = buildCharacter(newGame(), { origin: 'german', trade: 'apothecary', burden: 'secondsight' }, REG);
  assert(sighted.player.sight === 1 && sighted.keywordsLearned.includes('SEEN'), 'born blind');
  const grieving = buildCharacter(newGame(), { origin: 'gentry', trade: 'preacher', burden: 'letter' }, REG);
  assert(grieving.inventory.some(e => e.id === 'letter'), 'the letter was lost in the post');
});
test('origins gate words and standing as the design promised', () => {
  const s = buildCharacter(newGame(), { origin: 'freedman', trade: 'surveyor', burden: 'debt' }, REG);
  assert(s.keywordsLearned.includes('PAPERS') && s.trust.freeman === 1, 'the mirror never met itself');
  const d = buildCharacter(newGame(), { origin: 'drover', trade: 'surveyor', burden: 'debt' }, REG);
  assert(d.reputation.road === 1, 'the road forgot its own');
});
test('the trade tools arrive with condition where condition is due', () => {
  const g = buildCharacter(newGame(), { origin: 'veteran', trade: 'gunsmith', burden: 'debt' }, REG);
  const gun = g.inventory.find(e => e.id === 'flintlock_pistol');
  assert(gun && gun.cond === 'sound', 'the pistol arrived broken or absent');
});
test('the trail answers every stage of Act I', () => {
  let s = newGame();
  assert(nextHint(s).includes('Baltimore'), 'no first step');
  s = freshCase();
  assert(nextHint(s).toLowerCase().includes('morning'), 'no second step');
  s = findBody(s);
  assert(nextHint(s).includes('TAM'), 'the constable was never pointed at');
  s.flags.hiredByBeall = true;
  assert(nextHint(s).includes('QUARRY'), 'the threads were never named');
  s = addClue(s, 'gentleman_letter');
  s = advanceCase(s).state;
  assert(nextHint(s).toLowerCase().includes('sleep'), 'the taut thread got no advice');
});
test('the trail reaches all the way to the wagons', () => {
  const s = chooseEnding(atTheChamber(2), 'ledger_closed').state;
  assert(nextHint(advanceCase(s).state).includes('wagons'), 'the epilogue points nowhere');
});
test('the burden posts stand in the world', () => {
  const mule = parseMap(JSON.parse(readFileSync(new URL('../assets/maps/int_bluemule.json', import.meta.url))));
  const mobjs = mule.objects.interact || [];
  assert(mobjs.some(o => o.type === 'creditor') && mobjs.some(o => o.type === 'manhunter'), 'the Mule is short two strangers');
  const town = parseMap(JSON.parse(readFileSync(new URL('../assets/maps/town.json', import.meta.url))));
  assert((town.objects.interact || []).some(o => o.type === 'letterquest'), 'the Lamar door never got its letter');
});

test('the boot beacon and its watchdog both stand', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const mainjs = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert(mainjs.startsWith('window.__CAIUCTUCUC_BOOTED'), 'the beacon is not first');
  assert(html.includes('__CAIUCTUCUC_BOOTED') && html.includes('file:'), 'the watchdog is unposted');
  assert(html.indexOf('__CAIUCTUCUC_BOOTED') < html.indexOf('type="module"'), 'the watchdog arrives too late');
});

console.log('the postcard pass (v0.10.0)');
test('the splash postcard exists at its full size', () => {
  const s = pngSize('../assets/splash.png');
  assert(s.w === 960 && s.h === 640, 'the postcard is ' + s.w + 'x' + s.h);
});
test('Beall and the widow finally have their own faces', () => {
  for (const n of ['beall', 'brahm']) {
    const s = pngSize('../assets/sprites/npc_' + n + '.png');
    assert(s.w === 64 && s.h === 24, n + ' sheet is ' + s.w + 'x' + s.h);
  }
});
test('fill mode scales fractionally and crisp mode stays whole', () => {
  assert(fitScale(1920, 1080, 480, 320, 'crisp') === 3, 'crisp broke');
  const fill = fitScale(1920, 1080, 480, 320, 'fill');
  assert(Math.abs(fill - 3.375) < 0.001, 'fill should reach 3.375: ' + fill);
  assert(fitScale(1920, 1080, 480, 320) === 3, 'the default mode drifted');
});
test('the town wears windows and wildflowers', () => {
  const raw = JSON.parse(readFileSync(new URL('../assets/maps/town.json', import.meta.url)));
  const ground = raw.layers.find(l => l.name === 'ground').data;
  assert(ground.includes(16), 'no windows on any facade');
  assert(ground.includes(13) && ground.includes(14) && ground.includes(15), 'the grass is uniform');
});
test('the splash overlay stands ahead of the module and dismisses to the game', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert(html.includes('id="splash"') && html.includes('assets/splash.png'), 'no postcard at the door');
  const mainjs = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert(mainjs.includes('dismissSplash'), 'the door never opens');
});

console.log('the overworld pass (v0.11.0)');
const { miniPos } = await import('../src/engine/scale.js');
test('the minimap dot stays inside its gray county', () => {
  const mid = miniPos(768, 512, 1536, 1024, 72, 34);
  assert(mid.x === 36 && mid.y === 17, 'the center drifted: ' + mid.x + ',' + mid.y);
  const edge = miniPos(1536, 1024, 1536, 1024, 72, 34);
  assert(edge.x === 70 && edge.y === 32, 'the dot escaped the map');
  const origin = miniPos(0, 0, 1536, 1024, 72, 34);
  assert(origin.x === 0 && origin.y === 0, 'the origin moved');
});
test('the band takes the top of the canvas and the camera respects it', () => {
  const mainjs = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert(mainjs.includes('const HUD_H = 48'), 'the band has no height');
  assert(mainjs.includes('canvas.height - HUD_H, map.width'), 'the camera ignores the band');
  assert(mainjs.includes('drawHeart') && mainjs.includes("'-HALE-'"), 'no hearts on the watch');
  assert(mainjs.includes('drawHud()'), 'the band is never painted');
});

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
