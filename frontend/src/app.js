import { useState, useRef, useCallback } from "react";

const API = "http://127.0.0.1:8000/api/v1";

/* ─── Mascot ──────────────────────────────────────────────────────────────── */
const MASCOT = {
  idle:       "/mascot/idle.gif",
  welcome:    "/mascot/welcome.gif",
  sleeping:   "/mascot/sleeping.png",
  confused:   "/mascot/confused.gif",
  processing: "/mascot/processing.gif",
};

function Mascot({ pose = "idle", size = 120, style = {} }) {
  return (
    <img src={MASCOT[pose]} alt={pose}
      style={{ width:size, height:size, objectFit:"contain", ...style }} />
  );
}

/* ─── Global CSS ──────────────────────────────────────────────────────────── */
const GlobalStyle = () => (
  <style>{`
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    :root {
      --cream:  #F2EDE4;
      --cream2: #EDE7DC;
      --paper:  #FAF7F2;
      --ink:    #2C2416;
      --ink2:   #5C5040;
      --muted:  #9C8E7E;
      --border: #D8CFBF;
      --terra:  #C4694A;
      --sage:   #6B8C6A;
      --dusty:  #6B8CAE;
      --yellow: #D4A843;
    }
    html { scroll-behavior:smooth; }
    body {
      font-family:'DM Sans',sans-serif;
      background:var(--cream);
      color:var(--ink);
      min-height:100vh;
      -webkit-font-smoothing:antialiased;
    }
    ::selection { background:rgba(107,140,106,0.25); }
    ::-webkit-scrollbar { width:5px; }
    ::-webkit-scrollbar-track { background:var(--cream); }
    ::-webkit-scrollbar-thumb { background:var(--border); border-radius:99px; }

    @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500&display=swap');

    @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes readingBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
    @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
    @keyframes popIn { 0%{transform:scale(0.9);opacity:0} 60%{transform:scale(1.03)} 100%{transform:scale(1);opacity:1} }

    @keyframes wavyDraw { from{stroke-dashoffset:1000} to{stroke-dashoffset:0} }
    @keyframes spin { to{transform:rotate(360deg)} }
    @keyframes fcFlipIn  { from{opacity:0;transform:rotateY(-10deg)} to{opacity:1;transform:rotateY(0deg)} } 50%{transform:translateX(6px)} } 40%{transform:scaleY(0.2)} 50%{transform:scaleY(1)} } 100%{transform:rotate(360deg)} } 50%{transform:translateX(12px)} 100%{transform:translateX(0)} }
    @keyframes textPulse  { 0%,100%{opacity:1} 50%{opacity:0.5} } 100%{opacity:0;transform:scaleX(0.3)} }


    .fade-up  { animation:fadeUp  0.55s cubic-bezier(.22,1,.36,1) both; }
    .fade-in  { animation:fadeIn  0.35s ease both; }
    .pop-in   { animation:popIn   0.45s cubic-bezier(.22,1,.36,1) both; }

    /* ── Wavy divider ── */
    .wavy-divider { width:100%; overflow:visible; margin:32px 0; }
    .wavy-path { fill:none; stroke:var(--border); stroke-width:1.5; stroke-linecap:round;
      stroke-dasharray:1000; stroke-dashoffset:0; }

    /* ── Input fields ── */
    .field { width:100%; padding:12px 16px; border:1px solid var(--border);
      border-radius:10px; background:var(--paper);
      font-family:'DM Sans',sans-serif; font-size:15px; color:var(--ink);
      outline:none; transition:border-color .2s; }
    .field:focus { border-color:var(--sage); }
    .field::placeholder { color:var(--muted); }

    /* ── Auth card ── */
    .auth-card { background:var(--paper); border:1px solid var(--border);
      border-radius:20px; padding:40px 36px; width:100%; max-width:420px; }

    /* ── Flash card ── */
    .fc-scene {
      perspective: 1000px;
      width: 100%;
      height: 300px;
      cursor: pointer;
      margin-bottom: 20px;
    }
    .fc-inner {
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 0.65s cubic-bezier(0.4,0.2,0.2,1);
      transform-style: preserve-3d;
      -webkit-transform-style: preserve-3d;
    }
    .fc-inner.is-flipped {
      transform: rotateY(180deg);
      -webkit-transform: rotateY(180deg);
    }
    .fc-front,
    .fc-back {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 36px;
      text-align: center;
      will-change: transform;
    }
    .fc-front {
      background: var(--paper);
      border: 1.5px solid var(--border);
      transform: rotateY(0deg);
      -webkit-transform: rotateY(0deg);
    }
    .fc-back {
      background: var(--cream2);
      border: 1.5px solid var(--border);
      transform: rotateY(180deg);
      -webkit-transform: rotateY(180deg);
    }
  `}</style>
);

/* ─── Wavy SVG divider ────────────────────────────────────────────────────── */
const WavyLine = ({ color = "var(--border)" }) => (
  <svg className="wavy-divider" height="20" viewBox="0 0 700 20" preserveAspectRatio="none">
    <path className="wavy-path" stroke={color}
      d="M0 10 C50 4, 100 16, 150 10 C200 4, 250 16, 300 10 C350 4, 400 16, 450 10 C500 4, 550 16, 600 10 C640 5, 670 14, 700 10" />
  </svg>
);

