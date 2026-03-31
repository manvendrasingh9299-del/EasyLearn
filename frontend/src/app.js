import { useState, useRef, useCallback, useEffect } from "react";

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

/* ─── Dark mode hook ──────────────────────────────────────────────────────── */
function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem("el_dark") === "true");
  const toggle = () => setDark(d => {
    localStorage.setItem("el_dark", String(!d));
    return !d;
  });
  return [dark, toggle];
}

/* ─── Global CSS ──────────────────────────────────────────────────────────── */
const GlobalStyle = ({ dark }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500&family=Caveat:wght@400;500;600&display=swap');

    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

    :root {
      --cream:  ${dark ? "#0F1829" : "#F2EDE4"};
      --cream2: ${dark ? "#151F35" : "#EDE7DC"};
      --paper:  ${dark ? "#1A2540" : "#FAF7F2"};
      --ink:    ${dark ? "#E8E0D0" : "#2C2416"};
      --ink2:   ${dark ? "#B8A99A" : "#5C5040"};
      --muted:  ${dark ? "#6B7FA0" : "#9C8E7E"};
      --border: ${dark ? "#2A3A58" : "#D8CFBF"};
      --terra:  ${dark ? "#E8845A" : "#C4694A"};
      --sage:   ${dark ? "#7BB87A" : "#6B8C6A"};
      --dusty:  ${dark ? "#7BAED4" : "#6B8CAE"};
      --yellow: ${dark ? "#E8C060" : "#D4A843"};
      --nav-bg: ${dark ? "rgba(15,24,41,0.92)" : "rgba(242,237,228,0.92)"};
    }

    html { scroll-behavior:smooth; }
    body {
      font-family:'DM Sans',sans-serif;
      color:var(--ink);
      min-height:100vh;
      -webkit-font-smoothing:antialiased;
      transition: background-color 0.4s ease;
      ${dark ? `
        background-color: #0F1829;
        background-image:
          radial-gradient(circle at 75% 8%,  rgba(100,140,220,0.12) 0%, transparent 45%),
          radial-gradient(circle at 10% 85%, rgba(60,100,180,0.10)  0%, transparent 40%),
          radial-gradient(circle at 90% 70%, rgba(80,60,160,0.08)   0%, transparent 35%),
          radial-gradient(#1E2D50 0.85px, transparent 0.85px);
        background-size: auto, auto, auto, 28px 28px;
        background-attachment: fixed;
      ` : `
        background-color: #F2EDE4;
        background-image:
          radial-gradient(circle at 75% 8%,  rgba(196,105,74,0.11)  0%, transparent 42%),
          radial-gradient(circle at 12% 82%, rgba(107,140,106,0.09) 0%, transparent 38%),
          radial-gradient(circle at 88% 72%, rgba(212,168,67,0.07)  0%, transparent 32%),
          radial-gradient(#C4B89E 0.85px, transparent 0.85px);
        background-size: auto, auto, auto, 28px 28px;
        background-attachment: fixed;
      `}
    }

    ::selection { background:rgba(107,140,106,0.25); }
    ::-webkit-scrollbar { width:5px; }
    ::-webkit-scrollbar-track { background:var(--cream); }
    ::-webkit-scrollbar-thumb { background:var(--border); border-radius:99px; }

    @keyframes fadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
    @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes readingBob{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
    @keyframes popIn     { 0%{transform:scale(0.9);opacity:0} 60%{transform:scale(1.03)} 100%{transform:scale(1);opacity:1} }
    @keyframes bubbleUp  { 0%,100%{transform:translateY(0);opacity:.7} 50%{transform:translateY(-12px);opacity:1} }
    @keyframes inkWrite  { 0%{stroke-dashoffset:200} 100%{stroke-dashoffset:-200} }
    @keyframes chatSlideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.4} }

    .fade-up { animation:fadeUp  0.55s cubic-bezier(.22,1,.36,1) both; }
    .fade-in { animation:fadeIn  0.35s ease both; }
    .pop-in  { animation:popIn   0.45s cubic-bezier(.22,1,.36,1) both; }

    .wavy-divider { width:100%; overflow:visible; margin:32px 0; }
    .wavy-path { fill:none; stroke:var(--border); stroke-width:1.5; stroke-linecap:round; }

    .field {
      width:100%; padding:12px 16px; border:1px solid var(--border);
      border-radius:10px; background:var(--paper);
      font-family:'DM Sans',sans-serif; font-size:15px; color:var(--ink);
      outline:none; transition:border-color .2s;
    }
    .field:focus { border-color:var(--sage); }
    .field::placeholder { color:var(--muted); }

    .auth-card {
      background:var(--paper); border:1px solid var(--border);
      border-radius:20px; padding:40px 36px; width:100%; max-width:420px;
    }

    .fc-scene { perspective:1000px; width:100%; height:300px; cursor:pointer; margin-bottom:20px; }
    .fc-inner {
      position:relative; width:100%; height:100%;
      transition:transform 0.65s cubic-bezier(0.4,0.2,0.2,1);
      transform-style:preserve-3d; -webkit-transform-style:preserve-3d;
    }
    .fc-inner.is-flipped { transform:rotateY(180deg); }
    .fc-front, .fc-back {
      position:absolute; width:100%; height:100%;
      backface-visibility:hidden; -webkit-backface-visibility:hidden;
      border-radius:20px; display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      padding:36px; text-align:center; will-change:transform;
    }
    .fc-front { background:var(--paper); border:1.5px solid var(--border); transform:rotateY(0deg); }
    .fc-back  { background:var(--cream2); border:1.5px solid var(--border); transform:rotateY(180deg); }

    .chat-bubble-ai {
      background:var(--paper); border:1px solid var(--border);
      border-radius:18px 18px 18px 4px; padding:11px 15px;
      font-size:13.5px; color:var(--ink); line-height:1.65;
      animation:chatSlideIn 0.3s ease both; max-width:86%;
    }
    .chat-bubble-user {
      background:var(--sage); border-radius:18px 18px 4px 18px;
      padding:10px 15px; font-size:13.5px; color:#fff;
      line-height:1.6; animation:chatSlideIn 0.3s ease both;
      max-width:80%; align-self:flex-end;
    }
    .chat-input {
      width:100%; padding:10px 16px; border:1px solid var(--border);
      border-radius:99px; background:var(--paper);
      font-family:'DM Sans',sans-serif; font-size:13px; color:var(--ink);
      outline:none; transition:border-color .2s;
    }
    .chat-input:focus { border-color:var(--sage); }
    .chat-input::placeholder { color:var(--muted); }

    .quiz-option {
      width:100%; text-align:left; padding:11px 18px;
      border:1px solid var(--border); border-radius:12px;
      background:var(--paper); color:var(--ink);
      font-family:'DM Sans',sans-serif; font-size:14px;
      cursor:pointer; transition:all .2s; margin-bottom:8px;
      display:block;
    }
    .quiz-option:hover { border-color:var(--sage); background:var(--cream2); }
    .quiz-option.correct { border-color:var(--sage); background:rgba(107,140,106,0.12); color:var(--sage); }
    .quiz-option.wrong   { border-color:var(--terra); background:rgba(196,105,74,0.10); color:var(--terra); }
  `}</style>
);

/* ─── Wavy divider ────────────────────────────────────────────────────────── */
const WavyLine = ({ color = "var(--border)" }) => (
  <svg className="wavy-divider" height="20" viewBox="0 0 700 20" preserveAspectRatio="none">
    <path className="wavy-path" stroke={color}
      d="M0 10 C50 4,100 16,150 10 C200 4,250 16,300 10 C350 4,400 16,450 10 C500 4,550 16,600 10 C640 5,670 14,700 10" />
  </svg>
);

/* ─── Dark mode toggle ────────────────────────────────────────────────────── */
function DarkToggle({ dark, onToggle }) {
  return (
    <button onClick={onToggle} title={dark ? "Light mode" : "Dark mode"} style={{
      background:"none", border:"1px solid var(--border)", borderRadius:99,
      padding:"5px 11px", cursor:"pointer", fontSize:14, lineHeight:1,
      color:"var(--muted)", transition:"all .2s",
    }}>
      {dark ? "☀️" : "🌙"}
    </button>
  );
}

/* ─── Navbar ──────────────────────────────────────────────────────────────── */
function Navbar({ page, setPage, user, onLogout, dark, onToggleDark }) {
  return (
    <nav style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"16px 48px", position:"sticky", top:0, zIndex:100,
      backdropFilter:"blur(14px)", backgroundColor:"var(--nav-bg)",
      borderBottom:"1px solid var(--border)",
    }}>
      <div onClick={() => setPage(user ? "upload" : "login")}
        style={{ fontFamily:"'Crimson Pro',serif", fontSize:24, fontStyle:"italic",
          fontWeight:600, letterSpacing:"-0.02em", cursor:"pointer", color:"var(--ink)" }}>
        EasyLearn
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:24 }}>
        {user && ["upload","history","about"].map(p => (
          <button key={p} onClick={() => setPage(p)} style={{
            background:"none", border:"none", cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif", fontSize:14,
            color: page===p ? "var(--ink)" : "var(--muted)",
            textTransform:"capitalize", position:"relative", padding:"4px 0", transition:"color .2s",
          }}>
            {p}
            {page===p && <span style={{ position:"absolute", bottom:-2, left:0, right:0,
              height:1, background:"var(--ink)", borderRadius:99 }} />}
          </button>
        ))}
        <DarkToggle dark={dark} onToggle={onToggleDark} />
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

/* ─── Auth page ───────────────────────────────────────────────────────────── */
function AuthPage({ onAuth }) {
  const [mode, setMode]         = useState("login");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  const submit = async () => {
    setError(null); setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const body = mode === "login" ? { email, password } : { name, email, password };
      const res = await fetch(`${API}${endpoint}`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Something went wrong");
      localStorage.setItem("el_token", data.token);
      localStorage.setItem("el_user",  JSON.stringify(data.user));
      onAuth(data.user);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"85vh", display:"flex", alignItems:"center",
      justifyContent:"center", padding:"40px 24px" }}>
      <div className="auth-card fade-up">
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <Mascot pose="welcome" size={100} style={{ animation:"float 3s ease infinite" }} />
          <h1 style={{ fontFamily:"'Crimson Pro',serif", fontSize:28, fontStyle:"italic",
            fontWeight:600, marginTop:12, letterSpacing:"-0.02em", color:"var(--ink)" }}>
            {mode === "login" ? "Welcome back!" : "Create your account"}
          </h1>
          <p style={{ fontSize:13, color:"var(--muted)", marginTop:6 }}>
            {mode === "login" ? "Sign in to see your summaries" : "Free forever — takes 10 seconds"}
          </p>
        </div>
        <WavyLine />
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:8 }}>
          {mode === "signup" && (
            <input className="field" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />
          )}
          <input className="field" type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="field" type="password" placeholder="Password" value={password}
            onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} />
        </div>
        {error && <p style={{ marginTop:10, fontSize:13, color:"var(--terra)", textAlign:"center" }}>{error}</p>}
        <button onClick={submit} disabled={loading} style={{
          width:"100%", marginTop:20, padding:"13px", borderRadius:99, border:"none",
          cursor: loading?"not-allowed":"pointer", background:"var(--ink)", color:"var(--cream)",
          fontFamily:"'Crimson Pro',serif", fontSize:17, fontStyle:"italic",
          opacity: loading ? 0.6 : 1, transition:"all .2s",
        }}>
          {loading ? "One moment..." : mode === "login" ? "Sign in →" : "Get started →"}
        </button>
        <p style={{ textAlign:"center", marginTop:16, fontSize:13, color:"var(--muted)" }}>
          {mode === "login" ? "New here? " : "Already have an account? "}
          <button onClick={()=>{ setMode(mode==="login"?"signup":"login"); setError(null); }}
            style={{ background:"none", border:"none", cursor:"pointer", color:"var(--sage)", fontWeight:500, fontSize:13 }}>
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

/* ─── Upload page ─────────────────────────────────────────────────────────── */
function UploadPage({ onResult }) {
  const [files, setFiles]       = useState([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [procStep, setProcStep] = useState(0);
  const inputRef = useRef();
  const ALLOWED = ["application/pdf","image/png","image/jpeg","image/webp"];

  const addFiles = useCallback((incoming) => {
    const valid = Array.from(incoming).filter(f => ALLOWED.includes(f.type));
    if (valid.length < incoming.length) setError("Only PDF, JPG, PNG and WEBP files are supported.");
    else setError(null);
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      return [...prev, ...valid.filter(f => !names.has(f.name))];
    });
  }, []);

  const steps = [
    "Reading your notes now...",
    "Picking out the important bits...",
    "Thinking it through carefully...",
    "Putting the summary together...",
    "Almost ready, hang tight...",
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
    } catch(e) { clearInterval(iv); setError(e.message); }
    finally { setLoading(false); }
  };

  if (loading) return <ProcessingPage step={steps[procStep]} fileNames={files.map(f=>f.name)} />;

  return (
    <div style={{ maxWidth:720, margin:"0 auto", padding:"40px 24px 80px" }}>
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:-10 }}>
        <Mascot pose="idle" size={90} style={{ animation:"float 3s ease infinite" }} />
      </div>

      <div onClick={()=>inputRef.current?.click()}
        onDragOver={e=>{e.preventDefault();setDragging(true);}}
        onDragLeave={()=>setDragging(false)}
        onDrop={e=>{e.preventDefault();setDragging(false);addFiles(e.dataTransfer.files);}}
        className="fade-up"
        style={{
          border:`1.5px dashed ${dragging?"var(--sage)":"var(--border)"}`,
          borderRadius:16, padding:"52px 32px", textAlign:"center", cursor:"pointer",
          background: dragging ? "rgba(107,140,106,0.06)" : "rgba(250,247,242,0.4)",
          transition:"all .25s",
        }}>
        <input ref={inputRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp"
          style={{ display:"none" }} onChange={e=>addFiles(e.target.files)} />
        {files.length === 0 ? (
          <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:18, color:"var(--muted)", fontStyle:"italic" }}>
            Drop your notes here, or click to pick a file.
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
                  <button onClick={e=>{e.stopPropagation();setFiles(prev=>prev.filter(x=>x.name!==f.name));}}
                    style={{ background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:15 }}>×</button>
                </span>
              ))}
            </div>
            <p style={{ fontSize:13, color:"var(--muted)" }}>Click to add more files</p>
          </div>
        )}
      </div>

      {error && <p style={{ marginTop:10, fontSize:13, color:"var(--terra)", textAlign:"center" }}>{error}</p>}

      <div className="fade-up" style={{ animationDelay:".1s", display:"flex", justifyContent:"center", marginTop:24 }}>
        <button onClick={submit} disabled={!files.length} style={{
          fontFamily:"'Crimson Pro',serif", fontSize:18, fontStyle:"italic",
          padding:"11px 36px", borderRadius:99,
          border:"1.5px solid var(--ink)", background:"transparent",
          color:"var(--ink)", cursor: files.length?"pointer":"not-allowed",
          opacity: files.length ? 1 : 0.35, transition:"all .2s",
        }}
          onMouseEnter={e=>{if(files.length){e.target.style.background="var(--ink)";e.target.style.color="var(--cream)";}}}
          onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="var(--ink)";}}>
          Summarise →
        </button>
      </div>
      <p className="fade-up" style={{ animationDelay:".2s", textAlign:"center", marginTop:14,
        fontSize:12, color:"var(--muted)", letterSpacing:"0.03em" }}>
        PDF · JPG · PNG · WEBP · handwritten notes welcome
      </p>
    </div>
  );
}

/* ─── Processing page — fixed alignment ──────────────────────────────────── */
function ProcessingPage({ step, fileNames }) {
  return (
    <div style={{
      minHeight:"88vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", gap:24, padding:"40px 24px",
    }}>
      <Mascot pose="processing" size={160} style={{ animation:"readingBob 2.2s ease infinite" }} />

      <p key={step} style={{
        fontFamily:"'Crimson Pro',serif", fontSize:24, fontStyle:"italic",
        color:"var(--ink2)", textAlign:"center", lineHeight:1.45,
        animation:"fadeIn 0.45s ease both", maxWidth:340,
      }}>
        {step}
      </p>

      {/* Dots + underline — all centred in a flex column */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          {[
            { color:"#C4694A", delay:"0s" },
            { color:"#6B8C6A", delay:"0.18s" },
            { color:"#D4A843", delay:"0.36s" },
            { color:"#6B8CAE", delay:"0.54s" },
            { color:"#C4694A", delay:"0.72s" },
          ].map((b,i) => (
            <div key={i} style={{
              width:10, height:10, borderRadius:"50%",
              background:b.color, opacity:0.8,
              animation:"bubbleUp 1.1s ease infinite",
              animationDelay:b.delay,
            }} />
          ))}
        </div>
        <svg width="160" height="10" viewBox="0 0 160 10" style={{ display:"block" }}>
          <path d="M4 6 Q40 2 80 6 Q120 10 156 6" fill="none" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M4 6 Q40 2 80 6 Q120 10 156 6" fill="none" stroke="var(--sage)" strokeWidth="2"
            strokeLinecap="round" strokeDasharray="200"
            style={{ animation:"inkWrite 2.4s ease infinite" }} />
        </svg>
      </div>

      {fileNames?.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center" }}>
          {fileNames.map(n => (
            <span key={n} style={{ padding:"3px 14px", borderRadius:99,
              border:"1px solid var(--border)", fontSize:12, color:"var(--muted)" }}>{n}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Copy button ─────────────────────────────────────────────────────────── */
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={()=>{ navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
      style={{ background:"none", border:"1px solid var(--border)", borderRadius:8,
        padding:"5px 10px", cursor:"pointer", color:copied?"var(--sage)":"var(--muted)",
        fontSize:12, fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:5 }}>
      {copied
        ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Copied!</>
        : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>
      }
    </button>
  );
}

/* ─── PDF export — handwritten notebook style ────────────────────────────── */
function exportPDF(topic, raw) {
  const win = window.open("", "_blank");
  const clean = raw.replace(/[📚✅🔑🧠📝🎯\*#]/g,"").replace(/\n/g,"</p><p>");
  win.document.write(`<!DOCTYPE html><html><head>
    <title>${topic} — EasyLearn Notes</title>
    <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600&family=Patrick+Hand&display=swap" rel="stylesheet"/>
    <style>
      @page { margin:50px 65px; }
      * { box-sizing:border-box; }
      body {
        font-family:'Caveat',cursive;
        background:#FDFAF3;
        color:#1a3a6e;
        line-height:2.15;
        font-size:19px;
        margin:0;
        padding:24px 40px 48px;
        background-image: repeating-linear-gradient(
          transparent, transparent 34px, #b8cce4 34px, #b8cce4 35px
        );
        min-height:100vh;
      }
      .page-top {
        display:flex; justify-content:space-between; align-items:baseline;
        border-bottom:2px solid #1a3a6e; padding-bottom:10px; margin-bottom:4px;
      }
      h1 {
        font-family:'Caveat',cursive;
        font-size:34px; font-weight:600; color:#1a1a2e;
        margin:0; letter-spacing:-0.01em;
      }
      .date { font-family:'Patrick Hand',cursive; font-size:13px; color:#9ab5ce; }
      .label {
        font-family:'Patrick Hand',cursive; font-size:13px;
        letter-spacing:.1em; text-transform:uppercase;
        color:#7a9abf; margin:26px 0 6px; font-style:italic;
      }
      p { font-size:18px; margin-bottom:2px; color:#1a3a6e; }
      .brand {
        font-family:'Caveat',cursive; font-size:13px; color:#9ab5ce;
        margin-top:48px; text-align:right; font-style:italic;
      }
      .red-margin {
        position:fixed; top:0; bottom:0; left:88px;
        width:2px; background:#f9b3b3; pointer-events:none;
      }
      @media print { .red-margin { position:absolute; height:100%; } }
    </style>
  </head><body>
    <div class="red-margin"></div>
    <div class="page-top">
      <h1>${topic}</h1>
      <span class="date">${new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</span>
    </div>
    <div class="label">My Study Notes — EasyLearn 📓</div>
    <p>${clean}</p>
    <p class="brand">easylearn.local</p>
    <script>window.onload=()=>window.print();</script>
  </body></html>`);
  win.document.close();
}

/* ─── Quiz Generator ──────────────────────────────────────────────────────── */
function QuizPanel({ concepts, points }) {
  const buildQuestions = () => {
    const qs = [];
    concepts.slice(0,5).forEach(c => {
      if (!c.def) return;
      const distractors = concepts.filter(x=>x.term!==c.term&&x.def).map(x=>x.def).slice(0,3);
      while (distractors.length < 3) distractors.push("This term isn't covered in the notes.");
      const opts = [c.def, ...distractors].sort(()=>Math.random()-0.5);
      qs.push({ q:`What does "${c.term}" mean?`, answer:c.def, options:opts });
    });
    points.slice(0,4).forEach((p) => {
      qs.push({ q:`True or false: "${p.substring(0,85)}${p.length>85?"...":""}"`, answer:"True", options:["True","False"] });
    });
    return qs.slice(0,7);
  };

  const [questions]           = useState(buildQuestions);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore]     = useState(0);
  const [done, setDone]       = useState(false);

  if (!questions.length) return (
    <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:15, color:"var(--muted)", fontStyle:"italic" }}>
      Not enough content to build a quiz yet — make sure your summary has key concepts.
    </p>
  );

  if (done) return (
    <div className="pop-in" style={{ textAlign:"center", padding:"36px 0" }}>
      <Mascot pose="welcome" size={90} style={{ animation:"float 2s ease infinite", marginBottom:12 }} />
      <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:26, fontStyle:"italic", marginBottom:6, color:"var(--ink)" }}>
        Quiz complete!
      </p>
      <p style={{ fontSize:14, color:"var(--muted)", marginBottom:20 }}>
        You scored <strong style={{color:"var(--sage)"}}>{score}</strong> out of {questions.length} 🎉
      </p>
      <button onClick={()=>{ setScore(0); setCurrent(0); setSelected(null); setDone(false); }}
        style={{ fontFamily:"'Crimson Pro',serif", fontSize:15, fontStyle:"italic",
          padding:"9px 28px", borderRadius:99, border:"1px solid var(--border)",
          background:"transparent", color:"var(--ink)", cursor:"pointer" }}>
        Try again
      </button>
    </div>
  );

  const q = questions[current];

  const pick = (opt) => {
    if (selected) return;
    setSelected(opt);
    if (opt === q.answer) setScore(s=>s+1);
    setTimeout(() => {
      if (current+1 >= questions.length) setDone(true);
      else { setCurrent(c=>c+1); setSelected(null); }
    }, 1100);
  };

  const getClass = (opt) => {
    if (!selected) return "quiz-option";
    if (opt === q.answer) return "quiz-option correct";
    if (opt === selected) return "quiz-option wrong";
    return "quiz-option";
  };

  return (
    <div>
      {/* Progress bar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <span style={{ fontSize:12, color:"var(--muted)" }}>Question {current+1} of {questions.length}</span>
        <div style={{ flex:1, height:3, background:"var(--border)", borderRadius:99, margin:"0 14px" }}>
          <div style={{ height:"100%", background:"var(--yellow)", borderRadius:99,
            width:`${(current/questions.length)*100}%`, transition:"width .4s" }} />
        </div>
        <span style={{ fontSize:12, color:"var(--muted)" }}>Score: {score}</span>
      </div>

      <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:18, fontStyle:"italic",
        color:"var(--ink)", marginBottom:18, lineHeight:1.5 }}>{q.q}</p>

      {q.options.map((opt,i) => (
        <button key={i} className={getClass(opt)} onClick={()=>pick(opt)}>
          {opt}
        </button>
      ))}

      {selected && (
        <p style={{ marginTop:12, fontSize:13, color: selected===q.answer?"var(--sage)":"var(--terra)",
          fontFamily:"'DM Sans',sans-serif" }}>
          {selected===q.answer ? "✓ Correct! Well done." : `✗ The correct answer was: "${q.answer}"`}
        </p>
      )}
    </div>
  );
}

/* ─── AI Chatbot with idle.gif ────────────────────────────────────────────── */
function ChatBot({ summaryContext }) {
  const [open, setOpen]       = useState(false);
  const [msgs, setMsgs]       = useState([
    { role:"ai", text:"Hey! I've read your notes 📖 Ask me anything about them — or say /quiz to jump to the quiz!" }
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [msgs, open]);

  const smartReply = (text) => {
    const lower = text.toLowerCase().trim();
    const ctx = (summaryContext || "").replace(/[📚✅🔑🧠📝🎯]/g,"");
    const lines = ctx.split("\n").filter(l=>l.trim().length > 20);

    if (lower === "/quiz") return "Head to the 🎯 Quiz tab at the top of the page to test yourself!";
    if (lower.includes("hello") || lower === "hi" || lower === "hey")
      return "Hey there! 👋 I'm your study buddy. Ask me anything about what's in your notes!";

    const keywords = lower.replace(/what is|explain|define|tell me about|how does|why is/g,"").trim().split(/\s+/);
    const match = lines.find(l => keywords.some(k => k.length > 3 && l.toLowerCase().includes(k)));
    if (match) return `Based on your notes: "${match.trim()}"`;

    if (lower.includes("tip") || lower.includes("remember") || lower.includes("exam"))
      return "For your exam, focus on the Key Concepts panel on the right side of the page. Those are the most likely to come up. The quick tips section has some memory tricks too!";
    if (lower.includes("summary") || lower.includes("overview"))
      return lines[0] ? `Here's the gist: "${lines[0].trim()}"` : "Upload some notes and I'll give you a full summary!";

    return "Hmm, I'm not sure about that one. Try asking something more specific — like 'What is [concept name]?' or 'Explain [topic]'.";
  };

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMsgs(m => [...m, { role:"user", text }]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 600 + Math.random()*400));
    const reply = smartReply(text);
    setMsgs(m => [...m, { role:"ai", text: reply }]);
    setLoading(false);
  };

  return (
    <>
      {/* Floating idle mascot button */}
      <div style={{ position:"fixed", bottom:28, right:28, zIndex:200 }}>
        {!open && (
          <button onClick={()=>setOpen(true)} style={{
            width:62, height:62, borderRadius:"50%",
            background:"var(--paper)", border:"1.5px solid var(--border)",
            cursor:"pointer", padding:4,
            boxShadow:"0 4px 20px rgba(0,0,0,0.13)",
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"transform .2s, box-shadow .2s",
          }}
            onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.1)";e.currentTarget.style.boxShadow="0 6px 28px rgba(0,0,0,0.18)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.13)";}}>
            <img src={MASCOT.idle} alt="Study buddy" style={{ width:46, height:46, objectFit:"contain" }} />
          </button>
        )}
      </div>

      {/* Chat panel */}
      {open && (
        <div style={{
          position:"fixed", bottom:28, right:28, zIndex:200,
          width:336, height:470, display:"flex", flexDirection:"column",
          background:"var(--paper)", border:"1px solid var(--border)",
          borderRadius:20, boxShadow:"0 8px 40px rgba(0,0,0,0.15)",
          overflow:"hidden", animation:"fadeIn 0.2s ease both",
        }}>
          {/* Header */}
          <div style={{ padding:"13px 16px", borderBottom:"1px solid var(--border)",
            display:"flex", alignItems:"center", gap:10, background:"var(--cream2)", flexShrink:0 }}>
            <img src={MASCOT.idle} alt="bot" style={{ width:30, height:30, objectFit:"contain" }} />
            <div style={{ flex:1 }}>
              <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:15, fontWeight:600, color:"var(--ink)", marginBottom:1 }}>Study Buddy</p>
              <p style={{ fontSize:11, color:"var(--muted)" }}>Ask me about your notes</p>
            </div>
            <button onClick={()=>setOpen(false)} style={{ background:"none", border:"none",
              cursor:"pointer", fontSize:20, color:"var(--muted)", lineHeight:1, padding:"0 2px" }}>×</button>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"14px 13px 8px",
            display:"flex", flexDirection:"column", gap:10 }}>
            {msgs.map((m,i) => (
              <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start",
                alignItems:"flex-end", gap:7 }}>
                {m.role==="ai" && (
                  <img src={MASCOT.idle} alt="" style={{ width:22, height:22, objectFit:"contain", flexShrink:0, marginBottom:2 }} />
                )}
                <div className={m.role==="ai" ? "chat-bubble-ai" : "chat-bubble-user"}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:"flex", alignItems:"flex-end", gap:7 }}>
                <img src={MASCOT.processing} alt="" style={{ width:22, height:22, objectFit:"contain" }} />
                <div className="chat-bubble-ai">
                  <span style={{ display:"flex", gap:4, alignItems:"center" }}>
                    {[0,1,2].map(i=>(
                      <span key={i} style={{ width:6,height:6,borderRadius:"50%",background:"var(--muted)",
                        display:"inline-block", animation:"pulse 1.2s ease infinite",
                        animationDelay:`${i*0.2}s` }} />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding:"10px 12px", borderTop:"1px solid var(--border)",
            display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
            <input className="chat-input" placeholder="Ask something, or type /quiz"
              value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&send()} style={{ flex:1 }} />
            <button onClick={send} disabled={!input.trim()} style={{
              background:"var(--sage)", border:"none", borderRadius:"50%",
              width:32, height:32, cursor: input.trim()?"pointer":"not-allowed",
              display:"flex", alignItems:"center", justifyContent:"center",
              flexShrink:0, opacity: input.trim() ? 1 : 0.5, transition:"opacity .2s",
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Summary page ────────────────────────────────────────────────────────── */
function cleanRaw(text) {
  return text.split("").filter(c=>c.charCodeAt(0)<9000||c===" ").join("").replace(/\*\*/g,"").replace(/#{1,6} /g,"").trim();
}

function SummaryPage({ data, fileNames, onBack }) {
  const [fcIndex, setFcIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [fcKnow,  setFcKnow]  = useState(0);
  const [fcDone,  setFcDone]  = useState(false);
  const [tab, setTab]         = useState("summary");

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

  const cleanText = t => t.replace(/[📚✅🔑🧠📝🎯★✦✓•]/g,"").replace(/\*\*/g,"").replace(/#{1,6} /g,"").trim();
  const explanation = cleanText(parseSection("🧠"));
  const examSummary = cleanText(parseSection("📝"));
  const tips        = cleanText(parseSection("🎯"));

  const points = parseSection("✅").split("\n")
    .filter(l=>l.trim()).map(l=>l.replace(/^[-*•\d.]+\s*/,"").replace(/\*\*/g,"").trim()).filter(Boolean);

  const concepts = parseSection("🔑").split("\n")
    .filter(l=>l.trim()).map(l=>{
      const c = l.replace(/^[-*•\d.]+\s*/,"").replace(/\*\*/g,"");
      const p = c.split(/[:\-–]/);
      return { term:p[0]?.trim()||"", def:p.slice(1).join(":").trim()||"" };
    }).filter(c=>c.term);

  const flashcards = [
    ...concepts.filter(c=>c.def).map(c=>({ q:`What is "${c.term}"?`, a:c.def })),
    ...points.slice(0,6).map((p,i)=>({ q:`Explain key point ${i+1} in your own words.`, a:p })),
  ];

  const fcNext = (knew) => {
    if (knew) setFcKnow(k=>k+1);
    if (fcIndex+1 >= flashcards.length) { setFcDone(true); return; }
    setFcIndex(i=>i+1); setFlipped(false);
  };

  const SLabel = ({ text }) => (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
      <div style={{ width:16, height:1, background:"var(--border)" }} />
      <p style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em", textTransform:"uppercase",
        color:"var(--muted)", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>{text}</p>
      <div style={{ flex:1, height:1, background:"var(--border)" }} />
    </div>
  );

  return (
    <>
      <div className="fade-in" style={{ maxWidth:1060, margin:"0 auto",
        padding:"48px 32px 120px", display:"grid", gridTemplateColumns:"1fr 300px", gap:60 }}>

        {/* ── Left ── */}
        <div>
          {/* Back + export */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
            marginBottom:28, flexWrap:"wrap", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <button onClick={onBack} style={{ background:"none",border:"none",cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--muted)",padding:0 }}>
                ← New upload
              </button>
              {(fileNames||[]).map(n=>(
                <span key={n} style={{ fontSize:11,color:"var(--muted)",padding:"2px 8px",
                  borderRadius:99,border:"1px solid var(--border)" }}>{n}</span>
              ))}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <CopyBtn text={cleanRaw(raw)} />
              <button onClick={()=>exportPDF(topic,raw)} style={{
                background:"none",border:"1px solid var(--border)",borderRadius:8,
                padding:"5px 10px",cursor:"pointer",color:"var(--muted)",
                fontSize:12,fontFamily:"'DM Sans',sans-serif",
                display:"flex",alignItems:"center",gap:5,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Save as PDF
              </button>
            </div>
          </div>

          <h1 style={{ fontFamily:"'Crimson Pro',serif", fontSize:"clamp(28px,4vw,48px)",
            fontWeight:600, letterSpacing:"-0.03em", lineHeight:1.1, marginBottom:24, color:"var(--ink)" }}>
            {topic}
          </h1>

          {/* Tab switcher */}
          <div style={{ display:"flex", gap:4, marginBottom:32, background:"var(--cream2)",
            borderRadius:12, padding:4, width:"fit-content" }}>
            {[["summary","📖 Summary"],["quiz","🎯 Quiz me"]].map(([t,label]) => (
              <button key={t} onClick={()=>setTab(t)} style={{
                padding:"7px 20px", borderRadius:9, border:"none", cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500,
                background: tab===t ? "var(--paper)" : "transparent",
                color: tab===t ? "var(--ink)" : "var(--muted)",
                boxShadow: tab===t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition:"all .2s",
              }}>{label}</button>
            ))}
          </div>

          {tab === "quiz" ? (
            <QuizPanel concepts={concepts} points={points} />
          ) : (
            <>
              <SLabel text="Simple Explanation" />
              <div style={{ fontFamily:"'Crimson Pro',serif",fontSize:18,lineHeight:1.85,
                color:"var(--ink2)",fontWeight:300,marginBottom:8 }}>
                {explanation.split("\n\n").map((p,i)=><p key={i} style={{marginBottom:14}}>{p}</p>)}
              </div>
              <WavyLine />

              <SLabel text="Exam Summary" />
              <div style={{ fontFamily:"'Crimson Pro',serif",fontSize:18,lineHeight:1.85,
                color:"var(--ink2)",fontWeight:300,marginBottom:8 }}>
                {examSummary.split("\n\n").map((p,i)=><p key={i} style={{marginBottom:14}}>{p}</p>)}
              </div>
              <WavyLine />

              {tips && <>
                <SLabel text="Quick Tips" />
                <div style={{ marginBottom:8 }}>
                  {tips.split("\n").filter(l=>l.trim()).map((t,i)=>(
                    <div key={i} style={{ display:"flex",gap:10,marginBottom:12,alignItems:"flex-start" }}>
                      <span style={{ fontFamily:"'Crimson Pro',serif",fontSize:17,lineHeight:1.7,
                        color:"var(--ink2)",fontWeight:300 }}>
                        {t.replace(/^[-*•\d.★]+\s*/,"")}
                      </span>
                    </div>
                  ))}
                </div>
                <WavyLine />
              </>}

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

              <SLabel text="Review Cards" />
              {flashcards.length === 0
                ? <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:16,color:"var(--muted)",fontStyle:"italic" }}>No flashcards generated.</p>
                : fcDone ? (
                  <div className="pop-in" style={{ textAlign:"center",padding:"40px 0" }}>
                    <Mascot pose="welcome" size={100} style={{ animation:"float 2s ease infinite",marginBottom:12 }} />
                    <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:24,fontStyle:"italic",marginBottom:6,color:"var(--ink)" }}>All done!</p>
                    <p style={{ fontSize:14,color:"var(--muted)",marginBottom:20 }}>
                      {fcKnow} of {flashcards.length} cards marked as known
                    </p>
                    <button onClick={()=>{setFcIndex(0);setFlipped(false);setFcKnow(0);setFcDone(false);}}
                      style={{ fontFamily:"'Crimson Pro',serif",fontSize:15,fontStyle:"italic",
                        padding:"9px 28px",borderRadius:99,border:"1px solid var(--border)",
                        background:"transparent",color:"var(--ink)",cursor:"pointer" }}>
                      Go again
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
                      <span style={{ fontSize:12,color:"var(--muted)" }}>Card {fcIndex+1} of {flashcards.length}</span>
                      <div style={{ flex:1,height:3,background:"var(--border)",borderRadius:99,margin:"0 16px" }}>
                        <div style={{ height:"100%",background:"var(--sage)",borderRadius:99,
                          width:`${(fcIndex/flashcards.length)*100}%`,transition:"width .4s" }} />
                      </div>
                      <span style={{ fontSize:12,color:"var(--muted)" }}>{Math.round((fcIndex/flashcards.length)*100)}%</span>
                    </div>
                    <div className="fc-scene" onClick={()=>setFlipped(f=>!f)}>
                      <div className={flipped?"fc-inner is-flipped":"fc-inner"}>
                        <div className="fc-front">
                          <p style={{ fontSize:11,fontWeight:500,letterSpacing:"0.1em",textTransform:"uppercase",
                            color:"var(--muted)",fontFamily:"'DM Sans',sans-serif",marginBottom:20 }}>
                            Question {fcIndex+1}
                          </p>
                          <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:22,fontStyle:"italic",lineHeight:1.6,color:"var(--ink)" }}>
                            {flashcards[fcIndex].q}
                          </p>
                          <p style={{ marginTop:24,fontSize:11,color:"var(--muted)",fontFamily:"'DM Sans',sans-serif" }}>Tap to flip →</p>
                        </div>
                        <div className="fc-back">
                          <p style={{ fontSize:11,fontWeight:500,letterSpacing:"0.1em",textTransform:"uppercase",
                            color:"var(--muted)",fontFamily:"'DM Sans',sans-serif",marginBottom:20 }}>Answer</p>
                          <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:19,lineHeight:1.7,color:"var(--ink2)",fontWeight:300 }}>
                            {flashcards[fcIndex].a}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginTop:16 }}>
                      <button onClick={()=>fcNext(false)} style={{ background:"none",border:"1px solid var(--border)",borderRadius:10,
                        padding:"10px 22px",cursor:"pointer",color:"var(--terra)",fontFamily:"'DM Sans',sans-serif",fontSize:14 }}>Skip</button>
                      <button onClick={()=>setFlipped(f=>!f)} style={{ background:"none",border:"1px solid var(--border)",borderRadius:10,
                        padding:"10px 22px",cursor:"pointer",color:"var(--ink2)",fontFamily:"'DM Sans',sans-serif",fontSize:14 }}>Flip</button>
                      <button onClick={()=>fcNext(true)} style={{ background:"none",border:"1px solid rgba(107,140,106,0.4)",borderRadius:10,
                        padding:"10px 22px",cursor:"pointer",color:"var(--sage)",fontFamily:"'DM Sans',sans-serif",fontSize:14 }}>Got it ✓</button>
                    </div>
                  </div>
                )
              }
            </>
          )}
        </div>

        {/* ── Right — Key Concepts ── */}
        <div style={{ position:"sticky", top:80, alignSelf:"start" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
            <div style={{ width:16, height:1, background:"var(--border)" }} />
            <p style={{ fontSize:11, fontWeight:500, letterSpacing:"0.1em", textTransform:"uppercase",
              color:"var(--muted)", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>Key Concepts</p>
            <div style={{ flex:1, height:1, background:"var(--border)" }} />
          </div>
          {concepts.length === 0
            ? <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:15,color:"var(--muted)",fontStyle:"italic" }}>No concepts found.</p>
            : concepts.map((c,i)=>(
              <div key={i} className="fade-up" style={{ animationDelay:`${i*0.07}s`,
                paddingBottom:14,marginBottom:14,borderBottom:"1px solid var(--border)" }}>
                <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:17,fontWeight:600,color:"var(--ink)",marginBottom:4 }}>{c.term}</p>
                <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,lineHeight:1.65,color:"var(--ink2)",fontWeight:300 }}>{c.def}</p>
              </div>
            ))
          }
        </div>
      </div>

      <ChatBot summaryContext={raw} />
    </>
  );
}

