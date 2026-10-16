"""Extra synthesized SFX for this video: glass crack/shatter and tape pull."""
import numpy as np, wave
SR=48000; rng=np.random.default_rng(3)
def save(name,x):
    x=x/ (np.abs(x).max()+1e-9)*0.7
    with wave.open(f"public/sfx/{name}.wav","wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x*32767).astype(np.int16).tobytes())
def hp(x,a=0.97):
    y=np.zeros_like(x); p=0
    for i,v in enumerate(x): y[i]=v-p; p=v*a+p*(1-a) if False else v
    return y
# glass: sharp crack + many tiny high resonant tinkles decaying
n=int(SR*1.3); t=np.arange(n)/SR; x=np.zeros(n)
crack=rng.standard_normal(int(SR*0.04))*np.exp(-np.arange(int(SR*0.04))/SR*90); x[:len(crack)]+=crack*1.2
for k in range(70):
    st=int(rng.uniform(0,0.9)**1.8*SR); f=rng.uniform(2500,9000); d=rng.uniform(0.03,0.18); m=int(d*SR)
    if st+m>=n: continue
    tt=np.arange(m)/SR; x[st:st+m]+=np.sin(2*np.pi*f*tt)*np.exp(-tt/d*5)*rng.uniform(0.1,0.5)*(1-st/n)
x=np.diff(np.concatenate([[0],x]))*3+x*0.3
save("glass",x)
# tape: rough noise with rising amplitude modulation
n=int(SR*0.7); t=np.arange(n)/SR
nz=rng.standard_normal(n); am=(0.6+0.4*np.sin(2*np.pi*38*t))*np.minimum(1,t/0.05)*np.exp(-np.maximum(0,t-0.5)*20)
save("tape",np.diff(np.concatenate([[0],nz]))*am*0.6)
