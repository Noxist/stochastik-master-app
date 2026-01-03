import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceLine, ComposedChart 
} from 'recharts';
import { 
  Calculator, BarChart2, TrendingUp, GitMerge, PieChart, Play, 
  RotateCcw, Sigma, Target, ArrowRight, CheckCircle2, Menu, PauseCircle, Loader2, FlaskConical, Plus, Trash2, Download, Maximize2, Microscope, Minimize2, Type
  RotateCcw, Sigma, Menu, PauseCircle, Plus, Trash2, Download, Maximize2, Microscope, Minimize2, Type
} from 'lucide-react';

// --- MATH UTILITIES ---

// Stabile nCr Implementierung für größere Zahlen
const nCr = (n: number, k: number) => {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n / 2) k = n - k;
  let res = 1;
  for (let i = 1; i <= k; i++) {
    res = res * (n - i + 1) / i;
  }
  return res;
};

const binomialPDF = (n: number, p: number, k: number) => nCr(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);

// --- GEOMETRY UTILITIES (Venn) ---

const solveVennDistance = (r1: number, r2: number, targetArea: number) => {
  if (targetArea <= 0.0001) return r1 + r2; 
  const minArea = Math.PI * Math.min(r1, r2) ** 2;
  if (targetArea >= minArea - 0.0001) return Math.abs(r1 - r2);

@@ -61,55 +61,128 @@ const solveVennDistance = (r1: number, r2: number, targetArea: number) => {
  return d;
};

// --- UI COMPONENTS ---

const FullscreenModal = ({ isOpen, onClose, children, title }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-200">
      <div className="flex items-center justify-between p-4 border-b bg-slate-50 shrink-0">
        <h2 className="text-xl font-bold text-slate-800">{title || "Vollbildansicht"}</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <Minimize2 size={24} />
        </button>
      </div>
      <div className="flex-1 p-6 overflow-auto bg-slate-50/50 flex items-center justify-center">
        <div className="w-full h-full max-w-7xl bg-white shadow-xl rounded-xl p-6 border border-slate-200 relative overflow-hidden flex flex-col">
           {children}
        </div>
      </div>
    </div>
  );
};