/* ─── History page ────────────────────────────────────────────────────────── */
function HistoryPage({ onOpen }) {
  const history = JSON.parse(localStorage.getItem("el_history") || "[]");
  return (
    <div style={{ maxWidth:720, margin:"0 auto", padding:"56px 32px 100px" }}>
      <h1 style={{ fontFamily:"'Crimson Pro',serif",fontSize:38,fontWeight:600,
        fontStyle:"italic",letterSpacing:"-0.03em",marginBottom:40,color:"var(--ink)" }}>Past uploads</h1>
      {history.length === 0 ? (
        <div style={{ textAlign:"center",padding:"60px 0" }}>
          <Mascot pose="sleeping" size={160} />
          <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:22,fontStyle:"italic",
            color:"var(--muted)",marginTop:16 }}>Nothing here yet</p>
          <p style={{ fontSize:13,color:"var(--muted)",marginTop:8 }}>Upload something to get started</p>
        </div>
      ) : history.map((h,i) => (
        <div key={h.id||i} className="fade-up" style={{ animationDelay:`${i*0.05}s` }}>
          <div onClick={()=>onOpen(h)}
            style={{ display:"flex",alignItems:"baseline",justifyContent:"space-between",
              padding:"16px 0",cursor:"pointer",gap:16,transition:"padding-left .2s" }}
            onMouseEnter={e=>e.currentTarget.style.paddingLeft="8px"}
            onMouseLeave={e=>e.currentTarget.style.paddingLeft="0px"}>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:4 }}>
                {(h.fileNames||[]).map(n=>(
                  <span key={n} style={{ fontFamily:"'Crimson Pro',serif",fontSize:17,
                    fontWeight:600,color:"var(--ink)" }}>{n}</span>
                ))}
              </div>
              <p style={{ fontSize:13,color:"var(--muted)",overflow:"hidden",
                textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                {(h.summary||"").replace(/[📚✅🔑🧠📝🎯\*]/g,"").substring(0,90)}...
              </p>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:12,flexShrink:0 }}>
              <span style={{ fontSize:12,color:"var(--muted)" }}>{h.date}</span>
              <span style={{ fontFamily:"'Crimson Pro',serif",fontSize:16,color:"var(--muted)" }}>→</span>
            </div>
          </div>
          <WavyLine />
        </div>
      ))}
    </div>
  );
}

