import { useState, useRef, useCallback, useEffect } from "react";

const API = "http://127.0.0.1:8000/api/v1";

const MASCOT = {
  idle:       "/mascot/idle.gif",
  welcome:    "/mascot/welcome.gif",
  sleeping:   "/mascot/sleeping.png",
  confused:   "/mascot/confused.gif",
  processing: "/mascot/processing.gif",
};
function Mascot({ pose = "idle", size = 120, style = {} }) {
  return <img src={MASCOT[pose]} alt={pose} style={{ width:size, height:size, objectFit:"contain", ...style }} />;
}

function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem("el_dark") === "true");
  const toggle = () => setDark(d => { localStorage.setItem("el_dark", String(!d)); return !d; });
  return [dark, toggle];
}

const GlobalStyle = ({ dark }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    :root {
      --cream:  ${dark ? "#0D0F1A" : "#F4EDE0"};
      --cream2: ${dark ? "#161929" : "#EDE3D0"};
      --paper:  ${dark ? "#1C2035" : "#FDFAF4"};
      --paper2: ${dark ? "#222740" : "#F8F3EA"};
      --ink:    ${dark ? "#E8E6F0" : "#1E1A12"};
      --ink2:   ${dark ? "#9E9BB8" : "#4A3F2E"};
      --muted:  ${dark ? "#575A7B" : "#8A7B68"};
      --border: ${dark ? "#252845" : "#D6CAB4"};
      --terra:  ${dark ? "#D4846A" : "#B85C3A"};
      --sage:   ${dark ? "#6BAA6A" : "#4E7A4C"};
      --dusty:  ${dark ? "#6898C4" : "#4A7EA8"};
      --yellow: ${dark ? "#D4A840" : "#C08820"};
      --accent: ${dark ? "#7B6FD0" : "#5A4FCF"};
      --nav-bg: ${dark ? "rgba(13,15,26,0.94)" : "rgba(244,237,224,0.94)"};
    }
    html { scroll-behavior:smooth; }
    body {
      font-family:'DM Sans',sans-serif;
      color:var(--ink);
      min-height:100vh;
      -webkit-font-smoothing:antialiased;
      transition: background-color 0.5s ease;
      ${dark ? `
        background-color: #0D0F1A;
        background-image:
          radial-gradient(ellipse 80% 55% at 12% 0%,   rgba(74,58,140,0.30) 0%, transparent 58%),
          radial-gradient(ellipse 60% 50% at 90% 8%,   rgba(38,78,160,0.22) 0%, transparent 55%),
          radial-gradient(ellipse 50% 65% at 0%  82%,  rgba(28,58,130,0.20) 0%, transparent 52%),
          radial-gradient(ellipse 70% 48% at 100% 90%, rgba(58,38,118,0.18) 0%, transparent 50%);
        background-attachment:fixed;
      ` : `
        background-color: #F4EDE0;
        background-image:
          radial-gradient(ellipse 68% 52% at 4%   7%,  rgba(184,92,58,0.18)  0%, transparent 55%),
          radial-gradient(ellipse 58% 44% at 96%  5%,  rgba(192,136,32,0.14) 0%, transparent 50%),
          radial-gradient(ellipse 52% 62% at 2%   90%, rgba(78,122,76,0.14)  0%, transparent 52%),
          radial-gradient(ellipse 62% 44% at 98%  90%, rgba(184,92,58,0.12)  0%, transparent 48%),
          radial-gradient(ellipse 48% 48% at 50%  44%, rgba(248,243,234,0.72) 0%, transparent 65%);
        background-attachment:fixed;
      `}
    }
    ::selection { background:${dark ? "rgba(123,111,208,0.35)" : "rgba(78,122,76,0.22)"}; }
    ::-webkit-scrollbar { width:4px; }
    ::-webkit-scrollbar-track { background:transparent; }
    ::-webkit-scrollbar-thumb { background:var(--border); border-radius:99px; }

    @keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
    @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
    @keyframes popIn     { 0%{transform:scale(0.94);opacity:0} 60%{transform:scale(1.02)} 100%{transform:scale(1);opacity:1} }
    @keyframes chatSlide { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse     { 0%,100%{opacity:0.25} 50%{opacity:1} }
    @keyframes spin      { to{transform:rotate(360deg)} }
    @keyframes orbitA    { from{transform:rotate(0deg)   translateX(38px) rotate(0deg)}   to{transform:rotate(360deg)  translateX(38px) rotate(-360deg)} }
    @keyframes orbitB    { from{transform:rotate(120deg) translateX(26px) rotate(-120deg)} to{transform:rotate(480deg) translateX(26px) rotate(-480deg)} }
    @keyframes orbitC    { from{transform:rotate(240deg) translateX(16px) rotate(-240deg)} to{transform:rotate(600deg) translateX(16px) rotate(-600deg)} }

    .fade-up { animation:fadeUp  0.5s cubic-bezier(.22,1,.36,1) both; }
    .fade-in { animation:fadeIn  0.3s ease both; }
    .pop-in  { animation:popIn   0.4s cubic-bezier(.22,1,.36,1) both; }

    .wavy-divider { width:100%; overflow:visible; margin:28px 0; }
    .wavy-path { fill:none; stroke:var(--border); stroke-width:1; stroke-linecap:round; }

    .field {
      width:100%; padding:11px 16px; border:1.5px solid var(--border);
      border-radius:10px; background:var(--paper);
      font-family:'DM Sans',sans-serif; font-size:14px; color:var(--ink);
      outline:none; transition:border-color .2s, box-shadow .2s;
    }
    .field:focus { border-color:var(--sage); box-shadow:0 0 0 3px ${dark ? "rgba(107,170,106,0.15)" : "rgba(78,122,76,0.12)"}; }
    .field::placeholder { color:var(--muted); }

    .auth-card { background:var(--paper); border:1.5px solid var(--border); border-radius:20px; padding:40px 36px; width:100%; max-width:400px; }

    .fc-scene { perspective:1000px; width:100%; height:280px; cursor:pointer; margin-bottom:20px; }
    .fc-inner { position:relative; width:100%; height:100%; transition:transform 0.6s cubic-bezier(0.4,0.2,0.2,1); transform-style:preserve-3d; }
    .fc-inner.is-flipped { transform:rotateY(180deg); }
    .fc-front, .fc-back {
      position:absolute; width:100%; height:100%; backface-visibility:hidden;
      border-radius:16px; display:flex; flex-direction:column;
      align-items:center; justify-content:center; padding:32px; text-align:center;
    }
    .fc-front { background:var(--paper); border:1.5px solid var(--border); }
    .fc-back  { background:var(--paper2); border:1.5px solid var(--border); transform:rotateY(180deg); }

    .chat-bubble-ai {
      background:var(--paper); border:1px solid var(--border);
      border-radius:16px 16px 16px 4px; padding:10px 14px;
      font-size:13px; color:var(--ink); line-height:1.65;
      animation:chatSlide 0.25s ease both; max-width:88%;
    }
    .chat-bubble-user {
      background:var(--sage); border-radius:16px 16px 4px 16px;
      padding:10px 14px; font-size:13px; color:#fff; line-height:1.6;
      animation:chatSlide 0.25s ease both; max-width:82%; align-self:flex-end;
    }
    .chat-input {
      width:100%; padding:10px 16px; border:1.5px solid var(--border);
      border-radius:99px; background:var(--paper);
      font-family:'DM Sans',sans-serif; font-size:13px; color:var(--ink);
      outline:none; transition:border-color .2s;
    }
    .chat-input:focus { border-color:var(--sage); }
    .chat-input::placeholder { color:var(--muted); }

    .quiz-opt {
      width:100%; text-align:left; padding:12px 18px; margin-bottom:8px;
      border:1.5px solid var(--border); border-radius:10px;
      background:var(--paper); color:var(--ink);
      font-family:'DM Sans',sans-serif; font-size:14px;
      cursor:pointer; transition:all .18s; display:block;
    }
    .quiz-opt:hover:not(:disabled) { border-color:var(--sage); background:var(--paper2); }
    .quiz-opt.correct { border-color:var(--sage); background:${dark ? "rgba(107,170,106,0.15)" : "rgba(78,122,76,0.10)"}; color:var(--sage); }
    .quiz-opt.wrong   { border-color:var(--terra); background:${dark ? "rgba(212,132,106,0.12)" : "rgba(184,92,58,0.08)"}; color:var(--terra); }
  `}</style>
);

const WavyLine = () => (
  <svg className="wavy-divider" height="16" viewBox="0 0 700 16" preserveAspectRatio="none">
    <path className="wavy-path" d="M0 8 C58 3,116 13,175 8 C233 3,291 13,350 8 C408 3,466 13,525 8 C583 3,641 13,700 8"/>
  </svg>
);

const STag = ({ children }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
    <div style={{ width:16, height:1, background:"var(--border)", flexShrink:0 }} />
    <span style={{ fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase",
      color:"var(--muted)", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>{children}</span>
    <div style={{ flex:1, height:1, background:"var(--border)" }} />
  </div>
);

function DarkToggle({ dark, onToggle }) {
  return (
    <button onClick={onToggle} title={dark ? "Light mode" : "Dark mode"} style={{
      width:36, height:20, borderRadius:99, cursor:"pointer",
      border:"none", padding:2, transition:"background .3s",
      background: dark ? "var(--accent)" : "var(--border)",
      position:"relative", flexShrink:0,
    }}>
      <span style={{
        position:"absolute", top:2, width:16, height:16, borderRadius:"50%",
        background:"#fff", transition:"left .3s cubic-bezier(.4,0,.2,1)",
        left: dark ? "calc(100% - 18px)" : "2px",
        boxShadow:"0 1px 4px rgba(0,0,0,0.25)",
      }} />
    </button>
  );
}

function Navbar({ page, setPage, user, onLogout, dark, onToggleDark }) {
  return (
    <nav style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"14px 48px", position:"sticky", top:0, zIndex:100,
      backdropFilter:"blur(18px)", WebkitBackdropFilter:"blur(18px)",
      backgroundColor:"var(--nav-bg)", borderBottom:"1px solid var(--border)",
    }}>
      <div onClick={() => setPage(user ? "upload" : "login")}
        style={{ fontFamily:"'Crimson Pro',serif", fontSize:22, fontStyle:"italic",
          fontWeight:600, letterSpacing:"-0.02em", cursor:"pointer", color:"var(--ink)", userSelect:"none" }}>
        EasyLearn
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:24 }}>
        {user && ["upload","history","about"].map(p => (
          <button key={p} onClick={() => setPage(p)} style={{
            background:"none", border:"none", cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500,
            color: page===p ? "var(--ink)" : "var(--muted)",
            textTransform:"capitalize", position:"relative", padding:"4px 0", transition:"color .2s",
          }}>
            {p}
            {page===p && <span style={{ position:"absolute", bottom:-1, left:0, right:0,
              height:1.5, background:"var(--ink)", borderRadius:99 }} />}
          </button>
        ))}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:11, color:"var(--muted)" }}>{dark ? "Dark" : "Light"}</span>
          <DarkToggle dark={dark} onToggle={onToggleDark} />
        </div>
        {user ? (
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:13, color:"var(--muted)" }}>Hi, {user.name.split(" ")[0]}</span>
            <button onClick={onLogout} style={{
              background:"none", border:"1.5px solid var(--border)", cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"var(--muted)",
              padding:"4px 12px", borderRadius:8, transition:"all .2s",
            }}>Sign out</button>
          </div>
        ) : (
          <button onClick={() => setPage("login")} style={{
            background:"var(--ink)", border:"none", cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500,
            color:"var(--cream)", padding:"7px 18px", borderRadius:8,
          }}>Sign in</button>
        )}
      </div>
    </nav>
  );
}

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
      const res = await fetch(`${API}${mode==="login"?"/auth/login":"/auth/signup"}`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify(mode==="login"?{email,password}:{name,email,password}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail||"Something went wrong");
      localStorage.setItem("el_token", data.token);
      localStorage.setItem("el_user", JSON.stringify(data.user));
      onAuth(data.user);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"86vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 24px" }}>
      <div className="auth-card fade-up">
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <h1 style={{ fontFamily:"'Crimson Pro',serif", fontSize:26, fontStyle:"italic",
            fontWeight:600, color:"var(--ink)", letterSpacing:"-0.02em" }}>
            {mode==="login" ? "Welcome back" : "Create your account"}
          </h1>
          <p style={{ fontSize:13, color:"var(--muted)", marginTop:6 }}>
            {mode==="login" ? "Sign in to access your summaries" : "Free — takes under a minute"}
          </p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {mode==="signup" && <input className="field" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />}
          <input className="field" type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="field" type="password" placeholder="Password" value={password}
            onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} />
        </div>
        {error && <p style={{ marginTop:10, fontSize:13, color:"var(--terra)", textAlign:"center" }}>{error}</p>}
        <button onClick={submit} disabled={loading} style={{
          width:"100%", marginTop:18, padding:"12px", borderRadius:10, border:"none",
          cursor:loading?"not-allowed":"pointer", background:"var(--ink)", color:"var(--cream)",
          fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:500, opacity:loading?0.6:1, transition:"all .2s",
        }}>
          {loading ? "Please wait…" : mode==="login" ? "Sign in" : "Get started"}
        </button>
        <p style={{ textAlign:"center", marginTop:16, fontSize:13, color:"var(--muted)" }}>
          {mode==="login" ? "No account? " : "Already registered? "}
          <button onClick={()=>{setMode(mode==="login"?"signup":"login");setError(null);}}
            style={{ background:"none", border:"none", cursor:"pointer", color:"var(--sage)", fontWeight:600, fontSize:13 }}>
            {mode==="login" ? "Sign up free" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

function UploadPage({ onResult }) {
  const [files, setFiles]       = useState([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [procStep, setProcStep] = useState(0);
  const inputRef = useRef();
  const ALLOWED = ["application/pdf","image/png","image/jpeg","image/webp"];

  const addFiles = useCallback((incoming) => {
    const valid = Array.from(incoming).filter(f=>ALLOWED.includes(f.type));
    if (valid.length < incoming.length) setError("Only PDF, JPG, PNG and WEBP are supported.");
    else setError(null);
    setFiles(prev => { const n = new Set(prev.map(f=>f.name)); return [...prev, ...valid.filter(f=>!n.has(f.name))]; });
  }, []);

  const steps = [
    "Reading your file…",
    "Extracting the key content…",
    "Structuring the summary…",
    "Building your flashcards…",
    "Almost done…",
  ];

  const submit = async () => {
    if (!files.length) return;
    setLoading(true); setError(null);
    let si = 0; setProcStep(0);
    const iv = setInterval(() => { si = Math.min(si+1,steps.length-1); setProcStep(si); }, 5000);
    try {
      const fd = new FormData();
      files.forEach(f=>fd.append("files",f));
      const token = localStorage.getItem("el_token");
      const res = await fetch(`${API}/upload`, {
        method:"POST", body:fd,
        headers:token?{"Authorization":`Bearer ${token}`}:{},
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail||"Upload failed"); }
      const data = await res.json();
      clearInterval(iv);
      onResult(data, files.map(f=>f.name));
      setFiles([]);
    } catch(e) { clearInterval(iv); setError(e.message); }
    finally { setLoading(false); }
  };

  if (loading) return <ProcessingPage step={steps[procStep]} stepIdx={procStep} totalSteps={steps.length} fileNames={files.map(f=>f.name)} />;

  return (
    <div style={{ maxWidth:600, margin:"0 auto", padding:"64px 24px 80px" }}>
      <div className="fade-up" style={{ marginBottom:36 }}>
        <h1 style={{ fontFamily:"'Crimson Pro',serif", fontSize:"clamp(26px,4vw,40px)",
          fontWeight:600, fontStyle:"italic", letterSpacing:"-0.03em", color:"var(--ink)", marginBottom:8 }}>
          Upload your notes
        </h1>
        <p style={{ fontSize:14, color:"var(--muted)", lineHeight:1.6 }}>
          Drop a PDF, photo or scan — Ducky will read everything and build your summary.
        </p>
      </div>

      <div onClick={()=>inputRef.current?.click()}
        onDragOver={e=>{e.preventDefault();setDragging(true);}}
        onDragLeave={()=>setDragging(false)}
        onDrop={e=>{e.preventDefault();setDragging(false);addFiles(e.dataTransfer.files);}}
        className="fade-up"
        style={{
          border:`2px dashed ${dragging?"var(--sage)":"var(--border)"}`,
          borderRadius:16, padding:"52px 32px", textAlign:"center", cursor:"pointer",
          background:dragging?"rgba(78,122,76,0.06)":"rgba(253,250,244,0.45)",
          transition:"all .2s",
        }}>
        <input ref={inputRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp"
          style={{display:"none"}} onChange={e=>addFiles(e.target.files)} />
        {files.length===0 ? (
          <>
            <div style={{ width:44, height:44, margin:"0 auto 14px",
              background:"var(--paper2)", border:"1.5px solid var(--border)",
              borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"var(--muted)" }}>
              Drop files here or <span style={{color:"var(--sage)",fontWeight:500}}>click to browse</span>
            </p>
            <p style={{ fontSize:12, color:"var(--muted)", marginTop:6, opacity:0.7 }}>PDF · JPG · PNG · WEBP</p>
          </>
        ) : (
          <div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", marginBottom:12 }}>
              {files.map(f => (
                <span key={f.name} style={{
                  display:"inline-flex", alignItems:"center", gap:6, padding:"5px 12px",
                  borderRadius:8, border:"1.5px solid var(--border)", background:"var(--paper)",
                  fontSize:12, color:"var(--ink2)",
                }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", flexShrink:0,
                    background:f.type==="application/pdf"?"var(--terra)":"var(--dusty)" }} />
                  {f.name}
                  <button onClick={e=>{e.stopPropagation();setFiles(p=>p.filter(x=>x.name!==f.name));}}
                    style={{background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:16,lineHeight:1,padding:0}}>×</button>
                </span>
              ))}
            </div>
            <p style={{ fontSize:12, color:"var(--muted)" }}>Click to add more files</p>
          </div>
        )}
      </div>

      {error && <p style={{ marginTop:10, fontSize:13, color:"var(--terra)", textAlign:"center" }}>{error}</p>}

      <div style={{ display:"flex", justifyContent:"center", marginTop:24 }}>
        <button onClick={submit} disabled={!files.length} style={{
          fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600,
          padding:"12px 40px", borderRadius:10,
          background:files.length?"var(--ink)":"var(--border)",
          border:"none", color:files.length?"var(--cream)":"var(--muted)",
          cursor:files.length?"pointer":"not-allowed", transition:"all .2s",
        }}>
          Summarise →
        </button>
      </div>
    </div>
  );
}

function ProcessingPage({ step, stepIdx, totalSteps, fileNames }) {
  return (
    <div style={{ minHeight:"88vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", gap:32, padding:"40px 24px" }}>

      <div style={{ position:"relative", width:96, height:96 }}>
        <div style={{ position:"absolute", top:"50%", left:"50%",
          transform:"translate(-50%,-50%)", width:14, height:14,
          borderRadius:"50%", background:"var(--sage)", opacity:0.9 }} />
        <svg width="96" height="96" style={{ position:"absolute", top:0, left:0 }}>
          <circle cx="48" cy="48" r="40" fill="none" stroke="var(--border)" strokeWidth="1" />
          <circle cx="48" cy="48" r="40" fill="none" stroke="var(--sage)" strokeWidth="1.5"
            strokeDasharray="55 196" strokeLinecap="round"
            style={{ animation:"spin 2s linear infinite", transformOrigin:"48px 48px" }} />
        </svg>
        <div style={{ position:"absolute", top:"50%", left:"50%", marginTop:-5, marginLeft:-5,
          width:10, height:10, borderRadius:"50%", background:"var(--terra)",
          animation:"orbitA 2s linear infinite" }} />
        <div style={{ position:"absolute", top:"50%", left:"50%", marginTop:-4, marginLeft:-4,
          width:8, height:8, borderRadius:"50%", background:"var(--yellow)",
          animation:"orbitB 1.5s linear infinite" }} />
        <div style={{ position:"absolute", top:"50%", left:"50%", marginTop:-3, marginLeft:-3,
          width:6, height:6, borderRadius:"50%", background:"var(--dusty)",
          animation:"orbitC 1s linear infinite" }} />
      </div>

      <div style={{ textAlign:"center", maxWidth:300 }}>
        <p key={step} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:500,
          color:"var(--ink)", marginBottom:16, animation:"fadeIn 0.4s ease both" }}>{step}</p>
        <div style={{ display:"flex", gap:6, justifyContent:"center" }}>
          {Array.from({length:totalSteps}).map((_,i) => (
            <div key={i} style={{
              width: i===stepIdx ? 20 : 6, height:6, borderRadius:99,
              background: i===stepIdx ? "var(--sage)" : "var(--border)",
              transition:"all .4s cubic-bezier(.22,1,.36,1)",
            }} />
          ))}
        </div>
      </div>

      {fileNames?.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center" }}>
          {fileNames.map(n => (
            <span key={n} style={{ padding:"3px 12px", borderRadius:6,
              border:"1px solid var(--border)", fontSize:11, color:"var(--muted)" }}>{n}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={()=>{navigator.clipboard.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
      style={{ background:"none", border:"1.5px solid var(--border)", borderRadius:8,
        padding:"5px 12px", cursor:"pointer", color:copied?"var(--sage)":"var(--muted)",
        fontSize:12, fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:5 }}>
      {copied
        ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Copied</>
        : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>
      }
    </button>
  );
}

function exportPDF(topic, raw) {
  const win = window.open("", "_blank");
  const clean = raw.replace(/[📚✅🔑🧠📝🎯\*#]/g,"").replace(/\n/g,"</p><p>");
  win.document.write(`<!DOCTYPE html><html><head>
    <title>${topic} — EasyLearn Notes</title>
    <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600&family=Patrick+Hand&display=swap" rel="stylesheet"/>
    <style>
      @page{margin:50px 65px;}
      body{font-family:'Caveat',cursive;background:#FDFAF3;color:#1a3a6e;line-height:2.15;font-size:19px;margin:0;padding:24px 40px 48px;
        background-image:repeating-linear-gradient(transparent,transparent 34px,#b8cce4 34px,#b8cce4 35px);}
      .top{display:flex;justify-content:space-between;align-items:baseline;border-bottom:2px solid #1a3a6e;padding-bottom:10px;margin-bottom:4px;}
      h1{font-family:'Caveat',cursive;font-size:34px;font-weight:600;color:#1a1a2e;margin:0;}
      .date{font-family:'Patrick Hand',cursive;font-size:13px;color:#9ab5ce;}
      .label{font-family:'Patrick Hand',cursive;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#7a9abf;margin:26px 0 6px;font-style:italic;}
      p{font-size:18px;margin-bottom:2px;color:#1a3a6e;}
      .brand{font-family:'Caveat',cursive;font-size:13px;color:#9ab5ce;margin-top:48px;text-align:right;font-style:italic;}
      .ml{position:fixed;top:0;bottom:0;left:88px;width:2px;background:#f9b3b3;pointer-events:none;}
    </style>
  </head><body>
    <div class="ml"></div>
    <div class="top"><h1>${topic}</h1><span class="date">${new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</span></div>
    <div class="label">EasyLearn Study Notes</div>
    <p>${clean}</p>
    <p class="brand">easylearn.local</p>
    <script>window.onload=()=>window.print();</script>
  </body></html>`);
  win.document.close();
}

function QuizInline({ concepts, points, onClose }) {
  const buildQ = () => {
    const qs = [];
    concepts.slice(0,5).forEach(c => {
      if (!c.def) return;
      const d = concepts.filter(x=>x.term!==c.term&&x.def).map(x=>x.def).slice(0,3);
      while(d.length<3) d.push("Not covered in these notes.");
      qs.push({ q:`What does "${c.term}" mean?`, answer:c.def, options:[c.def,...d].sort(()=>Math.random()-0.5) });
    });
    points.slice(0,3).forEach(p => {
      qs.push({ q:`True or false: "${p.substring(0,72)}${p.length>72?"...":""}"`, answer:"True", options:["True","False"] });
    });
    return qs.slice(0,6);
  };

  const [questions]             = useState(buildQ);
  const [current, setCurrent]   = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore]       = useState(0);
  const [done, setDone]         = useState(false);

  if (!questions.length) return (
    <div style={{padding:"8px 0"}}>
      <p style={{fontSize:13,color:"var(--muted)",marginBottom:10}}>Not enough content for a quiz yet.</p>
      <button onClick={onClose} style={{fontSize:12,color:"var(--sage)",background:"none",border:"none",cursor:"pointer",padding:0}}>← Back to chat</button>
    </div>
  );

  if (done) return (
    <div style={{textAlign:"center",padding:"12px 0"}}>
      <p style={{fontSize:15,fontWeight:600,color:"var(--ink)",marginBottom:4}}>Quiz complete!</p>
      <p style={{fontSize:13,color:"var(--muted)",marginBottom:14}}>Score: <strong style={{color:"var(--sage)"}}>{score}/{questions.length}</strong></p>
      <div style={{display:"flex",gap:8,justifyContent:"center"}}>
        <button onClick={()=>{setScore(0);setCurrent(0);setSelected(null);setDone(false);}}
          style={{fontSize:12,padding:"6px 14px",borderRadius:8,border:"1.5px solid var(--border)",background:"none",color:"var(--ink)",cursor:"pointer"}}>Retry</button>
        <button onClick={onClose}
          style={{fontSize:12,padding:"6px 14px",borderRadius:8,border:"none",background:"var(--sage)",color:"#fff",cursor:"pointer"}}>← Chat</button>
      </div>
    </div>
  );

  const q = questions[current];
  const pick = (opt) => {
    if (selected) return;
    setSelected(opt);
    if (opt===q.answer) setScore(s=>s+1);
    setTimeout(() => {
      if (current+1>=questions.length) setDone(true);
      else { setCurrent(c=>c+1); setSelected(null); }
    }, 900);
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{fontSize:11,color:"var(--muted)"}}>Q{current+1}/{questions.length} · {score} correct</span>
        <button onClick={onClose} style={{fontSize:11,color:"var(--muted)",background:"none",border:"none",cursor:"pointer"}}>← Chat</button>
      </div>
      <div style={{height:3,background:"var(--border)",borderRadius:99,marginBottom:12}}>
        <div style={{height:"100%",background:"var(--sage)",borderRadius:99,width:`${(current/questions.length)*100}%`,transition:"width .4s"}} />
      </div>
      <p style={{fontSize:13,fontWeight:500,color:"var(--ink)",marginBottom:10,lineHeight:1.5}}>{q.q}</p>
      {q.options.map((opt,i) => {
        let cls = "quiz-opt";
        if (selected) { if (opt===q.answer) cls+=" correct"; else if (opt===selected) cls+=" wrong"; }
        return <button key={i} className={cls} onClick={()=>pick(opt)} disabled={!!selected}>{opt}</button>;
      })}
      {selected && (
        <p style={{marginTop:8,fontSize:12,color:selected===q.answer?"var(--sage)":"var(--terra)"}}>
          {selected===q.answer ? "✓ Correct" : `✗ Answer: ${q.answer}`}
        </p>
      )}
    </div>
  );
}

function ChatBot({ summaryContext, concepts, points }) {
  const [open, setOpen]     = useState(false);
  const [mode, setMode]     = useState("chat");
  const [msgs, setMsgs]     = useState([
    { role:"ai", text:"Hi! I'm Ducky 🐣\nAsk me anything about your notes, or type /quiz to test yourself." }
  ]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs, open, mode]);

  const getReply = (text) => {
    const q = text.toLowerCase().trim();
    const raw = (summaryContext||"").replace(/[📚✅🔑🧠📝🎯]/g,"");
    const lines = raw.split("\n").filter(l=>l.trim().length>20);

    if (q==="/quiz") { setMode("quiz"); return null; }
    if (["hi","hello","hey"].includes(q)) return "Hey! Ask me about any term or topic in your notes and I'll explain it clearly.";
    if (q==="help"||q.includes("what can you do")) return "You can ask me:\n• What is [term]?\n• Explain [concept]\n• What should I know for the exam?\n• /quiz — start a quiz";

    const concept = concepts.find(c => q.includes(c.term.toLowerCase()));
    if (concept?.def) return `${concept.term}: ${concept.def}`;

    const keywords = q.replace(/what is|what are|explain|define|how does|how do|why|tell me about/g,"").trim().split(/\s+/).filter(k=>k.length>3);
    const match = lines.find(l => keywords.some(k=>l.toLowerCase().includes(k)));
    if (match) return match.trim();

    if (q.includes("exam")||q.includes("test")||q.includes("revision"))
      return "For the exam: check the Key Concepts sidebar on the right. Those are the most important terms. Type /quiz to test yourself.";
    if (q.includes("summary")||q.includes("overview")||q.includes("topic"))
      return lines[0] ? lines[0].trim() : "Upload notes first and I'll summarise them.";

    return "I couldn't find that in your notes. Try asking 'What is [term]?' or 'Explain [concept]'.";
  };

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMsgs(m=>[...m,{role:"user",text}]);
    setLoading(true);
    await new Promise(r=>setTimeout(r,350+Math.random()*250));
    const r = getReply(text);
    if (r !== null) setMsgs(m=>[...m,{role:"ai",text:r}]);
    setLoading(false);
  };

  return (
    <>
      {!open && (
        <button onClick={()=>setOpen(true)} style={{
          position:"fixed", bottom:24, right:24, zIndex:200,
          width:56, height:56, borderRadius:"50%", padding:0,
          background:"var(--paper)", border:"1.5px solid var(--border)",
          cursor:"pointer", boxShadow:"0 4px 20px rgba(0,0,0,0.14)",
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"transform .2s, box-shadow .2s",
        }}
          onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.08)";e.currentTarget.style.boxShadow="0 6px 28px rgba(0,0,0,0.20)";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.14)";}}>
          <img src={MASCOT.idle} alt="Ducky" style={{width:40,height:40,objectFit:"contain"}} />
        </button>
      )}

      {open && (
        <div style={{
          position:"fixed", bottom:24, right:24, zIndex:200,
          width:316, height:450, display:"flex", flexDirection:"column",
          background:"var(--paper)", border:"1.5px solid var(--border)",
          borderRadius:18, overflow:"hidden",
          boxShadow:"0 12px 48px rgba(0,0,0,0.18)",
          animation:"popIn 0.2s ease both",
        }}>
          <div style={{ padding:"11px 14px", borderBottom:"1px solid var(--border)",
            display:"flex", alignItems:"center", gap:10, background:"var(--paper2)", flexShrink:0 }}>
            <img src={MASCOT.idle} alt="" style={{width:26,height:26,objectFit:"contain"}} />
            <div style={{flex:1}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,color:"var(--ink)"}}>Ducky</p>
              <p style={{fontSize:10,color:"var(--muted)"}}>Your study assistant</p>
            </div>
            <button onClick={()=>{setOpen(false);if(mode==="quiz")setMode("chat");}}
              style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"var(--muted)",lineHeight:1}}>×</button>
          </div>

          <div style={{flex:1,overflowY:"auto",padding:"12px 12px 8px",
            display:"flex",flexDirection:"column",gap:8}}>
            {mode==="quiz" ? (
              <QuizInline concepts={concepts} points={points} onClose={()=>setMode("chat")} />
            ) : (
              <>
                {msgs.map((m,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",alignItems:"flex-end",gap:6}}>
                    {m.role==="ai" && <img src={MASCOT.idle} alt="" style={{width:20,height:20,objectFit:"contain",flexShrink:0,marginBottom:2}} />}
                    <div className={m.role==="ai"?"chat-bubble-ai":"chat-bubble-user"} style={{whiteSpace:"pre-line"}}>{m.text}</div>
                  </div>
                ))}
                {loading && (
                  <div style={{display:"flex",alignItems:"flex-end",gap:6}}>
                    <img src={MASCOT.idle} alt="" style={{width:20,height:20,objectFit:"contain"}} />
                    <div className="chat-bubble-ai">
                      <span style={{display:"flex",gap:4,alignItems:"center"}}>
                        {[0,1,2].map(i=>(<span key={i} style={{width:5,height:5,borderRadius:"50%",background:"var(--muted)",display:"inline-block",animation:"pulse 1.2s ease infinite",animationDelay:`${i*0.2}s`}} />))}
                      </span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {mode==="chat" && (
            <div style={{padding:"10px 12px",borderTop:"1px solid var(--border)",display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
              <input className="chat-input" placeholder="Ask anything, or /quiz…"
                value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&send()} style={{flex:1}} />
              <button onClick={send} disabled={!input.trim()} style={{
                background:"var(--sage)",border:"none",borderRadius:"50%",
                width:30,height:30,cursor:input.trim()?"pointer":"not-allowed",
                display:"flex",alignItems:"center",justifyContent:"center",
                flexShrink:0,opacity:input.trim()?1:0.45,transition:"opacity .2s",
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function cleanRaw(text) {
  return text.split("").filter(c=>c.charCodeAt(0)<9000||c===" ").join("").replace(/\*\*/g,"").replace(/#{1,6} /g,"").trim();
}

function SummaryPage({ data, fileNames, onBack }) {
  const [fcIndex, setFcIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [fcKnow,  setFcKnow]  = useState(0);
  const [fcDone,  setFcDone]  = useState(false);

  const raw = data?.summary || "";
  const parseSection = (h) => {
    const m = raw.match(new RegExp(h+"[^\\n]*\\n([\\s\\S]*?)(?=\\n[📚✅🔑🧠📝🎯]|$)","i"));
    return m ? m[1].trim() : "";
  };
  const cleanText = t => t.replace(/[📚✅🔑🧠📝🎯★✦✓•]/g,"").replace(/\*\*/g,"").replace(/#{1,6} /g,"").trim();

  const topic = (() => {
    const s = parseSection("📚");
    return s.split("\n")[0]?.replace(/\*\*/g,"").trim() || "Your Summary";
  })();

  const explanation = cleanText(parseSection("🧠"));
  const examSummary = cleanText(parseSection("📝"));
  const tips        = cleanText(parseSection("🎯"));

  const points = parseSection("✅").split("\n")
    .filter(l=>l.trim()).map(l=>l.replace(/^[-*•\d.]+\s*/,"").replace(/\*\*/g,"").trim()).filter(Boolean);

  const concepts = parseSection("🔑").split("\n")
    .filter(l=>l.trim()).map(l=>{
      const c = l.replace(/^[-*•\d.]+\s*/,"").replace(/\*\*/g,"");
      const p = c.split(/[:\-–]/);
      return {term:p[0]?.trim()||"",def:p.slice(1).join(":").trim()||""};
    }).filter(c=>c.term);

  const flashcards = [
    ...concepts.filter(c=>c.def).map(c=>({q:`What is "${c.term}"?`,a:c.def})),
    ...points.slice(0,4).map((p,i)=>({q:`Explain key point ${i+1}.`,a:p})),
  ];

  const fcNext = (knew) => {
    if (knew) setFcKnow(k=>k+1);
    if (fcIndex+1>=flashcards.length) { setFcDone(true); return; }
    setFcIndex(i=>i+1); setFlipped(false);
  };

  return (
    <>
      <div className="fade-in" style={{maxWidth:1060,margin:"0 auto",padding:"44px 32px 100px",
        display:"grid",gridTemplateColumns:"1fr 280px",gap:52}}>

        <div>
          {/* Top bar */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28,flexWrap:"wrap",gap:10}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"var(--muted)",padding:0}}>← New upload</button>
              {(fileNames||[]).map(n=>(
                <span key={n} style={{fontSize:11,color:"var(--muted)",padding:"2px 8px",borderRadius:6,border:"1px solid var(--border)"}}>{n}</span>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <CopyBtn text={cleanRaw(raw)} />
              <button onClick={()=>exportPDF(topic,raw)} style={{
                background:"none",border:"1.5px solid var(--border)",borderRadius:8,
                padding:"5px 12px",cursor:"pointer",color:"var(--muted)",
                fontSize:12,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:5}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>Save PDF
              </button>
            </div>
          </div>

          <h1 style={{fontFamily:"'Crimson Pro',serif",fontSize:"clamp(26px,3.5vw,44px)",
            fontWeight:600,letterSpacing:"-0.03em",lineHeight:1.1,marginBottom:36,color:"var(--ink)"}}>
            {topic}
          </h1>

          {/* What this is about */}
          {explanation && (
            <div style={{marginBottom:36}}>
              <STag>What this is about</STag>
              <div style={{background:"var(--paper)",border:"1px solid var(--border)",
                borderLeft:"3px solid var(--sage)",borderRadius:"0 12px 12px 0",padding:"18px 22px"}}>
                {explanation.split("\n")
                  .map(l=>l.replace(/^(Imagine |Think of |Like |Picture )/i,"").replace(/^[-*•]+\s*/,"").trim())
                  .filter(l=>l.length>10)
                  .map((line,i,arr)=>(
                    <p key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:14.5,
                      lineHeight:1.85,color:"var(--ink2)",fontWeight:400,
                      marginBottom:i<arr.length-1?10:0}}>{line}</p>
                  ))}
              </div>
            </div>
          )}

          {/* Key points */}
          {points.length > 0 && (
            <div style={{marginBottom:36}}>
              <STag>Key points</STag>
              <div style={{background:"var(--paper)",border:"1px solid var(--border)",borderRadius:12,overflow:"hidden"}}>
                {points.map((p,i)=>(
                  <div key={i} className="fade-up" style={{animationDelay:`${i*0.04}s`,
                    display:"flex",alignItems:"flex-start",gap:16,padding:"14px 20px",
                    borderBottom:i<points.length-1?"1px solid var(--border)":"none"}}>
                    <span style={{fontSize:11,fontWeight:700,color:"var(--terra)",
                      fontFamily:"'DM Sans',sans-serif",minWidth:18,marginTop:3,flexShrink:0}}>{i+1}.</span>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14.5,lineHeight:1.75,color:"var(--ink)",fontWeight:400,margin:0}}>{p}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* For the exam */}
          {examSummary && (
            <div style={{marginBottom:36}}>
              <STag>For the exam</STag>
              <div style={{background:"var(--paper)",border:"1px solid var(--border)",
                borderLeft:"3px solid var(--terra)",borderRadius:"0 12px 12px 0",padding:"18px 22px"}}>
                {examSummary.split("\n").map(l=>l.replace(/^[-*•\d.]+\s*/,"").trim()).filter(l=>l.length>5)
                  .map((line,i,arr)=>(
                    <p key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:14.5,
                      lineHeight:1.8,color:"var(--ink2)",fontWeight:400,
                      marginBottom:i<arr.length-1?10:0}}>{line}</p>
                  ))}
              </div>
            </div>
          )}

          {/* Memory tips */}
          {tips && (() => {
            const tl = tips.split("\n").map(l=>l.replace(/^[-*•\d.★💡]+\s*/,"").trim()).filter(l=>l.length>8);
            if (!tl.length) return null;
            return (
              <div style={{marginBottom:36}}>
                <STag>Memory tips</STag>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {tl.map((t,i)=>(
                    <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",
                      background:"var(--paper)",border:"1px solid var(--border)",borderRadius:10,padding:"12px 16px"}}>
                      <span style={{width:22,height:22,borderRadius:6,
                        background:"rgba(78,122,76,0.12)",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        flexShrink:0,fontSize:11,fontWeight:700,color:"var(--sage)",
                        fontFamily:"'DM Sans',sans-serif"}}>
                        {["A","B","C","D","E"][i]||i+1}
                      </span>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,lineHeight:1.7,color:"var(--ink2)",fontWeight:400,margin:0}}>{t}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Flashcards */}
          <div>
            <STag>Review cards</STag>
            {flashcards.length===0
              ? <p style={{fontSize:14,color:"var(--muted)"}}>No flashcards generated.</p>
              : fcDone ? (
                <div className="pop-in" style={{textAlign:"center",padding:"32px 0"}}>
                  <p style={{fontFamily:"'Crimson Pro',serif",fontSize:22,fontStyle:"italic",marginBottom:6,color:"var(--ink)"}}>All done!</p>
                  <p style={{fontSize:13,color:"var(--muted)",marginBottom:16}}>{fcKnow} of {flashcards.length} correct</p>
                  <button onClick={()=>{setFcIndex(0);setFlipped(false);setFcKnow(0);setFcDone(false);}}
                    style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,padding:"8px 24px",
                      borderRadius:8,border:"1.5px solid var(--border)",background:"transparent",color:"var(--ink)",cursor:"pointer"}}>Go again</button>
                </div>
              ) : (
                <div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                    <span style={{fontSize:12,color:"var(--muted)"}}>Card {fcIndex+1} / {flashcards.length}</span>
                    <div style={{flex:1,height:2,background:"var(--border)",borderRadius:99,margin:"0 14px"}}>
                      <div style={{height:"100%",background:"var(--sage)",borderRadius:99,width:`${(fcIndex/flashcards.length)*100}%`,transition:"width .4s"}} />
                    </div>
                    <span style={{fontSize:12,color:"var(--muted)"}}>{Math.round((fcIndex/flashcards.length)*100)}%</span>
                  </div>
                  <div className="fc-scene" onClick={()=>setFlipped(f=>!f)}>
                    <div className={flipped?"fc-inner is-flipped":"fc-inner"}>
                      <div className="fc-front">
                        <p style={{fontSize:10,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--muted)",fontFamily:"'DM Sans',sans-serif",marginBottom:18}}>Question</p>
                        <p style={{fontFamily:"'Crimson Pro',serif",fontSize:20,fontStyle:"italic",lineHeight:1.55,color:"var(--ink)"}}>{flashcards[fcIndex].q}</p>
                        <p style={{marginTop:20,fontSize:11,color:"var(--muted)",fontFamily:"'DM Sans',sans-serif"}}>Tap to reveal →</p>
                      </div>
                      <div className="fc-back">
                        <p style={{fontSize:10,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--muted)",fontFamily:"'DM Sans',sans-serif",marginBottom:18}}>Answer</p>
                        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14.5,lineHeight:1.7,color:"var(--ink2)",fontWeight:400}}>{flashcards[fcIndex].a}</p>
                      </div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginTop:14}}>
                    <button onClick={()=>fcNext(false)} style={{background:"none",border:"1.5px solid var(--border)",borderRadius:8,padding:"9px 20px",cursor:"pointer",color:"var(--terra)",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500}}>Skip</button>
                    <button onClick={()=>setFlipped(f=>!f)} style={{background:"none",border:"1.5px solid var(--border)",borderRadius:8,padding:"9px 20px",cursor:"pointer",color:"var(--ink2)",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500}}>Flip</button>
                    <button onClick={()=>fcNext(true)} style={{background:"var(--sage)",border:"none",borderRadius:8,padding:"9px 20px",cursor:"pointer",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500}}>Got it ✓</button>
                  </div>
                </div>
              )
            }
          </div>
        </div>

        {/* Right — Key Concepts */}
        <div style={{position:"sticky",top:72,alignSelf:"start"}}>
          <STag>Key concepts</STag>
          {concepts.length===0
            ? <p style={{fontSize:14,color:"var(--muted)"}}>No concepts found.</p>
            : concepts.map((c,i)=>(
              <div key={i} className="fade-up" style={{animationDelay:`${i*0.05}s`,
                padding:"12px 0",borderBottom:i<concepts.length-1?"1px solid var(--border)":"none"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,color:"var(--ink)",marginBottom:4}}>{c.term}</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,lineHeight:1.65,color:"var(--ink2)",fontWeight:400}}>{c.def}</p>
              </div>
            ))
          }
        </div>
      </div>

      <ChatBot summaryContext={raw} concepts={concepts} points={points} />
    </>
  );
}

function HistoryPage({ onOpen }) {
  const history = JSON.parse(localStorage.getItem("el_history")||"[]");
  return (
    <div style={{maxWidth:660,margin:"0 auto",padding:"56px 32px 100px"}}>
      <h1 style={{fontFamily:"'Crimson Pro',serif",fontSize:36,fontWeight:600,fontStyle:"italic",
        letterSpacing:"-0.03em",marginBottom:36,color:"var(--ink)"}}>Past uploads</h1>
      {history.length===0 ? (
        <div style={{textAlign:"center",padding:"60px 0"}}>
          <Mascot pose="sleeping" size={130} />
          <p style={{fontFamily:"'Crimson Pro',serif",fontSize:20,fontStyle:"italic",color:"var(--muted)",marginTop:16}}>Nothing here yet</p>
          <p style={{fontSize:13,color:"var(--muted)",marginTop:6}}>Upload something to get started</p>
        </div>
      ) : history.map((h,i)=>(
        <div key={h.id||i} className="fade-up" style={{animationDelay:`${i*0.04}s`}}>
          <div onClick={()=>onOpen(h)}
            style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",
              padding:"16px 0",cursor:"pointer",gap:16,transition:"padding-left .18s"}}
            onMouseEnter={e=>e.currentTarget.style.paddingLeft="8px"}
            onMouseLeave={e=>e.currentTarget.style.paddingLeft="0px"}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:4}}>
                {(h.fileNames||[]).map(n=>(
                  <span key={n} style={{fontFamily:"'Crimson Pro',serif",fontSize:16,fontWeight:600,color:"var(--ink)"}}>{n}</span>
                ))}
              </div>
              <p style={{fontSize:13,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {(h.summary||"").replace(/[📚✅🔑🧠📝🎯\*]/g,"").substring(0,88)}…
              </p>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
              <span style={{fontSize:11,color:"var(--muted)"}}>{h.date}</span>
              <span style={{fontSize:14,color:"var(--muted)"}}>→</span>
            </div>
          </div>
          <WavyLine />
        </div>
      ))}
    </div>
  );
}

function AboutPage({ setPage }) {
  return (
    <div style={{maxWidth:620,margin:"0 auto",padding:"60px 32px 100px"}}>
      <h1 style={{fontFamily:"'Crimson Pro',serif",fontSize:36,fontWeight:600,fontStyle:"italic",
        letterSpacing:"-0.03em",marginBottom:8,color:"var(--ink)"}}>Meet EasyLearn</h1>
      <p style={{fontSize:14,color:"var(--muted)",lineHeight:1.6,marginBottom:32}}>Your personal AI study companion</p>
      <WavyLine />
      <div style={{marginBottom:28}}>
        <p style={{fontSize:10,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--muted)",marginBottom:12}}>The story</p>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:15,lineHeight:1.85,color:"var(--ink2)",fontWeight:400}}>
          Studying is hard. Textbooks are dense. Notes get messy. EasyLearn reads your material and turns it into a structured summary you can actually understand — fast.
        </p>
      </div>
      <WavyLine />
      <div style={{marginBottom:28}}>
        <p style={{fontSize:10,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--muted)",marginBottom:14}}>How it works</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[
            {num:"01",title:"Upload",desc:"PDF, photo or handwritten notes."},
            {num:"02",title:"AI reads it",desc:"Extracts key info automatically."},
            {num:"03",title:"You learn",desc:"Summary, flashcards and quiz."},
          ].map(s=>(
            <div key={s.num} style={{padding:"16px",borderRadius:12,border:"1px solid var(--border)",background:"var(--paper)"}}>
              <p style={{fontFamily:"'Crimson Pro',serif",fontSize:22,fontStyle:"italic",color:"var(--border)",marginBottom:8}}>{s.num}</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,marginBottom:4,color:"var(--ink)"}}>{s.title}</p>
              <p style={{fontSize:12,color:"var(--muted)",lineHeight:1.55}}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <WavyLine />
      <div style={{textAlign:"center",paddingTop:8}}>
        <button onClick={()=>setPage("upload")} style={{
          fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,
          padding:"12px 36px",borderRadius:10,border:"none",
          background:"var(--ink)",color:"var(--cream)",cursor:"pointer",transition:"all .2s",
        }}>Start uploading →</button>
      </div>
    </div>
  );
}

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
    const entry = {id:Date.now(),fileNames,summary:data.summary,
      date:new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})};
    const hist = JSON.parse(localStorage.getItem("el_history")||"[]");
    hist.unshift(entry);
    localStorage.setItem("el_history",JSON.stringify(hist.slice(0,50)));
    setSummaryData(data); setSummaryFiles(fileNames); setPage("summary");
  };
  const handleOpenHistory = h => {
    setSummaryData({summary:h.summary}); setSummaryFiles(h.fileNames||[]); setPage("summary");
  };

  return (
    <>
      <GlobalStyle dark={dark} />
      <div style={{position:"relative",zIndex:1,minHeight:"100vh"}}>
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