/* ─── Doodles ─────────────────────────────────────────────────────────────── */
const Doodles = () => (
  <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
    {[
      { top:"18%", left:"6%",  size:14, color:"#D4A843", delay:"0s"   },
      { top:"42%", left:"4%",  size:10, color:"#C4694A", delay:"1s"   },
      { top:"22%", right:"6%", size:18, color:"#D4A843", delay:"0.5s" },
      { top:"65%", right:"10%",size:10, color:"#D4A843", delay:"1.5s" },
    ].map((s, i) => (
      <svg key={i} width={s.size} height={s.size} viewBox="0 0 24 24"
        style={{ position:"absolute", ...s, animation:`float ${3+i*0.5}s ease infinite ${s.delay}`, opacity:0.5 }}>
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill={s.color} />
      </svg>
    ))}
  </div>
);

/* ─── Navbar ──────────────────────────────────────────────────────────────── */
function Navbar({ page, setPage, user, onLogout }) {
  return (
    <nav style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"16px 48px", position:"sticky", top:0, zIndex:100,
      backdropFilter:"blur(12px)", backgroundColor:"rgba(242,237,228,0.9)",
      borderBottom:"1px solid rgba(216,207,191,0.5)",
    }}>
      <div onClick={() => setPage(user ? "upload" : "login")}
        style={{ fontFamily:"'Crimson Pro',serif", fontSize:24, fontStyle:"italic",
          fontWeight:600, letterSpacing:"-0.02em", cursor:"pointer" }}>
        EasyLearn
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:28 }}>
        {user && ["upload","history","about"].map(p => (
          <button key={p} onClick={() => setPage(p)} style={{
            background:"none", border:"none", cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif", fontSize:14,
            color: page===p ? "var(--ink)" : "var(--muted)",
            textTransform:"capitalize", position:"relative", padding:"4px 0",
            transition:"color .2s",
          }}>
            {p}
            {page===p && <span style={{ position:"absolute", bottom:-2, left:0, right:0,
              height:1, background:"var(--ink)", borderRadius:99 }} />}
          </button>
        ))}
        {user ? (
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:13, color:"var(--muted)" }}>Hi, {user.name.split(" ")[0]}</span>
            <button onClick={onLogout} style={{
              background:"none", border:"1px solid var(--border)", cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"var(--muted)",
              padding:"5px 12px", borderRadius:99, transition:"all .2s",
            }}>Sign out</button>
          </div>
        ) : (
          <button onClick={() => setPage("login")} style={{
            background:"var(--ink)", border:"none", cursor:"pointer",
            fontFamily:"'Crimson Pro',serif", fontSize:15, fontStyle:"italic",
            color:"var(--cream)", padding:"7px 20px", borderRadius:99,
          }}>Sign in</button>
        )}
      </div>
    </nav>
  );
}

/* ─── Login / Signup page ─────────────────────────────────────────────────── */
function AuthPage({ onAuth }) {
  const [mode, setMode]       = useState("login");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null); setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const body = mode === "login" ? { email, password } : { name, email, password };
      const res = await fetch(`${API}${endpoint}`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Something went wrong");
      localStorage.setItem("el_token", data.token);
      localStorage.setItem("el_user",  JSON.stringify(data.user));
      onAuth(data.user);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"85vh", display:"flex", alignItems:"center",
      justifyContent:"center", padding:"40px 24px", position:"relative", zIndex:1 }}>
      <div className="auth-card fade-up">
        {/* Mascot */}
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <Mascot pose="welcome" size={100} style={{ animation:"float 3s ease infinite" }} />
          <h1 style={{ fontFamily:"'Crimson Pro',serif", fontSize:28, fontStyle:"italic",
            fontWeight:600, marginTop:12, letterSpacing:"-0.02em" }}>
            {mode === "login" ? "Welcome back!" : "Join EasyLearn"}
          </h1>
          <p style={{ fontSize:13, color:"var(--muted)", marginTop:6 }}>
            {mode === "login"
              ? "Sign in to access your study summaries"
              : "Create your free account to get started"}
          </p>
        </div>

        <WavyLine />

        {/* Fields */}
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:8 }}>
          {mode === "signup" && (
            <input className="field" placeholder="Your name" value={name}
              onChange={e => setName(e.target.value)} />
          )}
          <input className="field" type="email" placeholder="Email address" value={email}
            onChange={e => setEmail(e.target.value)} />
          <input className="field" type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()} />
        </div>

        {error && (
          <p style={{ marginTop:10, fontSize:13, color:"var(--terra)", textAlign:"center" }}>{error}</p>
        )}

        <button onClick={submit} disabled={loading} style={{
          width:"100%", marginTop:20, padding:"13px",
          borderRadius:99, border:"none", cursor: loading ? "not-allowed" : "pointer",
          background:"var(--ink)", color:"var(--cream)",
          fontFamily:"'Crimson Pro',serif", fontSize:17, fontStyle:"italic",
          opacity: loading ? 0.6 : 1, transition:"all .2s",
        }}>
          {loading ? "Please wait..." : mode === "login" ? "Sign in →" : "Create account →"}
        </button>

        <p style={{ textAlign:"center", marginTop:16, fontSize:13, color:"var(--muted)" }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode==="login"?"signup":"login"); setError(null); }}
            style={{ background:"none", border:"none", cursor:"pointer",
              color:"var(--sage)", fontWeight:500, fontSize:13 }}>
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