/* ─── About page ──────────────────────────────────────────────────────────── */
function AboutPage({ setPage }) {
  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"60px 32px 100px" }}>
      <div style={{ display:"flex",alignItems:"center",gap:24,marginBottom:40 }}>
        <Mascot pose="welcome" size={100} style={{ animation:"float 3.5s ease infinite",flexShrink:0 }} />
        <div>
          <h1 style={{ fontFamily:"'Crimson Pro',serif",fontSize:40,fontWeight:600,
            fontStyle:"italic",letterSpacing:"-0.03em",marginBottom:8,color:"var(--ink)" }}>
            Meet EasyLearn
          </h1>
          <p style={{ fontSize:14,color:"var(--muted)",lineHeight:1.6 }}>Your personal AI study companion</p>
        </div>
      </div>
      <WavyLine />
      <div style={{ marginBottom:36 }}>
        <p style={{ fontSize:11,fontWeight:500,letterSpacing:"0.1em",textTransform:"uppercase",
          color:"var(--muted)",marginBottom:14 }}>The story</p>
        <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:19,lineHeight:1.85,color:"var(--ink2)",fontWeight:300 }}>
          Studying is hard. Textbooks are dense. Notes get messy. And exam season always feels too short.
          EasyLearn was built to fix that — upload your notes and get back something you can actually
          understand and remember.
        </p>
      </div>
      <WavyLine />
      <div style={{ marginBottom:36 }}>
        <p style={{ fontSize:11,fontWeight:500,letterSpacing:"0.1em",textTransform:"uppercase",
          color:"var(--muted)",marginBottom:20 }}>How it works</p>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20 }}>
          {[
            { num:"01", title:"Upload", desc:"Drop any PDF, photo or handwritten notes." },
            { num:"02", title:"AI reads it", desc:"It extracts all the key information automatically." },
            { num:"03", title:"You learn", desc:"Get a clear summary, flashcards and a quiz." },
          ].map(s=>(
            <div key={s.num} style={{ padding:"20px",borderRadius:14,
              border:"1px solid var(--border)",background:"var(--paper)" }}>
              <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:26,fontStyle:"italic",
                color:"var(--border)",marginBottom:8 }}>{s.num}</p>
              <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:17,fontWeight:600,marginBottom:6,color:"var(--ink)" }}>{s.title}</p>
              <p style={{ fontSize:13,color:"var(--muted)",lineHeight:1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <WavyLine />
      <div style={{ marginBottom:36 }}>
        <p style={{ fontSize:11,fontWeight:500,letterSpacing:"0.1em",textTransform:"uppercase",
          color:"var(--muted)",marginBottom:14 }}>Under the hood</p>
        <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:18,lineHeight:1.85,color:"var(--ink2)",fontWeight:300 }}>
          Everything runs on your own machine. Your files never leave your computer.
          PDFs are read with pdfplumber, handwritten notes with Tesseract OCR, and
          summaries are generated by a local AI model running via Ollama.
          Your history is stored in a local MongoDB database.
        </p>
      </div>
      <WavyLine />
      <div style={{ textAlign:"center",paddingTop:16 }}>
        <p style={{ fontFamily:"'Crimson Pro',serif",fontSize:22,fontStyle:"italic",color:"var(--ink2)",marginBottom:20 }}>
          Ready to study smarter?
        </p>
        <button onClick={()=>setPage("upload")} style={{
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
  const [page,         setPage]        = useState(()=>localStorage.getItem("el_user")?"upload":"login");
  const [user,         setUser]        = useState(()=>JSON.parse(localStorage.getItem("el_user")||"null"));
  const [summaryData,  setSummaryData] = useState(null);
  const [summaryFiles, setSummaryFiles]= useState([]);
  const [dark,         toggleDark]     = useDarkMode();

  const handleAuth   = u => { setUser(u); setPage("upload"); };
  const handleLogout = () => {
    localStorage.removeItem("el_token"); localStorage.removeItem("el_user");
    setUser(null); setPage("login");
  };
  const handleResult = (data, fileNames) => {
    const entry = {
      id:Date.now(), fileNames, summary:data.summary,
      date:new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}),
    };
    const history = JSON.parse(localStorage.getItem("el_history")||"[]");
    history.unshift(entry);
    localStorage.setItem("el_history", JSON.stringify(history.slice(0,50)));
    setSummaryData(data); setSummaryFiles(fileNames); setPage("summary");
  };
  const handleOpenHistory = h => {
    setSummaryData({summary:h.summary}); setSummaryFiles(h.fileNames||[]); setPage("summary");
  };

  return (
    <>
      <GlobalStyle dark={dark} />
      <div style={{ position:"relative", zIndex:1, minHeight:"100vh" }}>
        <Navbar page={page} setPage={setPage} user={user} onLogout={handleLogout} dark={dark} onToggleDark={toggleDark} />
        {page==="login"   && <AuthPage onAuth={handleAuth} />}
        {page==="upload"  && <UploadPage onResult={handleResult} user={user} />}
        {page==="summary" && <SummaryPage data={summaryData} fileNames={summaryFiles} onBack={()=>setPage("upload")} />}
        {page==="history" && <HistoryPage onOpen={handleOpenHistory} />}
        {page==="about"   && <AboutPage setPage={setPage} />}
      </div>
    </>
  );
}