const downloadSVG = (ref: any, filename: string) => {
  if (!ref.current) return;
  const svg = ref.current.querySelector('svg');
  if (!svg) return;
  if (!ref?.current) return;
  const svgCandidates = Array.from(ref.current.querySelectorAll('svg')) as SVGElement[];
  if (svgCandidates.length === 0) return;

  const pickArea = (el: SVGElement) => {
    const rect = el.getBoundingClientRect();
    const viewBox = (el.getAttribute('viewBox') || '').split(' ').map(Number);
    const vbArea = viewBox.length === 4 ? Math.abs(viewBox[2] * viewBox[3]) : 0;
    const rectArea = rect.width * rect.height;
    return Math.max(rectArea, vbArea);
  };

  const svg = svgCandidates.reduce((best, el) => (pickArea(el) > pickArea(best) ? el : best), svgCandidates[0]);

  const rect = svg.getBoundingClientRect();
  const viewBoxParts = (svg.getAttribute('viewBox') || '').split(' ').map(Number);
  const vbWidth = viewBoxParts[2] || rect.width || 800;
  const vbHeight = viewBoxParts[3] || rect.height || 600;

  const titleText = ref.current.dataset?.exportTitle;
  const metaLines = (ref.current.dataset?.exportMeta || '').split('\n').filter(Boolean);

  const padding = 20;
  const lineHeight = 16;
  const headerHeight = titleText ? lineHeight + 6 : 0;
  const metaHeight = metaLines.length ? metaLines.length * lineHeight + 6 : 0;
  const contentYOffset = padding + headerHeight + metaHeight;
  const totalHeight = vbHeight + contentYOffset + padding;
  const totalWidth = vbWidth + padding * 2;

  const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  wrapper.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  wrapper.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
  wrapper.setAttribute('width', `${totalWidth}`);
  wrapper.setAttribute('height', `${totalHeight}`);

  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('x', '0');
  bg.setAttribute('y', '0');
  bg.setAttribute('width', `${totalWidth}`);
  bg.setAttribute('height', `${totalHeight}`);
  bg.setAttribute('fill', 'white');
  wrapper.appendChild(bg);

  if (titleText) {
    const titleNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titleNode.setAttribute('x', `${padding}`);
    titleNode.setAttribute('y', `${padding + lineHeight}`);
    titleNode.setAttribute('font-size', '16');
    titleNode.setAttribute('font-weight', 'bold');
    titleNode.setAttribute('fill', '#0f172a');
    titleNode.textContent = titleText;
    wrapper.appendChild(titleNode);
  }

  const svgData = new XMLSerializer().serializeToString(svg);
  if (metaLines.length) {
    metaLines.forEach((line: string, index: number) => {
      const metaNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      metaNode.setAttribute('x', `${padding}`);
      metaNode.setAttribute('y', `${padding + headerHeight + (index + 1) * lineHeight}`);
      metaNode.setAttribute('font-size', '12');
      metaNode.setAttribute('fill', '#475569');
      metaNode.textContent = line;
      wrapper.appendChild(metaNode);
    });
  }

  const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  chartGroup.setAttribute('transform', `translate(${padding}, ${contentYOffset})`);
  const cloned = svg.cloneNode(true) as SVGElement;
  cloned.setAttribute('x', '0');
  cloned.setAttribute('y', '0');
  cloned.setAttribute('width', `${vbWidth}`);
  cloned.setAttribute('height', `${vbHeight}`);
  chartGroup.appendChild(cloned);
  wrapper.appendChild(chartGroup);

  const svgData = new XMLSerializer().serializeToString(wrapper);
  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename || 'diagramm'}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const Card = ({ children, title, subtitle, className = "", chartRef = null, customTitle = "" }: any) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  return (
    <>
      <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col ${className}`}>
        {(title || subtitle || chartRef) && (
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap justify-between items-start gap-4">
            <div>
              {title && <h3 className="text-lg font-bold text-slate-800">{title}</h3>}
              {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
            </div>
            {chartRef && (
              <div className="flex gap-2">
                <button 
@@ -126,56 +199,50 @@ const Card = ({ children, title, subtitle, className = "", chartRef = null, cust
                >
                  <Maximize2 size={18} />
                </button>
              </div>
            )}
          </div>
        )}
        <div className="p-6 flex-1 overflow-auto relative">
          {children}
        </div>
      </div>

      <FullscreenModal 
        isOpen={isFullscreen} 
        onClose={() => setIsFullscreen(false)} 
        title={customTitle || title}
      >
         <div className="w-full h-full flex flex-col">
            {children}
         </div>
      </FullscreenModal>
    </>
  );
};

const MathFormula = ({ tex }: {tex: string}) => (
  <span className="font-serif italic text-slate-800 px-1 bg-slate-50 rounded border border-slate-100 text-sm mx-1 inline-block">
    {tex}
  </span>
);

const NumberInput = ({ value, onChange, min, max, step = 1, className = "" }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') { onChange(''); return; }
    const num = parseFloat(val);
    onChange(num);
  };
  return (
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={handleChange}
      onFocus={(e) => e.target.select()}
      className={`p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${className}`}
    />
  );
};

const TitleInput = ({ value, onChange }: any) => (
  <div className="mb-4 flex items-center gap-2">
    <Type size={16} className="text-slate-400" />
    <input 
@@ -194,194 +261,229 @@ const BinomialModule = () => {
  const [p, setP] = useState<number | ''>(0.5);
  const [view, setView] = useState('pdf');
  const [customTitle, setCustomTitle] = useState("");
  const chartRef = useRef(null);

  const data = useMemo(() => {
    const d = [];
    let cum = 0;
    const safeN = n === '' ? 0 : n;
    const safeP = p === '' ? 0.5 : p;
    // Cap visualisation for performance if n is extreme
    const maxK = Math.min(safeN, 200);
    
    for (let k = 0; k <= maxK; k++) {
      const prob = binomialPDF(safeN, safeP, k);
      cum += prob;
      d.push({ k, prob, cum });
    }
    return d;
  }, [n, p]);

  const safeN = n === '' ? 0 : n;
  const safeP = p === '' ? 0 : p;
  const mu = safeN * safeP;
  const sigma = Math.sqrt(safeN * safeP * (1 - safeP));
  const binomExportMeta = [
    `n = ${safeN}`,
    `p = ${safeP.toFixed(2)}`,
    `μ = ${mu.toFixed(2)}`,
    `σ = ${sigma.toFixed(2)}`,
    `Ansicht: ${view === 'pdf' ? 'P(X=k)' : 'F(x)'}`
  ].join('\n');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Parameter" className="lg:col-span-1 h-fit">
          <div className="space-y-6">
            <TitleInput value={customTitle} onChange={setCustomTitle} />
            <div>
              <label className="flex justify-between text-sm font-medium mb-2">n: <span className="text-blue-600 font-bold">{n}</span></label>
              <div className="flex gap-4 items-center">
                <input type="range" min="1" max="100" value={safeN} onChange={(e) => setN(parseInt(e.target.value))} className="flex-1 accent-blue-600"/>
                <NumberInput value={n} onChange={setN} min={1} max={500} className="w-20 text-center font-bold" />
              </div>
            </div>
            <div>
              <label className="flex justify-between text-sm font-medium mb-2">p: <span className="text-blue-600 font-bold">{safeP.toFixed(2)}</span></label>
              <div className="flex gap-4 items-center">
                <input type="range" min="0.01" max="0.99" step="0.01" value={safeP} onChange={(e) => setP(parseFloat(e.target.value))} className="flex-1 accent-blue-600"/>
                <NumberInput value={p} onChange={setP} step={0.01} min={0} max={1} className="w-20 text-center font-bold" />
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded text-sm space-y-2 border border-slate-100">
               <div className="flex justify-between"><span>Erwartungswert μ:</span> <span className="font-bold">{mu.toFixed(2)}</span></div>
               <div className="flex justify-between"><span>Standardabw. σ:</span> <span className="font-bold">{sigma.toFixed(2)}</span></div>
            </div>
          </div>
        </Card>
        <Card 
          title={customTitle || "Verteilung"} 
          className="lg:col-span-2" 
          chartRef={chartRef} 
          customTitle={customTitle}
        >
           <div className="flex justify-end mb-4 gap-2 relative z-10">
             <button onClick={() => setView('pdf')} className={`px-3 py-1 text-xs rounded border ${view === 'pdf' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200'}`}>P(X=k)</button>
             <button onClick={() => setView('cdf')} className={`px-3 py-1 text-xs rounded border ${view === 'cdf' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200'}`}>F(x)</button>
           </div>
           <div className="w-full h-full min-h-[300px]" ref={chartRef}>
           <div 
             className="w-full h-full min-h-[300px]" 
             ref={chartRef}
             data-export-title={customTitle || "Binomialverteilung"}
             data-export-meta={binomExportMeta}
           >
             {customTitle && <div className="text-center font-bold text-lg mb-2">{customTitle}</div>}
             <ResponsiveContainer width="100%" height="100%">
               {view === 'pdf' ? (
                 <BarChart data={data} margin={{top: 20}}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                   <XAxis dataKey="k"/>
                   <YAxis/>
                   <RechartsTooltip/>
                   <Bar dataKey="prob" fill="#3b82f6" radius={[4,4,0,0]} name="Wahrscheinlichkeit"/>
                 </BarChart>
               ) : (
                 <ComposedChart data={data} margin={{top: 20}}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                   <XAxis dataKey="k"/>
                   <YAxis domain={[0,1]}/>
                   <RechartsTooltip/>
                   <Line type="stepAfter" dataKey="cum" stroke="#3b82f6" strokeWidth={2} dot={{r:1}} name="Kumulierte Wsk."/>
                 </ComposedChart>
               )}
             </ResponsiveContainer>
           </div>
        </Card>
      </div>
    </div>
  );
};

