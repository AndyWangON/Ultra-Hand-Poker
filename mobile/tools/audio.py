"""Synthesize Ultra Hand Poker sound effects (44.1kHz mono 16-bit WAV)."""
import numpy as np, wave, os, sys
SR = 44100
OUT = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/uhp/audio'
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(42)

def t(d): return np.arange(int(SR * d)) / SR
def env(n, a=0.002, d=0.1, curve=1.0):
    x = np.arange(n) / SR
    e = np.minimum(1, x / max(a, 1e-4)) * np.exp(-np.maximum(0, x - a) / d) ** curve
    return e
def noise(d): return rng.standard_normal(int(SR * d))
def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); s = 0.0
    for i, v in enumerate(x): s = (1 - a) * v + a * s; y[i] = s
    return y
def bandpass(x, lo, hi): return onepole_lp(x, hi) - onepole_lp(x, lo)
def sweep_lp(x, f0, f1):
    fc = np.geomspace(f0, f1, len(x)); a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); s = 0.0
    for i, v in enumerate(x): s = (1 - a[i]) * v + a[i] * s; y[i] = s
    return y
def bell(f, d, decay=0.4, partials=((1, 1), (2.76, .45), (5.4, .25), (8.9, .12))):
    tt = t(d); y = np.zeros_like(tt)
    for m, amp in partials: y += amp * np.sin(2 * np.pi * f * m * tt) * np.exp(-tt / (decay / m ** .5))
    return y * env(len(tt), .002, 10)
def reverb(x, length=0.6, mix=0.25, decay=0.18):
    ir = rng.standard_normal(int(SR * length)) * np.exp(-t(length) / decay)
    ir = onepole_lp(ir, 5000)
    wet = np.convolve(x, ir)
    wet /= (np.max(np.abs(wet)) + 1e-9)
    y = np.concatenate([x, np.zeros(len(ir) - 1)])
    return y * (1 - mix) + wet * mix * np.max(np.abs(x))
def mix(*parts):
    n = max(len(p[1]) + int(p[0] * SR) for p in parts); y = np.zeros(n)
    for off, p in parts: i = int(off * SR); y[i:i + len(p)] += p
    return y