/* ─── Calm cloudy sky banner ──────────────────────────────────────────────── */
function Banner() {
  return (
    <div style={{ width:"100%", height:280, overflow:"hidden", position:"relative" }}>
      <svg viewBox="0 0 1200 280" preserveAspectRatio="xMidYMid slice"
        width="100%" height="100%" style={{ position:"absolute", inset:0 }}>
        <rect x="0" y="0" width="1200" height="280" fill="#C4D4DF"/>
        <rect x="0" y="0" width="1200" height="140" fill="#B8CCDB" opacity="0.5"/>
        {/* Moon */}
        <path d="M310 52 Q320 38 332 52 Q322 60 310 52Z" fill="#EEE5B8" opacity="0.9"/>
        {/* Stars */}
        {[[420,35],[560,22],[680,40],[800,28],[920,18],[1060,32],[200,28],[150,48]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r={1.3} fill="#F0EACC" opacity="0.55"/>
        ))}
        {/* Back clouds soft */}
        <ellipse cx="150"  cy="245" rx="130" ry="40" fill="#EAE2D2" opacity="0.4"/>
        <ellipse cx="1050" cy="240" rx="120" ry="38" fill="#EAE2D2" opacity="0.4"/>
        {/* Main cloud layer */}
        <ellipse cx="0"    cy="285" rx="190" ry="90" fill="#EFE7D7"/>
        <ellipse cx="100"  cy="270" rx="160" ry="78" fill="#F2EAD8"/>
        <ellipse cx="200"  cy="278" rx="140" ry="72" fill="#EDE5D4"/>
        <ellipse cx="120"  cy="260" rx="100" ry="62" fill="#F4ECD8"/>
        <ellipse cx="300"  cy="282" rx="130" ry="68" fill="#EEE6D4"/>
        <ellipse cx="420"  cy="276" rx="110" ry="62" fill="#F0E8D4"/>
        <ellipse cx="520"  cy="285" rx="100" ry="58" fill="#EDE5D2"/>
        <ellipse cx="600"  cy="290" rx="120" ry="65" fill="#F0E8D4"/>
        <ellipse cx="700"  cy="278" rx="110" ry="60" fill="#EDE5D2"/>
        <ellipse cx="800"  cy="282" rx="130" ry="68" fill="#EEE6D2"/>
        <ellipse cx="900"  cy="272" rx="140" ry="72" fill="#F2EAD6"/>
        <ellipse cx="1000" cy="280" rx="130" ry="65" fill="#EEE6D2"/>
        <ellipse cx="1100" cy="275" rx="140" ry="70" fill="#F0E8D4"/>
        <ellipse cx="1200" cy="285" rx="150" ry="75" fill="#EDE5D0"/>
        {/* Puffy tops */}
        <ellipse cx="90"  cy="252" rx="58" ry="50" fill="#F4ECD8"/>
        <ellipse cx="170" cy="244" rx="52" ry="46" fill="#F6EED8"/>
        <ellipse cx="420" cy="258" rx="50" ry="44" fill="#F2E8D4"/>
        <ellipse cx="700" cy="256" rx="52" ry="46" fill="#F0E6D2"/>
        <ellipse cx="900" cy="250" rx="56" ry="48" fill="#F2E8D4"/>
        <ellipse cx="1060" cy="254" rx="50" ry="44" fill="#F2EAD6"/>
        {/* Hand drawn lines on clouds */}
        <path d="M310 268 Q330 264 350 268" fill="none" stroke="#D4CCC0" strokeWidth="1" opacity="0.4"/>
        <path d="M740 265 Q760 261 780 265" fill="none" stroke="#D4CCC0" strokeWidth="1" opacity="0.4"/>
        {/* Fade bottom to cream */}
        <defs>
          <linearGradient id="bf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F2EDE4" stopOpacity="0"/>
            <stop offset="100%" stopColor="#F2EDE4" stopOpacity="1"/>
          </linearGradient>
        </defs>
        <rect x="0" y="220" width="1200" height="60" fill="url(#bf)"/>
      </svg>
    </div>
  );
}