// --- MODULE 2: RANDOM VARIABLE ---
const RandomVariableModule = () => {
  const [rows, setRows] = useState<any[]>([{x:0,p:0.1},{x:1,p:0.3},{x:2,p:0.45},{x:3,p:0.1},{x:4,p:0.05}]);
  const [customTitle, setCustomTitle] = useState("");
  const chartRef = useRef(null);

  const stats = useMemo(() => {
    let sumP=0, eX=0, eX2=0; 
    rows.forEach(r=>{
      const p=parseFloat(r.p)||0; 
      const x=parseFloat(r.x)||0;
      sumP+=p; eX+=x*p; eX2+=x*x*p;
    }); 
    const vari = eX2 - eX*eX;
    return {sumP,eX, vari, sig: Math.sqrt(vari)};
  }, [rows]);

  const rvExportMeta = [
    `ΣP = ${stats.sumP.toFixed(2)}`,
    `μ = ${stats.eX.toFixed(2)}`,
    `σ = ${stats.sig.toFixed(2)}`,
    `Werte: ${rows.length}`
  ].join('\n');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Wertetabelle">
        <TitleInput value={customTitle} onChange={setCustomTitle} />
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr><th className="p-2 text-left">x</th><th className="p-2 text-left">P(X=x)</th><th></th></tr></thead><tbody>{rows.map((r,i)=>(<tr key={i}><td className="p-1"><NumberInput value={r.x} onChange={(v:any)=>{const n=[...rows];n[i].x=v;setRows(n)}} className="w-full"/></td><td className="p-1"><NumberInput value={r.p} onChange={(v:any)=>{const n=[...rows];n[i].p=v;setRows(n)}} step={0.05} className="w-full"/></td><td className="p-1"><button onClick={()=>setRows(rows.filter((_,j)=>j!==i))}><Trash2 size={16} className="text-slate-400"/></button></td></tr>))}</tbody></table></div><button onClick={()=>setRows([...rows,{x:rows.length,p:0}])} className="mt-4 flex items-center gap-2 text-sm text-blue-600 font-bold">+ Wert</button>
      </Card>
      <Card title={customTitle || "Verteilung"} chartRef={chartRef} customTitle={customTitle}>
        <div className="w-full h-[300px]" ref={chartRef}>
        <div 
          className="w-full h-[300px]" 
          ref={chartRef}
          data-export-title={customTitle || "Zufallsvariable"}
          data-export-meta={rvExportMeta}
        >
            {customTitle && <div className="text-center font-bold mb-2">{customTitle}</div>}
            <ResponsiveContainer>
                <BarChart data={rows}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                    <XAxis dataKey="x"/>
                    <YAxis hide/>
                    <RechartsTooltip/>
                    <Bar dataKey="p" fill="#8b5cf6" radius={[4,4,0,0]} name="P(X=x)"/>
                    <ReferenceLine x={stats.eX} stroke="#7c3aed" strokeWidth={2} label="μ"/>
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
           <div className="p-3 bg-purple-50 rounded border border-purple-100"><div className="text-xs text-purple-600 uppercase font-bold">Erwartungswert μ</div><div className="text-xl font-bold text-purple-800">{stats.eX.toFixed(2)}</div></div>
           <div className="p-3 bg-purple-50 rounded border border-purple-100"><div className="text-xs text-purple-600 uppercase font-bold">Standardabw. σ</div><div className="text-xl font-bold text-purple-800">{stats.sig.toFixed(2)}</div></div>
        </div>
      </Card>
    </div>
  );
};

