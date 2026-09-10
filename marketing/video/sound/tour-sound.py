import numpy as np, wave, struct, sys
SR = 48000
DUR = 105.05
buf = np.zeros(int(SR * DUR), dtype=np.float64)

def env(n, a=0.005, d=0.25, s=0.0, r=0.2, hold=0.0):
    t = np.arange(n) / SR
    total = n / SR
    e = np.ones(n)
    at = int(a * SR); dt = int(d * SR); rt = int(r * SR)
    e[:at] = np.linspace(0, 1, at) if at else 1
    if dt: e[at:at+dt] = np.linspace(1, s if s else 0.0001, dt)
    if s:
        e[at+dt:n-rt] = s
        e[n-rt:] = np.linspace(s, 0, rt) if rt else 0
    else:
        e[at+dt:] = 0.0001
    return e

def tone(freq, dur, amp=0.3, a=0.004, d=None, harmonics=(1.0, 0.35, 0.12), detune=0.0):
    n = int(dur * SR); t = np.arange(n) / SR
    d = d if d is not None else dur * 0.9
    sig = np.zeros(n)
    for i, h in enumerate(harmonics):
        f = freq * (i + 1) * (1 + detune * (i % 2 * 2 - 1))
        sig += h * np.sin(2 * np.pi * f * t)
    e = np.exp(-t / (d / 4.0))
    ramp = np.minimum(1, t / a)
    return amp * sig * e * ramp

def click(amp=0.18, dur=0.035):
    n = int(dur * SR); t = np.arange(n) / SR
    noise = np.random.default_rng(1).standard_normal(n)
    # soften: moving average low-pass
    k = 24
    noise = np.convolve(noise, np.ones(k) / k, mode='same')
    return amp * noise * np.exp(-t / (dur / 5))

def whoosh(dur=0.5, amp=0.12, rising=True, seed=2):
    n = int(dur * SR); t = np.arange(n) / SR
    noise = np.random.default_rng(seed).standard_normal(n)
    # sweep brightness by varying smoothing window over time
    out = np.zeros(n)
    win = np.linspace(80 if rising else 8, 8 if rising else 80, 5).astype(int)
    seg = n // 5
    for i in range(5):
        k = max(2, win[i])
        sl = slice(i * seg, (i + 1) * seg if i < 4 else n)
        out[sl] = np.convolve(noise[sl], np.ones(k) / k, mode='same')
    e = np.sin(np.pi * t / dur) ** 1.5
    return amp * out * e

def place(sig, at, gain=1.0):
    i = int(at * SR)
    j = min(len(buf), i + len(sig))
    buf[i:j] += gain * sig[: j - i]

def ping(at, a=659.25, b=783.99, amp=0.22):        # E5 -> G5, "needs you"
    place(tone(a, 0.5, amp), at)
    place(tone(b, 0.7, amp * 0.9), at + 0.12)

def resolve(at, amp=0.2):                            # click, then a settling descending pair
    place(click(0.16), at)
    place(tone(783.99, 0.35, amp * 0.8), at + 0.04)
    place(tone(523.25, 0.6, amp), at + 0.16)

def chime(at, notes=(523.25, 659.25, 783.99, 1046.5), amp=0.2, gap=0.11):  # "landed"
    for i, f in enumerate(notes):
        place(tone(f, 1.4 - i * 0.15, amp * (1 - i * 0.12), harmonics=(1.0, 0.25, 0.08)), at + i * gap)

def tick(at, amp=0.12):
    place(click(amp, 0.02), at)
    place(tone(1318.5, 0.18, amp * 0.6, harmonics=(1.0, 0.1)), at + 0.01)

def wobble(at, dur=0.9, amp=0.16):                   # overdue: low, slightly unstable
    n = int(dur * SR); t = np.arange(n) / SR
    f = 220 * (1 + 0.012 * np.sin(2 * np.pi * 5.5 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    sig = np.sin(ph) + 0.3 * np.sin(2 * ph)
    e = np.sin(np.pi * t / dur) ** 0.8
    place(amp * sig * e, at)

def ring(at, amp=0.14):                              # missed call: two muted burrs
    for k in range(2):
        n = int(0.22 * SR); t = np.arange(n) / SR
        sig = np.sin(2 * np.pi * 880 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 25 * t))
        e = np.sin(np.pi * t / 0.22)
        place(amp * sig * e, at + k * 0.34)

# --- ambient bed: warm detuned pad, very quiet, breathing slowly ---
n = len(buf); t = np.arange(n) / SR
pad = np.zeros(n)
for f, g in ((110.0, 1.0), (110.5, 0.8), (164.81, 0.45), (220.0, 0.25)):
    pad += g * np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.07 * t))
pad = np.convolve(pad, np.ones(40) / 40, mode='same')
breath = 0.8 + 0.2 * np.sin(2 * np.pi * t / 14.0)
fade = np.minimum(1, t / 3.0) * np.minimum(1, (DUR - t) / 4.0)
buf += 0.035 * pad * breath * fade

# --- events on the tour timeline (seconds) ---
place(whoosh(0.6, 0.14, True), 3.0); place(tone(523.25, 0.9, 0.12), 3.25)                 # wake
ping(8.35)                                                                                  # mention arrives
resolve(13.7)                                                                               # Open
ping(18.35, 587.33, 698.46)                                                                 # DM arrives
resolve(22.7, 0.16)                                                                          # Done
tick(25.35); place(tone(880, 0.5, 0.14), 25.42)                                              # ticket assigned
wobble(35.0)                                                                                 # overdue
tick(39.35, 0.08)                                                                            # fyi passes through
place(whoosh(0.35, 0.06, True, 3), 45.3)                                                     # architect starts working
chime(50.0)                                                                                  # answer lands
chime(58.0, (440.0, 554.37, 659.25, 880.0), 0.18)                                            # RCA lands
ping(64.35, 587.33, 739.99)                                                                  # approval waiting
resolve(69.7); place(tone(1046.5, 0.5, 0.12), 69.95)                                        # Approve, confirm
ring(73.35)                                                                                  # missed call
place(whoosh(0.5, 0.1, True, 4), 78.3)                                                       # glyph bar
place(tone(392.0, 1.2, 0.1), 85.2); place(tone(261.63, 1.6, 0.08), 85.5)                     # quiet again
for i, f in enumerate((523.25, 587.33, 659.25, 783.99, 880.0, 1046.5)):                      # cast arrives
    place(tone(f, 0.9, 0.12, harmonics=(1.0, 0.2)), 88.0 + 0.4 + i * 0.2)
chime(97.3, (261.63, 392.0, 523.25, 783.99), 0.2, 0.14)                                       # end card
place(tone(130.81, 3.0, 0.1, harmonics=(1.0, 0.4, 0.2)), 97.4)

# --- master: soft limiter and 16-bit stereo ---
peak = np.max(np.abs(buf)); buf = buf / max(peak, 1e-6) * 0.8
buf = np.tanh(buf * 1.2) / np.tanh(1.2)
pcm = (buf * 32767).astype(np.int16)
stereo = np.column_stack([pcm, pcm]).flatten()
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(stereo.tobytes())
print('wrote', sys.argv[1], 'peak', round(float(peak), 3))