/* ─── Upload page ─────────────────────────────────────────────────────────── */
function UploadPage({ onResult, user }) {
  const [files, setFiles]     = useState([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [procStep, setProcStep] = useState(0);
  const inputRef = useRef();
  const ALLOWED = ["application/pdf","image/png","image/jpeg","image/webp"];

  const addFiles = useCallback((incoming) => {
    const valid = Array.from(incoming).filter(f => ALLOWED.includes(f.type));
    if (valid.length < incoming.length) setError("Only PDF, JPG, PNG, WEBP supported.");
    else setError(null);
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      return [...prev, ...valid.filter(f => !names.has(f.name))];
    });
  }, []);

  const steps = [
    "Hmm, let me read this...",
    "OK, pulling out the key bits...",
    "Thinking about this carefully...",
    "Putting it all together...",
    "Almost done, nearly there...",
  ];

  const submit = async () => {
    if (!files.length) return;
    setLoading(true); setError(null);
    let si = 0; setProcStep(0);
    const iv = setInterval(() => { si = Math.min(si+1, steps.length-1); setProcStep(si); }, 5000);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append("files", f));
      const token = localStorage.getItem("el_token");
      const res = await fetch(`${API}/upload`, {
        method:"POST", body:fd,
        headers: token ? { "Authorization":`Bearer ${token}` } : {},
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Upload failed"); }
      const data = await res.json();
      clearInterval(iv);
      onResult(data, files.map(f => f.name));
      setFiles([]);
    } catch(e) {
      clearInterval(iv);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ProcessingPage step={steps[procStep]} procStep={procStep} fileNames={files.map(f=>f.name)} />;

  return (
    <div style={{ position:"relative", zIndex:1 }}>
      <Banner />
      <div style={{ maxWidth:720, margin:"0 auto", padding:"40px 24px 80px" }}>
        {/* Mascot */}
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:-10 }}>
          <Mascot pose="idle" size={90} style={{ animation:"float 3s ease infinite" }} />
        </div>

        {/* Drop zone */}
        <div onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
          className="fade-up"
          style={{
            border:`1.5px dashed ${dragging ? "var(--sage)" : "var(--border)"}`,
            borderRadius:16, padding:"52px 32px", textAlign:"center", cursor:"pointer",
            background: dragging ? "rgba(107,140,106,0.04)" : "rgba(250,247,242,0.6)",
            transition:"all .25s", position:"relative",
          }}>
          <input ref={inputRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp"
            style={{ display:"none" }} onChange={e => addFiles(e.target.files)} />
          {files.length === 0 ? (
            <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:18, color:"var(--muted)",
              fontStyle:"italic" }}>
              drop your notes here or click to browse.
            </p>
          ) : (
            <div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", marginBottom:14 }}>
                {files.map(f => (
                  <span key={f.name} style={{
                    display:"inline-flex", alignItems:"center", gap:6,
                    padding:"4px 12px", borderRadius:99,
                    border:"1px solid var(--border)", background:"var(--paper)",
                    fontSize:13, color:"var(--ink2)",
                  }}>
                    <span style={{ width:6, height:6, borderRadius:"50%",
                      background: f.type==="application/pdf" ? "var(--terra)" : "var(--dusty)",
                      display:"inline-block" }} />
                    {f.name}
                    <button onClick={e => { e.stopPropagation(); setFiles(prev=>prev.filter(x=>x.name!==f.name)); }}
                      style={{ background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:15 }}>×</button>
                  </span>
                ))}
              </div>
              <p style={{ fontSize:13, color:"var(--muted)", fontFamily:"'DM Sans',sans-serif" }}>click to add more</p>
            </div>
          )}
        </div>

        {error && <p style={{ marginTop:10, fontSize:13, color:"var(--terra)", textAlign:"center" }}>{error}</p>}

        <div className="fade-up" style={{ animationDelay:".1s", display:"flex", justifyContent:"center", marginTop:24 }}>
          <button onClick={submit} disabled={!files.length}
            style={{
              fontFamily:"'Crimson Pro',serif", fontSize:18, fontStyle:"italic",
              padding:"11px 36px", borderRadius:99,
              border:"1.5px solid var(--ink)", background:"transparent",
              color:"var(--ink)", cursor: files.length ? "pointer" : "not-allowed",
              opacity: files.length ? 1 : 0.35, transition:"all .2s",
            }}
            onMouseEnter={e => { if(files.length){ e.target.style.background="var(--ink)"; e.target.style.color="var(--cream)"; }}}
            onMouseLeave={e => { e.target.style.background="transparent"; e.target.style.color="var(--ink)"; }}>
            Summarise →
          </button>
        </div>

        <p className="fade-up" style={{ animationDelay:".2s", textAlign:"center", marginTop:16,
          fontSize:12, color:"var(--muted)", letterSpacing:"0.03em" }}>
          PDF · JPG · PNG · WEBP · handwritten notes welcome
        </p>
      </div>
    </div>
  );
}


/* ─── Processing page ─────────────────────────────────────────────────────── */