// --- MODULE 6: SIMULATION ---
const SimulationModule = () => {
  const [history, setHistory] = useState<number[]>([]);
  const [targetNum, setTargetNum] = useState(6);
  const [isRunning, setIsRunning] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const chartRef = useRef(null);
  const timer = useRef<any>(null);

  useEffect(()=>{if(isRunning){timer.current=setInterval(()=>setHistory(h=>[...h,Math.floor(Math.random()*6)+1]),20)}else clearInterval(timer.current);return ()=>clearInterval(timer.current)},[isRunning]);
  
  const data = useMemo(()=>{
     if(history.length===0) return [];
     const step = Math.ceil(history.length/80); 
     let count=0;
     return history.map((val,i)=>{if(val===targetNum)count++; return {n:i+1,rel:count/(i+1)}}).filter((_,i)=>i%step===0 || i===history.length-1);
  },[history,targetNum]);

  const simExportMeta = [
    `Zielzahl: ${targetNum}`,
    `Würfe: ${history.length}`,
    `Aktuelle relative Häufigkeit: ${data.length ? data[data.length-1].rel.toFixed(3) : '–'}`
  ].join('\n');

  return (
    <div className="space-y-6">
       <Card title="Gesetz der großen Zahlen (Würfeln)">
          <TitleInput value={customTitle} onChange={setCustomTitle} />
          <div className="flex flex-wrap gap-4 mb-4">
             {[1,2,3,4,5,6].map(n=><button key={n} onClick={()=>setTargetNum(n)} className={`w-10 h-10 rounded font-bold ${targetNum===n?'bg-blue-600 text-white':'bg-slate-100'}`}>{n}</button>)}
          </div>
          <div className="flex gap-2 flex-wrap">
             <button onClick={()=>setIsRunning(!isRunning)} className={`px-4 py-2 rounded font-bold flex gap-2 items-center ${isRunning?'bg-amber-100 text-amber-700':'bg-green-600 text-white'}`}>{isRunning?<PauseCircle size={18}/>:<Play size={18}/>} {isRunning?'Stop':'Start'}</button>
             <button onClick={()=>{setIsRunning(false);setHistory([])}} className="px-4 py-2 border rounded flex gap-2 items-center"><RotateCcw size={18}/> Reset</button>
             <div className="ml-auto px-4 py-2 bg-slate-100 rounded font-mono text-sm">n = {history.length}</div>
          </div>
       </Card>
       <Card title={customTitle || "Konvergenz"} chartRef={chartRef} customTitle={customTitle}>
          <div className="w-full h-[400px]" ref={chartRef}>
      </Card>
      <Card title={customTitle || "Konvergenz"} chartRef={chartRef} customTitle={customTitle}>
          <div 
            className="w-full h-[400px]" 
            ref={chartRef}
            data-export-title={customTitle || "Gesetz der großen Zahlen"}
            data-export-meta={simExportMeta}
          >
             {customTitle && <div className="text-center font-bold mb-2">{customTitle}</div>}
             <ResponsiveContainer>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="n"/>
                    <YAxis domain={[0,0.5]}/>
                    <RechartsTooltip/>
                    <Line dot={false} dataKey="rel" stroke="#2563eb" strokeWidth={2} name={`Rel. Häufigkeit (${targetNum})`}/>
                    <ReferenceLine y={1/6} stroke="green" strokeDasharray="5 5" label="1/6"/>
                </LineChart>
             </ResponsiveContainer>
          </div>
       </Card>
    </div>
  );
};

