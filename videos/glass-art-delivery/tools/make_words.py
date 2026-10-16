"""Builds src/data/words.json from phrase spans measured on the voiceover
(Whisper large-v3 transcript + ffmpeg silencedetect). Inside a span, word times
are spread by character length — good enough for phrase-level cuts and captions."""
import json
LINES = [
 [(0.22,1.56,"لوحات زجاجية")],
 [(1.80,3.72,"وتوصلك وين ما تكوني في"),(3.74,4.44,"69 ولاية؟")],
 [(4.99,6.30,"وإذا تكسرت في الطريق؟")],
 [(6.96,8.20,"هذا هو الخوف اللي"),(8.25,9.08,"عند كل وحدة")],
 [(9.10,11.83,"وهذا اللي نديروه قبل ما تخرج اللوحة")],
 [(12.18,13.04,"أول حاجة"),(13.37,14.75,"نفحصوا الزاج والزوايا"),(14.96,15.92,"وحدة وحدة")],
 [(16.27,16.88,"بعدها"),(17.38,18.69,"نحطوا حمايات على الأركان")],
 [(18.93,20.42,"وتغليف كامل بالبلاستيك"),(20.42,21.37,"تاع الفقاعات")],
 [(21.65,23.13,"اللي كامل تحبوا ترطقوها")],
 [(23.37,27.28,"ونزيدوا كذلك كارتون مقوّى يغلّف كلش")],
 [(27.57,28.36,"وقبل ما نسكروه"),(28.67,29.42,"نهزّوه")],
 [(29.78,32.27,"باش نتأكدوا أن اللوحة ما تتحركش")],
 [(32.68,33.12,"هكا"),(33.37,35.66,"توصلك سليمة حتى لباب دارك")],
]
out=[]
for spans in LINES:
    words=[]
    for s,e,txt in spans:
        ws=txt.split(); tot=sum(len(w)+1 for w in ws); t=s
        for w in ws:
            d=(e-s)*(len(w)+1)/tot; words.append({"w":w,"start":round(t,3),"end":round(t+d,3)}); t+=d
    out.append({"text":" ".join(x["w"] for x in words),"start":words[0]["start"],"end":words[-1]["end"],"words":words})
json.dump({"source":"whisper-large-v3 + silencedetect","audio":"voice.mp3","duration":36.02,"lines":out},
          open("src/data/words.json","w"),ensure_ascii=False,indent=1)