/* ─── Processing page ─────────────────────────────────────────────────────── */
function ProcessingPage({ step, procStep = 0, fileNames }) {
  return (
    <div style={{
      minHeight:"92vh",
      display:"flex",
      flexDirection:"column",
      alignItems:"center",
      justifyContent:"center",
      gap:28,
      padding:"40px 24px",
      position:"relative",
      zIndex:1,
    }}>

      <Mascot pose="processing" size={180} style={{ animation:"readingBob 2.2s ease infinite" }} />

      <p key={step} style={{
        fontFamily:"'Crimson Pro', serif",
        fontSize:28,
        fontStyle:"italic",
        color:"var(--ink2)",
        letterSpacing:"-0.01em",
        textAlign:"center",
        animation:"fadeIn 0.5s ease both",
        maxWidth:380,
        lineHeight:1.4,
      }}>
        {step}
      </p>

      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
        <div className="pencil-loader" />
        <p style={{
          fontFamily:"'DM Sans', sans-serif",
          fontSize:11,
          letterSpacing:"0.2em",
          color:"var(--muted)",
          textTransform:"uppercase",
          animation:"textPulse 2s ease infinite",
        }}>Loading...</p>
      </div>

      {fileNames?.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center" }}>
          {fileNames.map(n => (
            <span key={n} style={{
              padding:"3px 14px",
              borderRadius:99,
              border:"1px solid var(--border)",
              fontSize:12,
              color:"var(--muted)",
              fontFamily:"'DM Sans', sans-serif",
            }}>{n}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Copy helper ─────────────────────────────────────────────────────────── */
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} title="Copy to clipboard" style={{
      background:"none", border:"1px solid var(--border)", borderRadius:8,
      padding:"5px 10px", cursor:"pointer", color: copied ? "var(--sage)" : "var(--muted)",
      fontSize:12, fontFamily:"'DM Sans',sans-serif", display:"flex",
      alignItems:"center", gap:5, transition:"all .2s",
    }}>
      {copied ? (
        <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!</>
      ) : (
        <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</>
      )}
    </button>
  );
}

/* ─── PDF export helper ───────────────────────────────────────────────────── */
function exportPDF(topic, raw) {
  const win = window.open("", "_blank");
  win.document.write(`<!DOCTYPE html><html><head>
    <title>${topic} — EasyLearn</title>
    <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400&display=swap" rel="stylesheet"/>
    <style>
      body { font-family:'Crimson Pro',serif; max-width:700px; margin:60px auto; color:#2C2416; line-height:1.8; }
      h1 { font-size:36px; font-style:italic; margin-bottom:8px; }
      .label { font-family:'DM Sans',sans-serif; font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:#9C8E7E; margin:28px 0 10px; }
      p { font-size:17px; font-weight:300; margin-bottom:12px; }
      hr { border:none; border-top:1px solid #D8CFBF; margin:24px 0; }
      .brand { font-family:'DM Sans',sans-serif; font-size:12px; color:#9C8E7E; margin-top:60px; }
      @media print { body { margin:40px; } }
    </style>
  </head><body>
    <h1>${topic}</h1>
    <hr/>
    <div class="label">Summary</div>
    <p>${raw.replace(/[📚✅🔑🧠📝🎯\*#]/g,"").replace(/\n/g,"</p><p>")}</p>
    <hr/>
    <p class="brand">Generated by EasyLearn · easylearn.local</p>
    <script>window.onload=()=>window.print();</script>
  </body></html>`);
  win.document.close();
}

/* ─── Summary page ────────────────────────────────────────────────────────── */
function cleanRaw(text) {
  return text
    .split("")
    .filter(c => c.charCodeAt(0) < 9000 || c === " ")
    .join("")
    .replace(/\*\*/g, "")
    .replace(/#{1,6} /g, "")
    .trim();
}

function SummaryPage({ data, fileNames, onBack }) {
  const [fcIndex, setFcIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [fcKnow,  setFcKnow]  = useState(0);
  const [fcDone,  setFcDone]  = useState(false);

  const raw = data?.summary || "";

  function parseSection(heading) {
    const regex = new RegExp(heading + "[^\\n]*\\n([\\s\\S]*?)(?=\\n[📚✅🔑🧠📝🎯]|$)", "i");
    const m = raw.match(regex);
    return m ? m[1].trim() : "";
  }

  const topic = (() => {
    const s = parseSection("📚");
    return s.split("\n")[0]?.replace(/\*\*/g,"").trim() || "Your Summary";
  })();

  const cleanText = (t) => t
    .replace(/[📚✅🔑🧠📝🎯★✦✓•]/g, "")
    .replace(/\*\*/g, "")
    .replace(/#{1,6} /g, "")
    .trim();

  const explanation  = cleanText(parseSection("🧠"));
  const examSummary  = cleanText(parseSection("📝"));
  const tips         = cleanText(parseSection("🎯"));

  const points = (() => {
    return parseSection("✅").split("\n")
      .filter(l=>l.trim())
      .map(l=>l.replace(/^[-*•\d.]+\s*/,"").replace(/\*\*/g,"").trim())
      .filter(Boolean);
  })();

  const concepts = (() => {
    return parseSection("🔑").split("\n")
      .filter(l=>l.trim())
      .map(l => {
        const c = l.replace(/^[-*•\d.]+\s*/,"").replace(/\*\*/g,"");
        const p = c.split(/[:\-–]/);
        return { term:p[0]?.trim()||"", def:p.slice(1).join(":").trim()||"" };
      })
      .filter(c=>c.term);
  })();

  const flashcards = [
    ...concepts.filter(c=>c.def).map(c=>({ q:`What is "${c.term}"?`, a:c.def })),
    ...points.slice(0,6).map((p,i)=>({ q:`Can you explain key point ${i+1}?`, a:p })),
  ];

  const fcNext = (knew) => {
    if (knew) setFcKnow(k=>k+1);
    if (fcIndex+1 >= flashcards.length) { setFcDone(true); return; }
    setFcIndex(i=>i+1); setFlipped(false);
  };

  const SLabel = ({ text, accent = false }) => (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
      <div style={{ width:16, height:1, background:"var(--border)" }} />
      <p style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em", textTransform:"uppercase",
        color: accent ? "var(--sage)" : "var(--muted)", fontFamily:"'DM Sans',sans-serif",
        whiteSpace:"nowrap" }}>{text}</p>
      <div style={{ flex:1, height:1, background:"var(--border)" }} />
    </div>
  );

  return (
    <div className="fade-in" style={{ maxWidth:1060, margin:"0 auto",
      padding:"48px 32px 100px", display:"grid", gridTemplateColumns:"1fr 300px",
      gap:60, position:"relative" }}>

      {/* ── Left column ── */}
      <div>
        {/* Back + export */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          marginBottom:28, flexWrap:"wrap", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={onBack} style={{ background:"none",border:"none",cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--muted)",padding:0 }}>
              ← new upload
            </button>
            {(fileNames||[]).map(n=>(
              <span key={n} style={{ fontSize:11,color:"var(--muted)",padding:"2px 8px",
                borderRadius:99,border:"1px solid var(--border)" }}>{n}</span>
            ))}
          </div>
          {/* Export buttons */}
          <div style={{ display:"flex", gap:8 }}>
            <CopyBtn text={cleanRaw(raw)} />
            <button onClick={() => exportPDF(topic, raw)} style={{
              background:"none", border:"1px solid var(--border)", borderRadius:8,
              padding:"5px 10px", cursor:"pointer", color:"var(--muted)",
              fontSize:12, fontFamily:"'DM Sans',sans-serif",
              display:"flex", alignItems:"center", gap:5,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              PDF
            </button>
          </div>
        </div>

        {/* Topic */}
        <h1 style={{ fontFamily:"'Crimson Pro',serif", fontSize:"clamp(28px,4vw,48px)",
          fontWeight:600, letterSpacing:"-0.03em", lineHeight:1.1, marginBottom:36 }}>
          {topic}
        </h1>

        {/* Simple explanation */}
        <SLabel text="Simple Explanation" />
        <div style={{ fontFamily:"'Crimson Pro',serif",fontSize:18,lineHeight:1.85,
          color:"var(--ink2)",fontWeight:300,marginBottom:8 }}>
          {explanation.split("\n\n").map((p,i)=><p key={i} style={{marginBottom:14}}>{p}</p>)}
        </div>

        <WavyLine />

        {/* Exam summary */}
        <SLabel text="Exam Summary" />
        <div style={{ fontFamily:"'Crimson Pro',serif",fontSize:18,lineHeight:1.85,
          color:"var(--ink2)",fontWeight:300,marginBottom:8 }}>
          {examSummary.split("\n\n").map((p,i)=><p key={i} style={{marginBottom:14}}>{p}</p>)}
        </div>

        <WavyLine />

        {/* Tips */}
        {tips && <>
          <SLabel text="Quick Tips" />
          <div style={{ marginBottom:8 }}>
            {tips.split("\n").filter(l=>l.trim()).map((t,i)=>(
              <div key={i} style={{ display:"flex",gap:10,marginBottom:12,alignItems:"flex-start" }}>
                <span style={{ color:"var(--yellow)",fontSize:14,marginTop:3,flexShrink:0,fontFamily:"serif" }}>✦</span>
                <span style={{ fontFamily:"'Crimson Pro',serif",fontSize:17,lineHeight:1.7,
                  color:"var(--ink2)",fontWeight:300 }}>
                  {t.replace(/^[-*•\d.★]+\s*/,"")}
                </span>
              </div>
            ))}
          </div>
          <WavyLine />
        </>}

        {/* Key points */}
        <SLabel text="Key Points" />
        <div style={{ marginBottom:8 }}>
          {points.map((p,i)=>(
            <div key={i} className="fade-up" style={{ animationDelay:`${i*0.06}s`,
              display:"flex",gap:14,padding:"12px 0",
              borderBottom:"1px solid var(--border)",alignItems:"flex-start" }}>
              <span style={{ fontFamily:"'Crimson Pro',serif",fontSize:13,color:"var(--muted)",
                minWidth:22,marginTop:3 }}>{String(i+1).padStart(2,"0")}</span>
              <span style={{ fontFamily:"'Crimson Pro',serif",fontSize:17,lineHeight:1.65,
                color:"var(--ink2)",fontWeight:300 }}>{p}</span>
            </div>
          ))}
        </div>

        <WavyLine />

        {/* Flashcards */}
        <SLabel text="Review Cards" />
        {flashcards.length === 0
          ? <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:16,color:"var(--muted)",fontStyle:"italic" }}>No flashcards generated.</p>
          : fcDone
          ? (
            <div className="pop-in" style={{ textAlign:"center",padding:"48px 0" }}>
              <Mascot pose="welcome" size={110} style={{ animation:"float 2s ease infinite",marginBottom:12 }} />
              <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:26,fontStyle:"italic",marginBottom:6 }}>All done!</p>
              <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"var(--muted)",marginBottom:20 }}>
                {fcKnow} of {flashcards.length} cards marked as known
              </p>
              <button onClick={()=>{setFcIndex(0);setFlipped(false);setFcKnow(0);setFcDone(false);}}
                style={{ fontFamily:"'Crimson Pro',serif",fontSize:16,fontStyle:"italic",
                  padding:"9px 28px",borderRadius:99,border:"1px solid var(--border)",
                  background:"transparent",color:"var(--ink)",cursor:"pointer" }}>
                Restart cards
              </button>
            </div>
          )
          : (
            <div>
              {/* Progress */}
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
                <span style={{ fontSize:12,color:"var(--muted)",fontFamily:"'DM Sans',sans-serif" }}>
                  Card {fcIndex+1} of {flashcards.length}
                </span>
                <div style={{ flex:1,height:3,background:"var(--border)",borderRadius:99,margin:"0 16px" }}>
                  <div style={{ height:"100%",background:"var(--sage)",borderRadius:99,
                    width:`${((fcIndex)/flashcards.length)*100}%`,transition:"width .4s ease" }} />
                </div>
                <span style={{ fontSize:12,color:"var(--muted)",fontFamily:"'DM Sans',sans-serif" }}>
                  {Math.round((fcIndex/flashcards.length)*100)}%
                </span>
              </div>

              {/* Card — 3D flip */}
              <div className="fc-scene" onClick={() => setFlipped(f => !f)}>
                <div className={flipped ? "fc-inner is-flipped" : "fc-inner"}>
                  <div className="fc-front">
                    <p style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em",
                      textTransform:"uppercase", color:"var(--muted)",
                      fontFamily:"'DM Sans',sans-serif", marginBottom:20 }}>
                      Question {fcIndex + 1} of {flashcards.length}
                    </p>
                    <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:22,
                      fontStyle:"italic", lineHeight:1.6, color:"var(--ink)" }}>
                      {flashcards[fcIndex].q}
                    </p>
                    <p style={{ marginTop:24, fontSize:11, color:"var(--muted)",
                      fontFamily:"'DM Sans',sans-serif" }}>tap to flip →</p>
                  </div>
                  <div className="fc-back">
                    <p style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em",
                      textTransform:"uppercase", color:"var(--muted)",
                      fontFamily:"'DM Sans',sans-serif", marginBottom:20 }}>Answer</p>
                    <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:19,
                      lineHeight:1.7, color:"var(--ink2)", fontWeight:300 }}>
                      {flashcards[fcIndex].a}
                    </p>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:20,marginTop:20 }}>
                <button onClick={()=>fcNext(false)} style={{
                  background:"none",border:"1px solid var(--border)",borderRadius:10,
                  padding:"10px 24px",cursor:"pointer",color:"var(--terra)",
                  fontFamily:"'DM Sans',sans-serif",fontSize:14,transition:"all .2s",
                }}>Skip</button>
                <button onClick={()=>setFlipped(f=>!f)} style={{
                  background:"none",border:"1px solid var(--border)",borderRadius:10,
                  padding:"10px 24px",cursor:"pointer",color:"var(--ink2)",
                  fontFamily:"'DM Sans',sans-serif",fontSize:14,transition:"all .2s",
                }}>Flip</button>
                <button onClick={()=>fcNext(true)} style={{
                  background:"none",border:"1px solid rgba(107,140,106,0.4)",borderRadius:10,
                  padding:"10px 24px",cursor:"pointer",color:"var(--sage)",
                  fontFamily:"'DM Sans',sans-serif",fontSize:14,transition:"all .2s",
                }}>Got it ✓</button>
              </div>
            </div>
          )
        }
      </div>

      {/* ── Right column — Key concepts ── */}
      <div style={{ position:"sticky", top:80, alignSelf:"start" }}>
        <SLabel text="Key Concepts" />
        {concepts.length === 0
          ? <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:15,color:"var(--muted)",fontStyle:"italic" }}>No concepts found.</p>
          : concepts.map((c,i)=>(
            <div key={i} className="fade-up" style={{ animationDelay:`${i*0.07}s`,
              paddingBottom:16,marginBottom:16,borderBottom:"1px solid var(--border)" }}>
              <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:17,fontWeight:600,
                color:"var(--ink)",marginBottom:5 }}>{c.term}</p>
              <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,lineHeight:1.65,
                color:"var(--ink2)",fontWeight:300 }}>{c.def}</p>
            </div>
          ))
        }
      </div>
    </div>
  );
}