// --- MODULE 7: URNEN MODELL (Tree & Sim) ---
const UrnModule = () => {
  const [balls, setBalls] = useState([
    { id: 1, color: '#ef4444', name: 'Rot', count: 3 },
    { id: 2, color: '#3b82f6', name: 'Blau', count: 2 }
  ]);
  const [draws, setDraws] = useState(2);
  const [mode, setMode] = useState('without'); 
@@ -440,83 +542,93 @@ const UrnModule = () => {
    let currentX = x - width / 2 + childWidth / 2;

    validBalls.forEach((ball) => {
      const p = ball.count / currentTotal;
      const nextX = currentX;
      const nextY = y + 80;
      const nextBalls = currentBalls.map(b => (b.id === ball.id && mode === 'without') ? { ...b, count: b.count - 1 } : b);
      branches.push(
        <g key={`${x}-${y}-${ball.id}`}>
          <line x1={x} y1={y + 10} x2={nextX} y2={nextY - 10} stroke="#cbd5e1" strokeWidth="1" />
          <rect x={(x+nextX)/2 - 14} y={(y+nextY)/2 - 8} width="28" height="16" fill="white" rx="4" stroke="#e2e8f0" strokeWidth="1"/>
          <text x={(x+nextX)/2} y={(y+nextY)/2 + 4} textAnchor="middle" fontSize="9" fill="#64748b">{p.toFixed(2)}</text>
          
          <circle cx={nextX} cy={nextY} r="12" fill={ball.color} stroke="white" strokeWidth="2" className="drop-shadow-sm"/>
          <text x={nextX} y={nextY+4} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">{ball.name.charAt(0)}</text>
          
          {renderTree(depth - 1, nextBalls, nextX, nextY, childWidth, pSoFar * p)}
        </g>
      );
      currentX += childWidth;
    });
    return branches;
  };

  const useSim = draws > 4 || balls.length > 3 || Math.pow(balls.length, draws) > 64; 
  const urnExportMeta = [
    `Züge: ${draws}`,
    `Modus: ${mode === 'with' ? 'mit Zurücklegen' : 'ohne Zurücklegen'}`,
    `Farben: ${balls.map(b => `${b.name}=${b.count}`).join(', ')}`
  ].join('\n');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card title="Urnen-Setup" className="xl:col-span-1 h-fit">
           <div className="space-y-4">
              <TitleInput value={customTitle} onChange={setCustomTitle} />
              {balls.map((b, i) => (
                <div key={b.id} className="flex items-center gap-2">
                  <input type="color" value={b.color} onChange={e=>{const n=[...balls];n[i].color=e.target.value;setBalls(n)}} className="w-8 h-8 rounded cursor-pointer border-none"/>
                  <input value={b.name} onChange={e=>{const n=[...balls];n[i].name=e.target.value;setBalls(n)}} className="w-16 text-xs p-1 border rounded"/>
                  <button onClick={()=>{const n=[...balls];n[i].count=Math.max(0,b.count-1);setBalls(n)}} className="w-6 bg-slate-100 rounded">-</button>
                  <span className="w-4 text-center font-bold">{b.count}</span>
                  <button onClick={()=>{const n=[...balls];n[i].count++;setBalls(n)}} className="w-6 bg-slate-100 rounded">+</button>
                  <button onClick={()=>setBalls(balls.filter(x=>x.id!==b.id))}><Trash2 size={16} className="text-slate-400"/></button>
                </div>
              ))}
              <button onClick={()=>setBalls([...balls,{id:Date.now(),color:'#10b981',name:'Neu',count:1}])} className="w-full py-2 border border-dashed rounded text-sm text-blue-600 flex items-center justify-center gap-2"><Plus size={14}/> Farbe</button>
              <div className="border-t pt-4">
                 <label className="text-xs font-bold uppercase text-slate-500">Züge (Tiefe): {draws}</label>
                 <input type="range" min="1" max="15" value={draws} onChange={e=>setDraws(parseInt(e.target.value))} className="w-full accent-blue-600"/>
              </div>
              <div className="flex gap-2">
                 <button onClick={()=>setMode('with')} className={`flex-1 text-xs py-2 border rounded ${mode==='with'?'bg-slate-800 text-white':''}`}>Zurücklegen</button>
                 <button onClick={()=>setMode('without')} className={`flex-1 text-xs py-2 border rounded ${mode==='without'?'bg-slate-800 text-white':''}`}>Ohne Zurück.</button>
              </div>
              {useSim && (
                 <button onClick={runSimulation} className="w-full py-3 bg-blue-600 text-white rounded font-bold flex items-center justify-center gap-2 shadow hover:bg-blue-700"><Play size={16}/> Simulation starten</button>
              )}
           </div>
        </Card>
        <Card title={customTitle || (useSim ? "Simulation" : "Baumdiagramm")} className="xl:col-span-2 min-h-[500px]" chartRef={chartRef} customTitle={customTitle}>
           <div className="w-full h-full min-h-[500px]" ref={chartRef}>
           <div 
             className="w-full h-full min-h-[500px]" 
             ref={chartRef}
             data-export-title={customTitle || (useSim ? "Urnen-Simulation" : "Urnen-Baumdiagramm")}
             data-export-meta={urnExportMeta}
           >
             {customTitle && <div className="text-center font-bold mb-4">{customTitle}</div>}
             {useSim ? (
               <div className="h-full">
                 {simResults ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={simResults} layout="vertical" margin={{left:50, right:20}}><CartesianGrid strokeDasharray="3 3" horizontal/><XAxis type="number"/><YAxis dataKey="name" type="category" width={100} tick={{fontSize:11}}/><RechartsTooltip/><Bar dataKey="prob" fill="#3b82f6" radius={[0,4,4,0]} name="Rel. Häufigkeit"/></BarChart>
                   </ResponsiveContainer>
                 ) : <div className="flex items-center justify-center h-full text-slate-400">Bitte Simulation starten</div>}
               </div>
             ) : (
               <div className="w-full h-full overflow-auto bg-slate-50 rounded border border-slate-100 relative">
                  <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded border border-yellow-200 z-10">Scrollen für Zoom/Pan</div>
                  <div style={{ minWidth: '100%', width: 'fit-content', padding: '2rem' }}>
                     <svg width={Math.max(800, Math.pow(balls.length, draws)*80)} height={draws*100 + 80}>
                        <g transform={`translate(${Math.max(400, Math.pow(balls.length, draws)*40)}, 20)`}>
                           <circle cx="0" cy="0" r="4" fill="#94a3b8"/>
                           {renderTree(draws, balls, 0, 0, Math.max(700, Math.pow(balls.length, draws)*80), 1)}
                        </g>
                     </svg>
                  </div>
               </div>
             )}
           </div>
        </Card>
      </div>
