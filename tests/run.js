// Minimal test harness, no dependencies. Run: node tests/run.js
import { newGame, serialize, deserialize } from '../src/game/save.js';
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
  assert(s.format === 4, 'not migrated to current format');
  assert(s.map === 'town' && Array.isArray(s.rumors) && Array.isArray(s.stash), 'chain migration incomplete');
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
  assert(s.format === 4 && s.map === 'town' && s.job === null && Array.isArray(s.rumors), 'migration incomplete');
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
test('four period tilesheets exist at 12 tiles by 16 pixels', () => {
  for (const p of ['day', 'dusk', 'night', 'fog']) {
    const s = pngSize('../assets/tiles/tileset_' + p + '.png');
    assert(s.w === 192 && s.h === 16, p + ' sheet is ' + s.w + 'x' + s.h);
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
  assert(s.format === 4 && Array.isArray(s.stash), 'migration incomplete');
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

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