/* ─── History page ────────────────────────────────────────────────────────── */
function HistoryPage({ onOpen }) {
  const history = JSON.parse(localStorage.getItem("el_history") || "[]");
  return (
    <div style={{ maxWidth:720, margin:"0 auto", padding:"56px 32px 100px", position:"relative", zIndex:1 }}>
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:40 }}>
        <h1 style={{ fontFamily:"'Crimson Pro',serif",fontSize:38,fontWeight:600,
          fontStyle:"italic",letterSpacing:"-0.03em" }}>Past uploads</h1>
        <span style={{ color:"var(--yellow)",fontSize:18 }}>★</span>
      </div>
      {history.length === 0 ? (
        <div style={{ textAlign:"center",padding:"60px 0" }}>
          <Mascot pose="sleeping" size={160} />
          <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:22,fontStyle:"italic",
            color:"var(--muted)",marginTop:16 }}>Nothing here yet</p>
          <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--border)",marginTop:8 }}>
            Upload something to get started
          </p>
        </div>
      ) : (
        <div>
          {history.map((h,i) => (
            <div key={h.id||i} className="fade-up" style={{ animationDelay:`${i*0.05}s` }}>
              <div onClick={() => onOpen(h)}
                style={{ display:"flex",alignItems:"baseline",justifyContent:"space-between",
                  padding:"16px 0",cursor:"pointer",gap:16,
                  transition:"padding-left .2s" }}
                onMouseEnter={e=>e.currentTarget.style.paddingLeft="8px"}
                onMouseLeave={e=>e.currentTarget.style.paddingLeft="0px"}>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:4 }}>
                    {(h.fileNames||[]).map(n=>(
                      <span key={n} style={{ fontFamily:"'Crimson Pro',serif",fontSize:17,
                        fontWeight:600,color:"var(--ink)" }}>{n}</span>
                    ))}
                  </div>
                  <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--muted)",
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                    {(h.summary||"").replace(/[📚✅🔑🧠📝🎯\*]/g,"").substring(0,90)}...
                  </p>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:12,flexShrink:0 }}>
                  <span style={{ fontSize:12,color:"var(--muted)",fontFamily:"'DM Sans',sans-serif" }}>{h.date}</span>
                  <span style={{ fontFamily:"'Crimson Pro',serif",fontSize:16,color:"var(--muted)" }}>→</span>
                </div>
              </div>
              <WavyLine />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── About page ──────────────────────────────────────────────────────────── */