@@ -530,163 +642,199 @@ const HypothesisModule = () => {
  const [p0, setP0] = useState<number | ''>(0.4);
  const [kCrit, setKCrit] = useState(25);
  const [type, setType] = useState('right'); 
  const [customTitle, setCustomTitle] = useState("");
  const chartRef = useRef(null);

  const data = useMemo(() => {
    const d = [];
    const safeN = n === '' ? 0 : n;
    const safeP = p0 === '' ? 0 : p0;
    
    // Safety cap for extremely large n to prevent browser crash
    if (safeN > 1000) return []; 

    for(let k=0; k<=safeN; k++){
      const prob = binomialPDF(safeN, safeP, k);
      let isReject = false;
      if (type === 'right' && k >= kCrit) isReject = true;
      if (type === 'left' && k <= kCrit) isReject = true;
      d.push({ k, prob, isReject });
    }
    return d;
  }, [n, p0, kCrit, type]);

  const alpha = data.filter(d => d.isReject).reduce((sum, d) => sum + d.prob, 0);
  const hypoExportMeta = [
    `n = ${n === '' ? 0 : n}`,
    `p₀ = ${(p0 === '' ? 0 : p0).toFixed(2)}`,
    `k kritisch = ${kCrit}`,
    `Test: ${type === 'right' ? 'rechtsseitig' : 'linksseitig'}`,
    `α ≈ ${(alpha*100).toFixed(2)} %`
  ].join('\n');

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Hypothese" className="lg:col-span-1 h-fit">
             <div className="space-y-4">
                <TitleInput value={customTitle} onChange={setCustomTitle} />
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                   <div className="font-bold text-slate-700 mb-2">Nullhypothese H₀</div>
                   <div className="flex items-center gap-2 mb-2">
                      <span>n =</span> <NumberInput value={n} onChange={setN} min={10} max={500} className="w-16 text-center"/>
                      <span>p₀ =</span> <NumberInput value={p0} onChange={setP0} step={0.05} min={0.1} max={0.9} className="w-16 text-center"/>
                   </div>
                   <div className="text-xs text-slate-500">Wir testen, ob p {'>'} p₀ (Rechtsseitig) oder p {'<'} p₀ (Linksseitig).</div>
                </div>

                <div>
                   <label className="text-sm font-bold block mb-1">Test-Art</label>
                   <div className="flex gap-2">
                      <button onClick={()=>setType('right')} className={`flex-1 py-2 text-xs rounded border ${type==='right'?'bg-blue-600 text-white':'bg-white'}`}>Rechtsseitig</button>
                      <button onClick={()=>setType('left')} className={`flex-1 py-2 text-xs rounded border ${type==='left'?'bg-blue-600 text-white':'bg-white'}`}>Linksseitig</button>
                   </div>
                </div>

                <div>
                   <label className="text-sm font-bold block mb-1">Kritischer Wert k</label>
                   <input type="range" min={0} max={n === '' ? 100 : n} value={kCrit} onChange={e=>setKCrit(parseInt(e.target.value))} className="w-full accent-red-500"/>
                   <div className="text-center font-mono font-bold text-lg text-red-600">{kCrit}</div>
                </div>

                <div className="p-4 bg-red-50 border border-red-100 rounded">
                   <div className="text-xs text-red-500 font-bold uppercase">Alpha-Fehler</div>
                   <div className="text-2xl font-bold text-red-700">α ≈ {(alpha*100).toFixed(2)} %</div>
                </div>
             </div>
          </Card>
          <Card title={customTitle || "Ablehnungsbereich"} className="lg:col-span-2" chartRef={chartRef} customTitle={customTitle}>
             <div className="w-full h-[350px]" ref={chartRef}>
             <div 
               className="w-full h-[350px]" 
               ref={chartRef}
               data-export-title={customTitle || "Hypothesentest"}
               data-export-meta={hypoExportMeta}
             >
                {customTitle && <div className="text-center font-bold mb-2">{customTitle}</div>}
                <ResponsiveContainer>
                    <BarChart data={data} barCategoryGap={1}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                       <XAxis dataKey="k"/>
                       <YAxis hide/>
                       <RechartsTooltip/>
                       <Legend/>
                       <Bar dataKey="prob" name="Wahrscheinlichkeit" shape={(props: any) => {
                          const { x, y, width, height, payload } = props;
                          return <rect x={x} y={y} width={width} height={height} fill={payload.isReject ? "#ef4444" : "#e2e8f0"} radius={[2,2,0,0]}/>
                          return <rect x={x} y={y} width={width} height={height} fill={payload.isReject ? "#ef4444" : "#e2e8f0"} rx={2} ry={2}/>
                       }}/>
                       <ReferenceLine x={kCrit} stroke="black" strokeDasharray="3 3" label="k"/>
                    </BarChart>
                </ResponsiveContainer>
             </div>
          </Card>
       </div>
    </div>
  );
};

