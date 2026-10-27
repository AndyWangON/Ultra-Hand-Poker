/* Ultra Hand Poker — layered sound engine
   WebAudio when served over http(s); HTMLAudio fallback when opened via file:// */
(function (U) {
  const NAMES = ['card_deal', 'card_place', 'card_select', 'card_deselect', 'card_hover', 'shuffle', 'discard', 'play',
    'chip1', 'chip2', 'chip3', 'score_tick', 'card_score', 'impact', 'mult', 'tier', 'payout', 'button', 'error', 'swoosh'];
  const S = { ctx: null, master: null, buffers: {}, els: {}, enabled: true, volume: 0.8, webaudio: false, lastHover: 0 };

  function initElements() {
    NAMES.forEach(n => { const a = new Audio(`audio/${n}.wav`); a.preload = 'auto'; S.els[n] = a; });
  }
  async function initWebAudio() {
    if (location.protocol === 'file:') return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      S.ctx = new AC(); S.master = S.ctx.createGain(); S.master.gain.value = S.volume;
      const comp = S.ctx.createDynamicsCompressor(); comp.threshold.value = -10; comp.ratio.value = 4;
      S.master.connect(comp); comp.connect(S.ctx.destination);
      await Promise.all(NAMES.map(async n => {
        const r = await fetch(`audio/${n}.wav`); const ab = await r.arrayBuffer();
        S.buffers[n] = await new Promise((res, rej) => S.ctx.decodeAudioData(ab, res, rej));
      }));
      S.webaudio = true;
    } catch (e) { S.webaudio = false; }
  }
  function unlock() { if (S.ctx && S.ctx.state === 'suspended') S.ctx.resume(); }
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => window.addEventListener(ev, unlock, { passive: true }));

  function play(name, { vol = 1, rate = 1, delay = 0, jitter = 0.03 } = {}) {
    if (!S.enabled || S.volume <= 0) return;
    const r = rate * (1 + (Math.random() * 2 - 1) * jitter);
    if (S.webaudio && S.buffers[name]) {
      const src = S.ctx.createBufferSource(); src.buffer = S.buffers[name]; src.playbackRate.value = r;
      const g = S.ctx.createGain(); g.gain.value = vol; src.connect(g); g.connect(S.master);
      src.start(S.ctx.currentTime + delay / 1000);
      return;
    }
    const base = S.els[name]; if (!base) return;
    const fire = () => { try { const a = base.cloneNode(); a.volume = Math.max(0, Math.min(1, vol * S.volume)); a.preservesPitch = false; a.mozPreservesPitch = false; a.webkitPreservesPitch = false; a.playbackRate = r; a.play().catch(() => { }); } catch (e) { } };
    delay ? setTimeout(fire, delay) : fire();
  }
  const chip = (o = {}) => play('chip' + (1 + Math.floor(Math.random() * 3)), o);

  // Layered, named effects used by the game
  const sfx = {
    hover() { const t = performance.now(); if (t - S.lastHover < 60) return; S.lastHover = t; play('card_hover', { vol: .35, rate: 1.1 }); },
    select() { play('card_select', { vol: .8 }); play('card_place', { vol: .35, rate: 1.2 }); },
    deselect() { play('card_deselect', { vol: .7 }); },
    deal(i = 0) { play('card_deal', { vol: .75, rate: 1 + i * .03, delay: 0 }); },
    land() { play('card_place', { vol: .45, rate: 1.05 }); },
    shuffle() { play('shuffle', { vol: .9 }); chip({ vol: .4, delay: 650 }); },
    discard() { play('discard', { vol: .8 }); play('card_deal', { vol: .5, rate: .8, delay: 60 }); },
    play() { play('play', { vol: .9 }); play('swoosh', { vol: .4, rate: 1.2 }); },
    scoreCard(i) { play('card_score', { vol: .8, rate: 1 + i * .09, jitter: 0 }); play('score_tick', { vol: .5, rate: 1 + i * .12, jitter: 0 }); chip({ vol: .35 }); },
    tick(p) { play('score_tick', { vol: .28, rate: .9 + p * .8, jitter: 0 }); },
    banner() { play('impact', { vol: .9 }); play('swoosh', { vol: .5 }); },
    tier(i) { play('tier', { vol: .95, rate: 1 + Math.min(i, 7) * .02, jitter: 0 }); play('mult', { vol: .8, delay: 80 }); play('impact', { vol: .6 }); },
    payout(big) { play('payout', { vol: .95 }); for (let i = 0; i < (big ? 8 : 4); i++) chip({ vol: .45, delay: 120 + i * 110 }); },
    noPayout() { play('card_deselect', { vol: .7, rate: .7 }); play('impact', { vol: .4, rate: .8 }); },
    button() { play('button', { vol: .6 }); },
    chip() { chip({ vol: .7 }); },
    error() { play('error', { vol: .6 }); },
  };
  U.audio = {
    init() { initElements(); initWebAudio(); },
    play, sfx,
    setEnabled(v) { S.enabled = v; },
    get enabled() { return S.enabled; },
    setVolume(v) { S.volume = v; if (S.master) S.master.gain.value = v; },
  };
})(window.UHP);