function AboutPage({ setPage }) {
  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"60px 32px 100px", position:"relative", zIndex:1 }}>
      {/* Hero with mascot */}
      <div style={{ display:"flex",alignItems:"center",gap:24,marginBottom:40 }}>
        <Mascot pose="welcome" size={100} style={{ animation:"float 3.5s ease infinite",flexShrink:0 }} />
        <div>
          <h1 style={{ fontFamily:"'Crimson Pro',serif",fontSize:40,fontWeight:600,
            fontStyle:"italic",letterSpacing:"-0.03em",marginBottom:8 }}>
            Meet EasyLearn
          </h1>
          <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"var(--muted)",lineHeight:1.6 }}>
            Your personal AI study companion
          </p>
        </div>
      </div>

      <WavyLine />

      {/* Story */}
      <div style={{ marginBottom:36 }}>
        <p style={{ fontSize:11,fontWeight:500,letterSpacing:"0.1em",textTransform:"uppercase",
          color:"var(--muted)",fontFamily:"'DM Sans',sans-serif",marginBottom:14 }}>The story</p>
        <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:19,lineHeight:1.85,
          color:"var(--ink2)",fontWeight:300 }}>
          Studying is hard. Textbooks are dense. Notes are messy. And exam season always feels too short.
          EasyLearn was built to fix that — a tool that reads your material and turns it into something
          you can actually understand and remember.
        </p>
      </div>

      <WavyLine />

      {/* How it works — 3 steps */}
      <div style={{ marginBottom:36 }}>
        <p style={{ fontSize:11,fontWeight:500,letterSpacing:"0.1em",textTransform:"uppercase",
          color:"var(--muted)",fontFamily:"'DM Sans',sans-serif",marginBottom:20 }}>How it works</p>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20 }}>
          {[
            { num:"01", title:"Upload", desc:"Drop any PDF, photo or handwritten notes." },
            { num:"02", title:"AI reads it", desc:"Mistral AI extracts and understands your content." },
            { num:"03", title:"You learn", desc:"Get a clear summary, flashcards and exam tips." },
          ].map(s=>(
            <div key={s.num} style={{ padding:"20px",borderRadius:14,
              border:"1px solid var(--border)",background:"var(--paper)" }}>
              <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:28,fontStyle:"italic",
                color:"var(--border)",marginBottom:8 }}>{s.num}</p>
              <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:17,fontWeight:600,marginBottom:6 }}>{s.title}</p>
              <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--muted)",lineHeight:1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <WavyLine />

      {/* Tech */}
      <div style={{ marginBottom:36 }}>
        <p style={{ fontSize:11,fontWeight:500,letterSpacing:"0.1em",textTransform:"uppercase",
          color:"var(--muted)",fontFamily:"'DM Sans',sans-serif",marginBottom:14 }}>Under the hood</p>
        <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:18,lineHeight:1.85,
          color:"var(--ink2)",fontWeight:300 }}>
          Everything runs on your own machine. Your files never leave your computer.
          Text extraction uses pdfplumber for PDFs and Tesseract OCR for handwritten notes.
          Summaries are generated by Mistral AI running locally via Ollama.
          All history is saved in a local MongoDB database.
        </p>
      </div>

      <WavyLine />

      {/* CTA */}
      <div style={{ textAlign:"center",paddingTop:16 }}>
        <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:22,fontStyle:"italic",
          color:"var(--ink2)",marginBottom:20 }}>
          Ready to study smarter?
        </p>
        <button onClick={() => setPage("upload")} style={{
          fontFamily:"'Crimson Pro',serif",fontSize:18,fontStyle:"italic",
          padding:"12px 36px",borderRadius:99,border:"1.5px solid var(--ink)",
          background:"transparent",color:"var(--ink)",cursor:"pointer",transition:"all .2s",
        }}
          onMouseEnter={e=>{e.target.style.background="var(--ink)";e.target.style.color="var(--cream)";}}
          onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="var(--ink)";}}>
          Start uploading →
        </button>
      </div>
    </div>
  );
}