// --- MODULE 8: VENN (Dynamic) ---
const VennModule = () => {
  const [pA, setPA] = useState(0.5);
  const [pB, setPB] = useState(0.3);
  const [pIntersect, setPIntersect] = useState(0.1);
  const [customTitle, setCustomTitle] = useState("");
  const chartRef = useRef(null);

  // Constraints
  useEffect(() => {
    const maxI = Math.min(pA, pB);
    const minI = Math.max(0, pA + pB - 1);
    if (pIntersect > maxI) setPIntersect(maxI);
    if (pIntersect < minI) setPIntersect(minI);
  }, [pA, pB, pIntersect]);

  // Dynamic Geometry
  const geometry = useMemo(() => {
    const R_REF = 100;
    const radA = Math.sqrt(pA) * R_REF;
    const radB = Math.sqrt(pB) * R_REF;
    const targetArea = pIntersect * Math.PI * (R_REF**2);
    const dist = solveVennDistance(radA, radB, targetArea);
    return { radA, radB, dist };
  }, [pA, pB, pIntersect]);

  const cx = 200;
  const cy = 150;
  const cAx = cx - geometry.dist / 2;
  const cBx = cx + geometry.dist / 2;
  const onlyA = Math.max(0, pA - pIntersect);
  const onlyB = Math.max(0, pB - pIntersect);
  const union = pA + pB - pIntersect;
  const outside = Math.max(0, 1 - union);
  const vennExportMeta = [
    `P(A) = ${pA.toFixed(2)}`,
    `P(B) = ${pB.toFixed(2)}`,
    `P(A ∩ B) = ${pIntersect.toFixed(2)}`,
    `P(A \\ B) = ${onlyA.toFixed(2)}`,
    `P(B \\ A) = ${onlyB.toFixed(2)}`,
    `P(Ω \\ (A ∪ B)) = ${outside.toFixed(2)}`
  ].join('\n');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <Card title="Einstellungen">
        <TitleInput value={customTitle} onChange={setCustomTitle} />
        <div className="space-y-6">
             <div><div className="flex justify-between text-sm mb-1"><span>P(A)</span><span>{pA.toFixed(2)}</span></div><input type="range" min="0.01" max="1" step="0.01" value={pA} onChange={e=>setPA(parseFloat(e.target.value))} className="w-full accent-blue-600"/></div>
             <div><div className="flex justify-between text-sm mb-1"><span>P(B)</span><span>{pB.toFixed(2)}</span></div><input type="range" min="0.01" max="1" step="0.01" value={pB} onChange={e=>setPB(parseFloat(e.target.value))} className="w-full accent-purple-600"/></div>
             <div><div className="flex justify-between text-sm mb-1"><span>P(A ∩ B)</span><span>{pIntersect.toFixed(2)}</span></div><input type="range" min={Math.max(0, pA+pB-1)} max={Math.min(pA,pB)} step="0.01" value={pIntersect} onChange={e=>setPIntersect(parseFloat(e.target.value))} className="w-full accent-slate-600"/></div>
        </div>
      </Card>
      <Card title={customTitle || "Venn-Diagramm"} chartRef={chartRef} customTitle={customTitle}>
        <div className="w-full h-[350px] flex items-center justify-center" ref={chartRef}>
        <div 
          className="w-full h-[350px] flex items-center justify-center" 
          ref={chartRef}
          data-export-title={customTitle || "Venn-Diagramm"}
          data-export-meta={vennExportMeta}
        >
           <svg viewBox="0 0 400 300" className="w-full h-full max-w-md mx-auto overflow-visible">
              {customTitle && <text x="200" y="20" textAnchor="middle" fontWeight="bold" fontSize="16">{customTitle}</text>}
              <rect x="0" y="0" width="400" height="300" fill="white" stroke="#e2e8f0" strokeWidth="2" rx="8"/>
              <text x="380" y="280" textAnchor="end" fill="#94a3b8" fontWeight="bold">Ω</text>
              <defs><circle id="cA" cx={cAx} cy={cy} r={geometry.radA} /><circle id="cB" cx={cBx} cy={cy} r={geometry.radB} /><clipPath id="clipA"><use href="#cA"/></clipPath></defs>
              <use href="#cA" fill="#3b82f6" fillOpacity="0.2" stroke="#2563eb" strokeWidth="2" />
              <use href="#cB" fill="#8b5cf6" fillOpacity="0.2" stroke="#7c3aed" strokeWidth="2" />
              <use href="#cB" clipPath="url(#clipA)" fill="#475569" fillOpacity="0.3" />
              <text x={cAx} y={cy} textAnchor="middle" dy="5" fontSize="14" fontWeight="bold" fill="#1e40af" pointerEvents="none">A</text>
              <text x={cBx} y={cy} textAnchor="middle" dy="5" fontSize="14" fontWeight="bold" fill="#6b21a8" pointerEvents="none">B</text>
              <text x={cAx} y={cy - 12} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1e40af" pointerEvents="none">A</text>
              <text x={cBx} y={cy - 12} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#6b21a8" pointerEvents="none">B</text>
              <text x={cAx - geometry.radA * 0.35} y={cy + 12} textAnchor="middle" fontSize="12" fill="#1e3a8a" pointerEvents="none">{`A \\ B: ${onlyA.toFixed(2)}`}</text>
              <text x={(cAx + cBx)/2} y={cy + 4} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0f172a" pointerEvents="none">{`A ∩ B: ${pIntersect.toFixed(2)}`}</text>
              <text x={cBx + geometry.radB * 0.35} y={cy + 12} textAnchor="middle" fontSize="12" fill="#581c87" pointerEvents="none">{`B \\ A: ${onlyB.toFixed(2)}`}</text>
              <text x="20" y="40" fontSize="12" fill="#334155" pointerEvents="none">P(A) = {pA.toFixed(2)}</text>
              <text x="20" y="56" fontSize="12" fill="#334155" pointerEvents="none">P(B) = {pB.toFixed(2)}</text>
              <text x="20" y="72" fontSize="12" fill="#334155" pointerEvents="none">P(Ω \\ (A ∪ B)) = {outside.toFixed(2)}</text>
              <text x="380" y="262" textAnchor="end" fontSize="12" fill="#475569" pointerEvents="none">{`P(A ∪ B) = ${union.toFixed(2)}`}</text>
           </svg>
        </div>
      </Card>
    </div>
  );
};