def save(name, y, gain=0.9):
    y = y / (np.max(np.abs(y)) + 1e-9) * gain
    fade = min(len(y), 400); y[-fade:] *= np.linspace(1, 0, fade)
    with wave.open(f'{OUT}/{name}.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
    print(name, f'{len(y)/SR:.2f}s')

# card deal "fwip"
d = 0.12; n = noise(d); y = bandpass(n, 1200, 7000) * env(len(n), .004, .035)
save('card_deal', y + 0.3 * bandpass(noise(d), 300, 1500) * env(len(n), .001, .015), .75)
# card place / snap
d = 0.08; y = bandpass(noise(d), 800, 6000) * env(int(SR * d), .0005, .008) + 0.6 * np.sin(2 * np.pi * 140 * t(d)) * env(int(SR * d), .001, .02)
save('card_place', y, .8)
# select: woody tick + rising blip
d = 0.12; tt = t(d); blip = np.sin(2 * np.pi * (700 + 900 * tt / d) * tt) * env(len(tt), .002, .035)
save('card_select', 0.7 * blip + bandpass(noise(d), 1500, 6000) * env(len(tt), .0005, .006), .7)
d = 0.1; tt = t(d); blip = np.sin(2 * np.pi * (900 - 400 * tt / d) * tt) * env(len(tt), .002, .03)
save('card_deselect', 0.7 * blip + 0.6 * bandpass(noise(d), 1200, 5000) * env(len(tt), .0005, .005), .55)
# hover tick
d = 0.04; save('card_hover', bandpass(noise(d), 2500, 9000) * env(int(SR * d), .0003, .004) + .3 * np.sin(2 * np.pi * 2200 * t(d)) * env(int(SR * d), .001, .008), .35)
# shuffle riffle
parts = [(0, bandpass(noise(.9), 500, 4000) * np.concatenate([np.linspace(0, 1, int(SR * .1)), np.ones(int(SR * .6)), np.linspace(1, 0, int(SR * .2))]) * .12)]
for i in range(46):
    tk = bandpass(noise(.02), 1500, 8000) * env(int(SR * .02), .0003, .004)
    parts.append((0.05 + i * 0.016 + rng.uniform(-.004, .004), tk * rng.uniform(.5, 1)))
parts.append((0.85, bandpass(noise(.1), 200, 3000) * env(int(SR * .1), .001, .03) * 1.4))
save('shuffle', mix(*parts), .75)
# whoosh (discard)
d = 0.35; n = noise(d); sh = np.sin(np.pi * np.arange(len(n)) / len(n)) ** 2
save('discard', sweep_lp(n, 600, 5000) * sh * 0.8 + bandpass(noise(d), 200, 800) * sh * .3, .7)
# play: whoosh up + thump
d = 0.28; n = noise(d); sh = np.sin(np.pi * np.arange(len(n)) / len(n)) ** 1.5
thump = np.sin(2 * np.pi * 70 * t(.25) * (1 - .4 * t(.25))) * env(int(SR * .25), .002, .09)
save('play', mix((0, sweep_lp(n, 400, 7000) * sh * .7), (0.2, thump * 1.2)), .85)
# chip clacks (3 variants)
for k in range(3):
    d = 0.18; tt = t(d); f0 = [2300, 2650, 2050][k]
    y = sum(a * np.sin(2 * np.pi * f0 * m * tt) * np.exp(-tt / (0.03 / m)) for m, a in ((1, 1), (1.37, .6), (2.1, .4), (3.3, .2)))
    y += 1.5 * bandpass(noise(d), 2000, 9000) * env(len(tt), .0003, .003)
    y2 = np.roll(y, int(SR * rng.uniform(.035, .06))) * .55
    save(f'chip{k+1}', y + y2, .6)
# score tick (bright blip)
d = 0.07; tt = t(d); y = (np.sin(2 * np.pi * 1320 * tt) + .35 * np.sign(np.sin(2 * np.pi * 1320 * tt)) * .3 + .4 * np.sin(2 * np.pi * 2640 * tt)) * env(len(tt), .001, .022)
save('score_tick', y, .55)
# card score pop (pluck + coin)
d = 0.35; y = bell(1046, d, .12) + .4 * bell(1568, d, .08)
save('card_score', reverb(y, .4, .2, .1), .7)
# hand banner impact
d = 0.9; tt = t(d)
boom = np.sin(2 * np.pi * 55 * tt * (1 - .3 * tt)) * env(len(tt), .003, .25)
hit = bandpass(noise(d), 100, 2500) * env(len(tt), .001, .06)
save('impact', reverb(boom * 1.2 + hit * .7 + .25 * bell(523, d, .5), .8, .3, .25), .9)
# multiplier hit
d = 1.0; y = mix((0, np.sin(2 * np.pi * 82 * t(.5)) * env(int(SR * .5), .002, .15)), (0, bell(784, d, .6)), (0.06, bell(1175, d, .5) * .7), (0.12, bell(1568, d, .4) * .5))
save('mult', reverb(y, .8, .3, .3), .85)
# tier fanfare
notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]
parts = [(i * 0.09, bell(f, 1.6, .7) * (0.8 + i * .05)) for i, f in enumerate(notes)]
parts += [(0.5, bell(f, 1.8, 1.0) * .45) for f in (523.25, 659.25, 783.99, 1046.5)]
sh = bandpass(noise(1.6), 4000, 12000) * np.exp(-t(1.6) / .5) * .15
parts.append((0.45, sh))
save('tier', reverb(mix(*parts), 1.0, .35, .35), .85)
# payout coin cascade
parts = []
for i in range(34):
    f = rng.choice([2093, 2349, 2637, 3136, 3520]) * rng.uniform(.98, 1.02)
    parts.append((rng.uniform(0, 1.4) * (i / 34) ** .7, bell(f, .4, .08, ((1, 1), (2.4, .4), (4.1, .2))) * rng.uniform(.4, .9)))
parts += [(0, bell(f, 2.0, 1.0) * .5) for f in (261.6, 329.6, 392, 523.25)]
save('payout', reverb(mix(*parts), 1.0, .3, .3), .85)
# button press
d = 0.06; save('button', .8 * np.sin(2 * np.pi * 420 * t(d)) * env(int(SR * d), .001, .015) + bandpass(noise(d), 1000, 5000) * env(int(SR * d), .0005, .004), .6)
# error buzz
d = 0.18; tt = t(d); save('error', np.sign(np.sin(2 * np.pi * 110 * tt)) * onepole_lp(np.ones(len(tt)), 50) * env(len(tt), .002, .06) * .5 + .3 * np.sin(2 * np.pi * 116 * tt) * env(len(tt), .002, .06), .45)
# swoosh (overlay/banner in)
d = 0.4; n = noise(d); sh = np.sin(np.pi * np.arange(len(n)) / len(n)) ** 3
save('swoosh', sweep_lp(n, 300, 9000) * sh, .5)