/* ─── Root App ────────────────────────────────────────────────────────────── */
export default function App() {
  const [page,         setPage]         = useState(() => localStorage.getItem("el_user") ? "upload" : "login");
  const [user,         setUser]         = useState(() => JSON.parse(localStorage.getItem("el_user") || "null"));
  const [summaryData,  setSummaryData]  = useState(null);
  const [summaryFiles, setSummaryFiles] = useState([]);

  const handleAuth = (u) => {
    setUser(u);
    setPage("upload");
  };

  const handleLogout = () => {
    localStorage.removeItem("el_token");
    localStorage.removeItem("el_user");
    setUser(null);
    setPage("login");
  };

  const handleResult = (data, fileNames) => {
    const entry = {
      id: Date.now(), fileNames, summary: data.summary,
      date: new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}),
    };
    const history = JSON.parse(localStorage.getItem("el_history")||"[]");
    history.unshift(entry);
    localStorage.setItem("el_history", JSON.stringify(history.slice(0,50)));
    setSummaryData(data); setSummaryFiles(fileNames); setPage("summary");
  };

  const handleOpenHistory = (h) => {
    setSummaryData({ summary:h.summary }); setSummaryFiles(h.fileNames||[]); setPage("summary");
  };

  return (
    <>
      <GlobalStyle />
      <Doodles />
      <div style={{ position:"relative", zIndex:1, minHeight:"100vh" }}>
        <Navbar page={page} setPage={setPage} user={user} onLogout={handleLogout} />
        {page === "login"   && <AuthPage onAuth={handleAuth} />}
        {page === "upload"  && <UploadPage onResult={handleResult} user={user} />}
        {page === "summary" && <SummaryPage data={summaryData} fileNames={summaryFiles} onBack={()=>setPage("upload")} />}
        {page === "history" && <HistoryPage onOpen={handleOpenHistory} />}
        {page === "about"   && <AboutPage setPage={setPage} />}
      </div>
    </>
  );
}