// --- APP SHELL ---

const App = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const tabs = [
    {id:0, title:"Binomialverteilung", icon:BarChart2, comp:<BinomialModule/>},
    {id:1, title:"Zufallsvariablen", icon:Sigma, comp:<RandomVariableModule/>},
    {id:2, title:"Gesetz gr. Zahlen", icon:TrendingUp, comp:<SimulationModule/>},
    {id:3, title:"Baumdiagramm Pro", icon:GitMerge, comp:<UrnModule/>},
    {id:4, title:"Hypothesentest (Alpha)", icon:Microscope, comp:<HypothesisModule/>},
    {id:5, title:"Ereignisse (Venn)", icon:PieChart, comp:<VennModule/>}
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {menuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={()=>setMenuOpen(false)}/>}
@@ -698,26 +846,26 @@ const App = () => {
           {tabs.map(t=>(
             <button key={t.id} onClick={()=>{setActiveTab(t.id);setMenuOpen(false)}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab===t.id?'bg-blue-50 text-blue-700 border border-blue-100':'text-slate-600 hover:bg-slate-50 border border-transparent'}`}>
               <t.icon size={18}/> {t.title}
             </button>
           ))}
         </div>
      </aside>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
         <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3">
               <button onClick={()=>setMenuOpen(true)} className="md:hidden p-2 hover:bg-slate-100 rounded"><Menu/></button>
               <h1 className="text-lg font-bold">{tabs[activeTab].title}</h1>
            </div>
            <div className="text-xs text-slate-400 hidden sm:block">Prüfungsvorbereitung Q2</div>
         </header>
         <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto pb-10">
               {tabs[activeTab].comp}
            </div>
         </main>
      </div>
    </div>
  );
};
