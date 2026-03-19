import { useState, useRef, useCallback, useEffect } from "react";

const API = "http://127.0.0.1:8000/api/v1";

/* ─── Global CSS ──────────────────────────────────────────────────────────── */
const GlobalStyle = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --cream:   #F2EDE4;
      --cream2:  #EDE7DC;
      --paper:   #FAF7F2;
      --ink:     #2C2416;
      --ink2:    #5C5040;
      --muted:   #9C8E7E;
      --border:  #D8CFBF;
      --terracotta: #C4694A;
      --sage:    #6B8C6A;
      --dusty:   #6B8CAE;
      --yellow:  #D4A843;
      --r:       12px;
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: 'DM Sans', sans-serif;
      background: var(--cream);
      color: var(--ink);
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    ::selection { background: rgba(107,140,110,0.25); }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: var(--cream); }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes float {
      0%,100% { transform: translateY(0px) rotate(0deg); }
      33%      { transform: translateY(-8px) rotate(2deg); }
      66%      { transform: translateY(-4px) rotate(-1deg); }
    }
    @keyframes float2 {
      0%,100% { transform: translateY(0px) rotate(0deg); }
      50%      { transform: translateY(-10px) rotate(-3deg); }
    }
    @keyframes sway {
      0%,100% { transform: rotate(-2deg); }
      50%      { transform: rotate(2deg); }
    }
    @keyframes readingBob {
      0%,100% { transform: translateY(0px); }
      50%      { transform: translateY(-6px); }
    }
    @keyframes progressFill {
      from { width: 0%; }
    }
    @keyframes shimmer {
      0%   { background-position: -600px 0; }
      100% { background-position: 600px 0; }
    }
    @keyframes cardFlip {
      0%   { transform: rotateY(0deg); }
      100% { transform: rotateY(180deg); }
    }
    @keyframes popIn {
      0%   { transform: scale(0.92); opacity: 0; }
      60%  { transform: scale(1.02); }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes twinkle {
      0%,100% { opacity: 0.4; transform: scale(1); }
      50%      { opacity: 1;   transform: scale(1.3); }
    }
    @keyframes slideRight {
      from { width: 0%; }
      to   { width: var(--target-w, 60%); }
    }

    .fade-up  { animation: fadeUp  0.55s cubic-bezier(.22,1,.36,1) both; }
    .fade-in  { animation: fadeIn  0.35s ease both; }
    .pop-in   { animation: popIn   0.45s cubic-bezier(.22,1,.36,1) both; }
  `}</style>
);

/* ─── Doodle SVGs ─────────────────────────────────────────────────────────── */
const Doodles = {
  Star: ({ size = 20, color = "#D4A843", style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  ),
  Leaf: ({ size = 18, color = "#6B8C6A", style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={style}>
      <path d="M12 22c0 0-8-4-8-12 0-4 3-7 8-7s8 3 8 7c0 8-8 12-8 12z" />
      <path d="M12 22 L12 8" strokeDasharray="2 2" />
    </svg>
  ),
  Book: ({ size = 22, color = "#6B8CAE", style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} fillOpacity="0.8" style={style}>
      <path d="M4 3h7v18H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M20 3h-7v18h7a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z" fillOpacity="0.5" />
    </svg>
  ),
  Pencil: ({ size = 16, color = "#C4694A", style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  ),
  Drop: ({ size = 16, color = "#6B8CAE", style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} fillOpacity="0.6" style={style}>
      <path d="M12 2 C12 2 5 10 5 15 a7 7 0 0 0 14 0 C19 10 12 2 12 2Z" />
    </svg>
  ),
  Moon: ({ size = 18, color = "#9C8E7E", style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} fillOpacity="0.5" style={style}>
      <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
    </svg>
  ),
};

/* ─── Floating doodle layer ───────────────────────────────────────────────── */
const FloatingDoodles = () => (
  <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
    <Doodles.Star size={16} style={{ position:"absolute", top:"18%", left:"8%", animation:"twinkle 3s ease infinite" }} />
    <Doodles.Star size={12} color="#C4694A" style={{ position:"absolute", top:"42%", left:"5%", animation:"twinkle 4s ease infinite 1s" }} />
    <Doodles.Star size={20} style={{ position:"absolute", top:"22%", right:"7%", animation:"twinkle 3.5s ease infinite 0.5s" }} />
    <Doodles.Star size={10} style={{ position:"absolute", top:"65%", right:"12%", animation:"twinkle 2.8s ease infinite 1.5s" }} />
    <Doodles.Leaf style={{ position:"absolute", top:"35%", left:"3%", animation:"float 5s ease infinite" }} />
    <Doodles.Leaf size={14} color="#8BAA6A" style={{ position:"absolute", top:"70%", right:"4%", animation:"float2 6s ease infinite 1s" }} />
    <Doodles.Book style={{ position:"absolute", top:"55%", left:"6%", animation:"float 7s ease infinite 2s" }} />
    <Doodles.Pencil style={{ position:"absolute", bottom:"20%", right:"8%", animation:"sway 4s ease infinite", transformOrigin:"bottom center" }} />
    <Doodles.Drop style={{ position:"absolute", top:"12%", right:"15%", animation:"float2 5s ease infinite 0.8s" }} />
    <Doodles.Moon style={{ position:"absolute", top:"8%", left:"20%", animation:"float 8s ease infinite 3s" }} />
  </div>
);

/* ─── Watercolor banner SVG ───────────────────────────────────────────────── */
const WatercolorBanner = () => (
  <div style={{ width:"100%", height: 320, overflow:"hidden", position:"relative", background:"linear-gradient(180deg, #D4C9B4 0%, #C8B99A 40%, #B8A888 100%)" }}>
    <svg viewBox="0 0 1200 320" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style={{ position:"absolute", inset:0 }}>
      {/* Window light */}
      <ellipse cx="600" cy="80" rx="200" ry="180" fill="rgba(255,240,200,0.35)" />
      <rect x="460" y="0" width="280" height="320" fill="rgba(255,235,180,0.15)" />
      {/* Curtains */}
      <path d="M440 0 Q420 80 430 160 Q420 240 440 320 L460 320 L460 0Z" fill="rgba(180,160,130,0.4)" />
      <path d="M760 0 Q780 80 770 160 Q780 240 760 320 L740 320 L740 0Z" fill="rgba(180,160,130,0.4)" />
      {/* Bookshelf left */}
      <rect x="20" y="60" width="160" height="260" rx="4" fill="rgba(120,90,60,0.35)" />
      <rect x="28" y="70" width="144" height="12" fill="rgba(100,75,50,0.4)" />
      {[0,1,2,3,4,5,6,7].map(i => (
        <rect key={i} x={30 + i*17} y={88} width={14} height={80 + (i%3)*20} rx="2"
          fill={["rgba(180,80,60,0.7)","rgba(80,120,160,0.7)","rgba(100,140,80,0.7)","rgba(160,130,60,0.7)","rgba(140,80,100,0.7)","rgba(80,100,140,0.7)","rgba(160,100,60,0.7)","rgba(100,120,80,0.7)"][i]} />
      ))}
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x={30 + i*24} y={200} width={20} height={100 + (i%2)*30} rx="2"
          fill={["rgba(160,60,60,0.6)","rgba(60,100,160,0.6)","rgba(80,140,80,0.6)","rgba(160,120,40,0.6)","rgba(120,60,100,0.6)","rgba(60,120,140,0.6)"][i]} />
      ))}
      {/* Bookshelf right */}
      <rect x="1020" y="0" width="180" height="320" rx="4" fill="rgba(120,90,60,0.35)" />
      {[0,1,2,3,4,5,6].map(i => (
        <rect key={i} x={1028 + i*24} y={20} width={18} height={120 + (i%3)*25} rx="2"
          fill={["rgba(180,80,60,0.65)","rgba(80,120,160,0.65)","rgba(100,140,80,0.65)","rgba(160,130,60,0.65)","rgba(140,80,100,0.65)","rgba(80,100,140,0.65)","rgba(160,100,60,0.65)"][i]} />
      ))}
      {/* Stack of books center */}
      <rect x="380" y="230" width="200" height="28" rx="3" fill="rgba(70,100,130,0.75)" />
      <rect x="370" y="205" width="210" height="28" rx="3" fill="rgba(160,80,60,0.75)" />
      <rect x="385" y="182" width="195" height="26" rx="3" fill="rgba(90,120,70,0.75)" />
      <rect x="392" y="162" width="185" height="23" rx="3" fill="rgba(170,130,50,0.75)" />
      {/* Open book on top */}
      <path d="M400 100 Q480 80 560 95 Q480 145 400 155Z" fill="rgba(245,235,210,0.9)" />
      <path d="M560 95 Q640 80 700 105 Q640 145 560 155Z" fill="rgba(240,228,205,0.85)" />
      <path d="M560 95 L560 155" stroke="rgba(150,120,80,0.4)" strokeWidth="1" />
      {[0,1,2,3,4].map(i => (
        <line key={i} x1={415+i*20} y1={115+i*6} x2={545} y2={115+i*5} stroke="rgba(130,100,60,0.2)" strokeWidth="0.8" />
      ))}
      {[0,1,2,3,4].map(i => (
        <line key={i} x1={575} y1={110+i*6} x2={688} y2={118+i*5} stroke="rgba(130,100,60,0.2)" strokeWidth="0.8" />
      ))}
      {/* Armchair right */}
      <ellipse cx="950" cy="280" rx="100" ry="20" fill="rgba(160,130,90,0.3)" />
      <rect x="870" y="200" width="160" height="90" rx="20" fill="rgba(190,165,120,0.6)" />
      <rect x="855" y="180" width="30" height="100" rx="15" fill="rgba(180,155,110,0.65)" />
      <rect x="1035" y="180" width="30" height="100" rx="15" fill="rgba(180,155,110,0.65)" />
      <rect x="870" y="175" width="160" height="40" rx="15" fill="rgba(200,175,130,0.7)" />
      {/* Potted plant */}
      <rect x="700" y="255" width="50" height="45" rx="4" fill="rgba(160,100,70,0.65)" />
      <ellipse cx="725" cy="255" rx="30" ry="8" fill="rgba(140,85,55,0.7)" />
      <path d="M725 250 Q700 210 680 190 Q710 195 720 215 Q715 195 730 175 Q740 200 730 220 Q745 200 760 185 Q755 210 740 230 Q750 210 775 195 Q765 220 745 240Z" fill="rgba(80,130,70,0.75)" />
      {/* Vines */}
      <path d="M200 80 Q220 120 200 160 Q185 200 210 240" fill="none" stroke="rgba(80,130,70,0.5)" strokeWidth="2" />
      {[80,120,160,200].map((y,i) => (
        <ellipse key={i} cx={195+(i%2)*18} cy={y+10} rx={12} ry={8} fill="rgba(80,140,70,0.5)" style={{ transform:`rotate(${i*30}deg)`, transformOrigin:`${195+(i%2)*18}px ${y+10}px` }} />
      ))}
      {/* Floating dust particles */}
      {[...Array(12)].map((_,i) => (
        <circle key={i} cx={300+i*70} cy={50+i*20} r={2} fill="rgba(255,255,255,0.6)" />
      ))}
    </svg>
    {/* Warm overlay fade at bottom */}
    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:80, background:"linear-gradient(transparent, var(--cream))" }} />
  </div>
);

/* ─── Reading character SVG ───────────────────────────────────────────────── */
const ReadingCharacter = () => (
  <div style={{ animation:"readingBob 2.5s ease infinite", display:"inline-block" }}>
    <svg width="120" height="120" viewBox="0 0 120 120">
      {/* Cushion */}
      <ellipse cx="60" cy="100" rx="42" ry="14" fill="#8BAA6A" fillOpacity="0.7" />
      {/* Body */}
      <ellipse cx="60" cy="72" rx="22" ry="26" fill="#7A9BB8" />
      {/* Head */}
      <circle cx="60" cy="44" r="20" fill="#7A9BB8" />
      {/* Eyes */}
      <circle cx="53" cy="42" r="3.5" fill="#2C2416" />
      <circle cx="67" cy="42" r="3.5" fill="#2C2416" />
      <circle cx="54" cy="41" r="1.2" fill="white" />
      <circle cx="68" cy="41" r="1.2" fill="white" />
      {/* Blush */}
      <ellipse cx="49" cy="48" rx="5" ry="3" fill="#E8A4A0" fillOpacity="0.5" />
      <ellipse cx="71" cy="48" rx="5" ry="3" fill="#E8A4A0" fillOpacity="0.5" />
      {/* Arms holding book */}
      <path d="M38 75 Q30 78 28 85" stroke="#7A9BB8" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M82 75 Q90 78 92 85" stroke="#7A9BB8" strokeWidth="8" strokeLinecap="round" fill="none" />
      {/* Book */}
      <rect x="30" y="82" width="60" height="22" rx="3" fill="#C4694A" />
      <rect x="30" y="82" width="30" height="22" rx="3" fill="#D4894A" />
      <line x1="60" y1="82" x2="60" y2="104" stroke="#A0502A" strokeWidth="1.5" />
      {/* Book lines */}
      <line x1="34" y1="89" x2="56" y2="89" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      <line x1="34" y1="94" x2="56" y2="94" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      <line x1="34" y1="99" x2="52" y2="99" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      {/* Steam from tea */}
      <ellipse cx="96" cy="88" rx="6" ry="5" fill="#D4A843" fillOpacity="0.8" />
      <path d="M93 84 Q94 80 93 76" stroke="#D4A843" strokeWidth="1.5" fill="none" strokeOpacity="0.6" />
      <path d="M96 83 Q97 79 96 75" stroke="#D4A843" strokeWidth="1.5" fill="none" strokeOpacity="0.6" />
      <path d="M99 84 Q100 80 99 76" stroke="#D4A843" strokeWidth="1.5" fill="none" strokeOpacity="0.6" />
      {/* Ear */}
      <ellipse cx="40" cy="44" rx="5" ry="7" fill="#7A9BB8" />
      <ellipse cx="80" cy="44" rx="5" ry="7" fill="#7A9BB8" />
      {/* Little tail */}
      <path d="M60 96 Q65 105 62 110" stroke="#7A9BB8" strokeWidth="5" strokeLinecap="round" fill="none" />
    </svg>
  </div>
);

/* ─── Navbar ──────────────────────────────────────────────────────────────── */
function Navbar({ page, setPage }) {
  return (
    <nav style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"20px 48px", background:"transparent",
      position:"sticky", top:0, zIndex:100,
      backdropFilter:"blur(8px)", backgroundColor:"rgba(242,237,228,0.85)",
      borderBottom:"1px solid rgba(216,207,191,0.4)",
    }}>
      <div style={{ fontFamily:"'Crimson Pro', serif", fontSize:26, fontStyle:"italic", fontWeight:600, letterSpacing:"-0.02em", color:"var(--ink)", cursor:"pointer" }}
        onClick={() => setPage("upload")}>
        EasyLearn
      </div>
      <div style={{ display:"flex", gap:36 }}>
        {["upload","history","about"].map(p => (
          <button key={p} onClick={() => setPage(p)} style={{
            background:"none", border:"none", cursor:"pointer",
            fontFamily:"'DM Sans', sans-serif", fontSize:14, fontWeight:400,
            color: page===p ? "var(--ink)" : "var(--muted)",
            position:"relative", padding:"4px 0",
            textTransform:"capitalize", letterSpacing:"0.01em",
            transition:"color .2s",
          }}>
            {p}
            {page===p && (
              <span style={{
                position:"absolute", bottom:-2, left:0, right:0, height:1,
                background:"var(--ink)", borderRadius:99,
              }} />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

/* ─── Upload page ─────────────────────────────────────────────────────────── */
function UploadPage({ onResult }) {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [procStep, setProcStep] = useState(0);
  const inputRef = useRef();
  const ALLOWED = ["application/pdf","image/png","image/jpeg","image/webp"];

  const addFiles = useCallback((incoming) => {
    const valid = Array.from(incoming).filter(f => ALLOWED.includes(f.type));
    if (valid.length < incoming.length) setError("Only PDF, JPG, PNG, WEBP files are supported.");
    else setError(null);
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      return [...prev, ...valid.filter(f => !names.has(f.name))];
    });
  }, []);

  const steps = ["Reading your notes...","Extracting text...","Thinking carefully...","Building your summary...","Almost ready..."];

  const submit = async () => {
    if (!files.length) return;
    setLoading(true);
    let si = 0;
    setProcStep(0);
    const iv = setInterval(() => { si = Math.min(si+1, steps.length-1); setProcStep(si); }, 5000);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append("files", f));
      const res = await fetch(`${API}/upload`, { method:"POST", body:fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Upload failed"); }
      const data = await res.json();
      clearInterval(iv);
      setLoading(false);
      onResult(data, files.map(f => f.name));
      setFiles([]);
    } catch(e) {
      clearInterval(iv);
      setLoading(false);
      setError(e.message);
    }
  };

  if (loading) return <ProcessingPage step={steps[procStep]} fileNames={files.map(f=>f.name)} />;

  return (
    <div style={{ position:"relative", zIndex:1 }}>
      <WatercolorBanner />
      <div style={{ maxWidth:720, margin:"0 auto", padding:"48px 24px 80px" }}>
        {/* Drop zone */}
        <div
          className="fade-up"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
          style={{
            border:`1.5px dashed ${dragging ? "var(--sage)" : "var(--border)"}`,
            borderRadius:16, padding:"52px 32px",
            textAlign:"center", cursor:"pointer",
            background: dragging ? "rgba(107,140,106,0.04)" : "rgba(250,247,242,0.6)",
            transition:"all .25s",
            position:"relative",
          }}
        >
          <input ref={inputRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp"
            style={{ display:"none" }} onChange={e => addFiles(e.target.files)} />
          {files.length === 0 ? (
            <p style={{ fontFamily:"'Crimson Pro', serif", fontSize:18, color:"var(--muted)", fontStyle:"italic", letterSpacing:"0.01em" }}>
              drop your notes here or click to browse.
            </p>
          ) : (
            <div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", marginBottom:16 }}>
                {files.map(f => (
                  <span key={f.name} style={{
                    display:"inline-flex", alignItems:"center", gap:6,
                    padding:"4px 12px", borderRadius:99,
                    border:"1px solid var(--border)", background:"var(--paper)",
                    fontSize:13, color:"var(--ink2)",
                    fontFamily:"'DM Sans', sans-serif",
                  }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background: f.type==="application/pdf" ? "var(--terracotta)" : "var(--dusty)", display:"inline-block", flexShrink:0 }} />
                    {f.name}
                    <button onClick={e => { e.stopPropagation(); setFiles(prev => prev.filter(x=>x.name!==f.name)); }}
                      style={{ background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:14,padding:0,lineHeight:1,marginLeft:2 }}>×</button>
                  </span>
                ))}
              </div>
              <p style={{ fontFamily:"'DM Sans', sans-serif", fontSize:13, color:"var(--muted)" }}>
                click to add more files
              </p>
            </div>
          )}
        </div>

        {error && (
          <p style={{ marginTop:10, fontSize:13, color:"var(--terracotta)", textAlign:"center", fontFamily:"'DM Sans', sans-serif" }}>{error}</p>
        )}

        {/* Submit button */}
        <div className="fade-up" style={{ animationDelay:".1s", display:"flex", justifyContent:"center", marginTop:28 }}>
          <button onClick={submit} disabled={!files.length}
            style={{
              fontFamily:"'Crimson Pro', serif", fontSize:18, fontStyle:"italic",
              padding:"10px 32px", borderRadius:99,
              border:"1.5px solid var(--ink)", background:"transparent",
              color:"var(--ink)", cursor: files.length ? "pointer" : "not-allowed",
              opacity: files.length ? 1 : 0.35,
              transition:"all .2s", letterSpacing:"0.01em",
            }}
            onMouseEnter={e => { if(files.length) { e.target.style.background="var(--ink)"; e.target.style.color="var(--cream)"; }}}
            onMouseLeave={e => { e.target.style.background="transparent"; e.target.style.color="var(--ink)"; }}
          >
            Summarise →
          </button>
        </div>

        {/* Supported formats hint */}
        <p className="fade-up" style={{ animationDelay:".2s", textAlign:"center", marginTop:20, fontSize:12, color:"var(--muted)", fontFamily:"'DM Sans', sans-serif", letterSpacing:"0.03em" }}>
          PDF · JPG · PNG · WEBP · handwritten notes welcome
        </p>
      </div>
    </div>
  );
}

/* ─── Processing page ─────────────────────────────────────────────────────── */
function ProcessingPage({ step, fileNames }) {
  return (
    <div style={{
      minHeight:"80vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", gap:24,
      padding:"40px 24px", position:"relative",
    }}>
      {/* Background doodles subtle */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
        {[...Array(6)].map((_,i) => (
          <Doodles.Star key={i} size={10+i*3}
            color={i%2===0?"#D4A843":"#C4694A"}
            style={{ position:"absolute", left:`${10+i*15}%`, top:`${15+i*10}%`, opacity:0.4, animation:`twinkle ${2+i*0.5}s ease infinite ${i*0.4}s` }} />
        ))}
      </div>

      <ReadingCharacter />

      <p style={{
        fontFamily:"'Crimson Pro', serif", fontSize:30, fontStyle:"italic",
        color:"var(--ink2)", letterSpacing:"-0.01em", textAlign:"center",
        animation:"fadeIn 0.5s ease both",
        key: step,
      }}>
        {step}
      </p>

      {/* Progress bar — wobbly hand-drawn style */}
      <div style={{ width:280, position:"relative" }}>
        <svg width="280" height="16" viewBox="0 0 280 16" style={{ position:"absolute", top:0, left:0 }}>
          <path d="M4 8 Q70 4 140 8 Q210 12 276 8" fill="none" stroke="var(--border)" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <div style={{
          height:3, background:"var(--sage)", borderRadius:99,
          marginTop:4,
          animation:"progressFill 20s linear both",
          maxWidth:"90%",
        }} />
      </div>

      {fileNames?.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center", marginTop:8 }}>
          {fileNames.map(n => (
            <span key={n} style={{
              padding:"3px 12px", borderRadius:99,
              border:"1px solid var(--border)",
              fontSize:12, color:"var(--muted)",
              fontFamily:"'DM Sans', sans-serif",
            }}>{n}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Summary page ────────────────────────────────────────────────────────── */
function SummaryPage({ data, fileNames, onBack }) {
  const [fcIndex, setFcIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [fcKnow, setFcKnow] = useState(0);
  const [fcDone, setFcDone] = useState(false);

  const raw = data?.summary || "";

  function parseSection(heading) {
    const regex = new RegExp(heading + "[^\\n]*\\n([\\s\\S]*?)(?=\\n[📚✅🔑🧠📝🎯]|$)", "i");
    const m = raw.match(regex);
    return m ? m[1].trim() : "";
  }

  const topic = (() => {
    const sec = parseSection("📚");
    return sec.split("\n")[0]?.replace(/\*\*/g,"").trim() || "Your Summary";
  })();

  const explanation = parseSection("🧠");
  const examSummary = parseSection("📝");
  const tips = parseSection("🎯");

  const points = (() => {
    const sec = parseSection("✅");
    return sec.split("\n").filter(l=>l.trim()).map(l=>l.replace(/^[-*•\d.]+\s*/,"").replace(/\*\*/g,"").trim()).filter(Boolean);
  })();

  const concepts = (() => {
    const sec = parseSection("🔑");
    return sec.split("\n").filter(l=>l.trim()).map(l => {
      const clean = l.replace(/^[-*•\d.]+\s*/,"").replace(/\*\*/g,"");
      const parts = clean.split(/[:\-–]/);
      return { term: parts[0]?.trim()||"", def: parts.slice(1).join(":").trim()||"" };
    }).filter(c=>c.term);
  })();

  const flashcards = [
    ...concepts.filter(c=>c.def).map(c => ({ q:`What is "${c.term}"?`, a:c.def })),
    ...points.slice(0,5).map((p,i) => ({ q:`Explain key point ${i+1}`, a:p })),
  ];

  const fcNext = (knew) => {
    if (knew) setFcKnow(k=>k+1);
    if (fcIndex + 1 >= flashcards.length) { setFcDone(true); return; }
    setFcIndex(i=>i+1);
    setFlipped(false);
  };

  const SectionLabel = ({ text }) => (
    <p style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted)", fontFamily:"'DM Sans',sans-serif", marginBottom:12 }}>
      {text}
    </p>
  );

  return (
    <div className="fade-in" style={{ maxWidth:1060, margin:"0 auto", padding:"48px 32px 100px", display:"grid", gridTemplateColumns:"1fr 320px", gap:64 }}>
      {/* ── Left column ── */}
      <div>
        {/* Back + files */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:32 }}>
          <button onClick={onBack} style={{ background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--muted)",padding:0,display:"flex",alignItems:"center",gap:4 }}>
            ← new upload
          </button>
          <span style={{ color:"var(--border)" }}>·</span>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {(fileNames||[]).map(n=>(
              <span key={n} style={{ fontSize:12,color:"var(--muted)",fontFamily:"'DM Sans',sans-serif",padding:"2px 8px",borderRadius:99,border:"1px solid var(--border)" }}>{n}</span>
            ))}
          </div>
        </div>

        {/* Topic title */}
        <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:40 }}>
          <h1 style={{ fontFamily:"'Crimson Pro',serif", fontSize:"clamp(32px,4vw,52px)", fontWeight:600, letterSpacing:"-0.03em", lineHeight:1.1, color:"var(--ink)" }}>
            {topic}
          </h1>
          <Doodles.Star size={20} style={{ marginTop:8, flexShrink:0 }} />
        </div>

        {/* Simple explanation */}
        <div style={{ marginBottom:40 }}>
          <SectionLabel text="Simple Explanation" />
          {explanation ? (
            <div style={{ fontFamily:"'Crimson Pro',serif",fontSize:18,lineHeight:1.85,color:"var(--ink2)",fontWeight:300 }}>
              {explanation.split("\n\n").map((p,i)=><p key={i} style={{marginBottom:16}}>{p}</p>)}
            </div>
          ) : (
            <div style={{ height:20, background:"linear-gradient(90deg,var(--cream2) 25%,var(--border) 50%,var(--cream2) 75%)", backgroundSize:"600px 100%", animation:"shimmer 1.5s infinite", borderRadius:8 }} />
          )}
        </div>

        {/* Divider with doodle */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:40 }}>
          <div style={{ flex:1, height:1, background:"var(--border)" }} />
          <Doodles.Drop size={14} />
          <div style={{ flex:1, height:1, background:"var(--border)" }} />
        </div>

        {/* Exam summary */}
        <div style={{ marginBottom:48 }}>
          <SectionLabel text="Exam Summary" />
          {examSummary ? (
            <div style={{ fontFamily:"'Crimson Pro',serif",fontSize:18,lineHeight:1.85,color:"var(--ink2)",fontWeight:300 }}>
              {examSummary.split("\n\n").map((p,i)=><p key={i} style={{marginBottom:16}}>{p}</p>)}
            </div>
          ) : (
            <div style={{ height:20, background:"linear-gradient(90deg,var(--cream2) 25%,var(--border) 50%,var(--cream2) 75%)", backgroundSize:"600px 100%", animation:"shimmer 1.5s infinite", borderRadius:8 }} />
          )}
        </div>

        {/* Exam tips */}
        {tips && (
          <div style={{ marginBottom:48 }}>
            <SectionLabel text="Quick Tips" />
            <div style={{ fontFamily:"'Crimson Pro',serif",fontSize:17,lineHeight:1.8,color:"var(--ink2)",fontWeight:300 }}>
              {tips.split("\n").filter(l=>l.trim()).map((t,i)=>(
                <div key={i} style={{ display:"flex",gap:10,marginBottom:10,alignItems:"flex-start" }}>
                  <Doodles.Star size={12} color="var(--yellow)" style={{ marginTop:5,flexShrink:0 }} />
                  <span>{t.replace(/^[-*•\d.]+\s*/,"")}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:40 }}>
          <div style={{ flex:1, height:1, background:"var(--border)" }} />
          <Doodles.Leaf size={14} />
          <div style={{ flex:1, height:1, background:"var(--border)" }} />
        </div>

        {/* Key points */}
        <div style={{ marginBottom:48 }}>
          <SectionLabel text="Key Points" />
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {points.map((p,i)=>(
              <div key={i} className="fade-up" style={{ animationDelay:`${i*0.07}s`, display:"flex",gap:14,padding:"12px 0",borderBottom:"1px solid var(--border)",alignItems:"flex-start" }}>
                <span style={{ fontFamily:"'Crimson Pro',serif",fontSize:13,color:"var(--muted)",minWidth:20,marginTop:3 }}>{String(i+1).padStart(2,"0")}</span>
                <span style={{ fontFamily:"'Crimson Pro',serif",fontSize:17,lineHeight:1.65,color:"var(--ink2)",fontWeight:300 }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:40 }}>
          <div style={{ flex:1, height:1, background:"var(--border)" }} />
          <Doodles.Book size={16} />
          <div style={{ flex:1, height:1, background:"var(--border)" }} />
        </div>

        {/* Review cards */}
        <div>
          <SectionLabel text="Review Cards" />
          {flashcards.length === 0 ? (
            <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:16,color:"var(--muted)",fontStyle:"italic" }}>No flashcards generated.</p>
          ) : fcDone ? (
            <div className="pop-in" style={{ textAlign:"center", padding:"40px 0" }}>
              <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:28,fontStyle:"italic",color:"var(--ink)",marginBottom:8 }}>All done!</p>
              <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"var(--muted)",marginBottom:20 }}>{fcKnow} of {flashcards.length} marked as known</p>
              <button onClick={()=>{setFcIndex(0);setFlipped(false);setFcKnow(0);setFcDone(false);}}
                style={{ fontFamily:"'Crimson Pro',serif",fontSize:16,fontStyle:"italic",padding:"8px 24px",borderRadius:99,border:"1px solid var(--border)",background:"transparent",color:"var(--ink)",cursor:"pointer" }}>
                Restart cards
              </button>
            </div>
          ) : (
            <div>
              {/* Card */}
              <div onClick={() => setFlipped(f=>!f)} style={{
                border:"1px solid var(--border)", borderRadius:16,
                padding:"40px 32px", marginBottom:20,
                background:"var(--paper)", cursor:"pointer",
                borderLeft:"4px solid var(--terracotta)",
                minHeight:160, display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center",
                transition:"all .25s", position:"relative",
              }}
                onMouseEnter={e=>e.currentTarget.style.borderColor="var(--ink)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}
              >
                <p style={{ fontSize:10,fontWeight:500,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--muted)",fontFamily:"'DM Sans',sans-serif",marginBottom:20 }}>
                  {flipped ? "answer" : "question"} · {fcIndex+1}/{flashcards.length}
                </p>
                <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:22,fontStyle:"italic",textAlign:"center",lineHeight:1.5,color:flipped?"var(--ink2)":"var(--ink)", fontWeight: flipped?300:400 }}>
                  {flipped ? flashcards[fcIndex].a : flashcards[fcIndex].q}
                </p>
                {!flipped && (
                  <p style={{ position:"absolute",bottom:14,right:20,fontSize:11,color:"var(--muted)",fontFamily:"'DM Sans',sans-serif" }}>
                    tap to reveal
                  </p>
                )}
              </div>
              {/* Controls */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:24 }}>
                <button onClick={()=>fcNext(false)} style={{ background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--muted)",display:"flex",alignItems:"center",gap:4 }}>
                  ← prev
                </button>
                <span style={{ color:"var(--border)" }}>·</span>
                <button onClick={()=>fcNext(true)} style={{ background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--sage)",display:"flex",alignItems:"center",gap:4 }}>
                  next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right column ── */}
      <div style={{ position:"sticky", top:80, alignSelf:"start" }}>
        <SectionLabel text="Key Concepts" />
        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          {concepts.length === 0 ? (
            <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:15,color:"var(--muted)",fontStyle:"italic" }}>No concepts found.</p>
          ) : concepts.map((c,i)=>(
            <div key={i} className="fade-up" style={{ animationDelay:`${i*0.07}s`, paddingBottom:18,marginBottom:18,borderBottom:"1px solid var(--border)" }}>
              <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:17,fontWeight:600,color:"var(--ink)",marginBottom:5 }}>{c.term}</p>
              <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,lineHeight:1.65,color:"var(--ink2)",fontWeight:300 }}>{c.def}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── History page ────────────────────────────────────────────────────────── */
function HistoryPage({ onOpen }) {
  const history = JSON.parse(localStorage.getItem("el_history") || "[]");

  return (
    <div style={{ maxWidth:720, margin:"0 auto", padding:"56px 32px 100px", position:"relative", zIndex:1 }}>
      <div style={{ display:"flex", alignItems:"baseline", gap:12, marginBottom:48 }}>
        <h1 style={{ fontFamily:"'Crimson Pro',serif",fontSize:40,fontWeight:600,letterSpacing:"-0.03em",fontStyle:"italic" }}>
          Past uploads
        </h1>
        <Doodles.Star size={14} />
      </div>

      {history.length === 0 ? (
        <div style={{ textAlign:"center", padding:"80px 0" }}>
          <Doodles.Book size={40} color="#D8CFBF" style={{ marginBottom:16 }} />
          <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:22,fontStyle:"italic",color:"var(--muted)" }}>No uploads yet</p>
          <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--border)",marginTop:8 }}>Your processed documents will appear here</p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          {history.map((h, i) => (
            <div key={h.id || i} className="fade-up" style={{ animationDelay:`${i*0.06}s`,
              display:"flex", alignItems:"baseline", justifyContent:"space-between",
              padding:"18px 0", borderBottom:"1px solid var(--border)",
              cursor:"pointer", transition:"all .2s", gap:16,
            }}
              onMouseEnter={e => e.currentTarget.style.paddingLeft="8px"}
              onMouseLeave={e => e.currentTarget.style.paddingLeft="0px"}
              onClick={() => onOpen(h)}
            >
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:5 }}>
                  {(h.fileNames||[]).map(n=>(
                    <span key={n} style={{ fontFamily:"'Crimson Pro',serif",fontSize:17,fontWeight:600,color:"var(--ink)" }}>{n}</span>
                  ))}
                </div>
                <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                  {(h.summary||"").replace(/[📚✅🔑🧠📝🎯\*]/g,"").substring(0,80)}...
                </p>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:16, flexShrink:0 }}>
                <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"var(--muted)" }}>{h.date}</span>
                <span style={{ fontFamily:"'Crimson Pro',serif",fontSize:16,color:"var(--muted)" }}>→</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── About page ──────────────────────────────────────────────────────────── */
function AboutPage() {
  return (
    <div style={{ maxWidth:620, margin:"80px auto", padding:"0 32px 100px", position:"relative", zIndex:1 }}>
      <h1 style={{ fontFamily:"'Crimson Pro',serif",fontSize:42,fontWeight:600,fontStyle:"italic",letterSpacing:"-0.03em",marginBottom:32 }}>
        About EasyLearn
      </h1>
      {[
        ["What it does","Upload any PDF, photo, or handwritten notes. EasyLearn extracts the text, sends it to a local Mistral AI model, and returns a structured summary with key concepts, a plain-language explanation, exam tips and review flashcards."],
        ["How it works","Your files never leave your machine. Text extraction happens locally — pdfplumber for PDFs, Tesseract OCR for images. Mistral runs via Ollama on your own hardware. Summaries are stored in a local MongoDB database."],
        ["Built for students","Whether you are in school, college or university — EasyLearn turns dense study material into clear, readable notes so you can spend less time decoding and more time understanding."],
      ].map(([title, body]) => (
        <div key={title} style={{ marginBottom:36 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
            <Doodles.Star size={12} />
            <p style={{ fontSize:11,fontWeight:500,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--muted)",fontFamily:"'DM Sans',sans-serif" }}>{title}</p>
          </div>
          <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:18,lineHeight:1.85,color:"var(--ink2)",fontWeight:300 }}>{body}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Root App ────────────────────────────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("upload");
  const [summaryData, setSummaryData] = useState(null);
  const [summaryFiles, setSummaryFiles] = useState([]);

  const handleResult = (data, fileNames) => {
    const entry = {
      id: Date.now(),
      fileNames,
      summary: data.summary,
      date: new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}),
    };
    const history = JSON.parse(localStorage.getItem("el_history")||"[]");
    history.unshift(entry);
    localStorage.setItem("el_history", JSON.stringify(history.slice(0,50)));
    setSummaryData(data);
    setSummaryFiles(fileNames);
    setPage("summary");
  };

  const handleOpenHistory = (h) => {
    setSummaryData({ summary: h.summary });
    setSummaryFiles(h.fileNames || []);
    setPage("summary");
  };

  return (
    <>
      <GlobalStyle />
      <FloatingDoodles />
      <div style={{ position:"relative", zIndex:1, minHeight:"100vh" }}>
        <Navbar page={page} setPage={setPage} />
        {page === "upload"   && <UploadPage onResult={handleResult} />}
        {page === "summary"  && <SummaryPage data={summaryData} fileNames={summaryFiles} onBack={() => setPage("upload")} />}
        {page === "history"  && <HistoryPage onOpen={handleOpenHistory} />}
        {page === "about"    && <AboutPage />}
      </div>
    </>
  );
}
