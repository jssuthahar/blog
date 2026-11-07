/**
 * Client behaviour for /open-source/ai-token-calculator/: every interactive part
 * of the Copilot Token Academy course. Ported from the original single-file tool;
 * the calculator itself lives in calculator.js and works without this file.
 *
 * Plain JavaScript on purpose: the tool's code is dense and DOM-driven, and is
 * kept close to the original so the two stay easy to compare.
 */
import { loadTokenizers } from './tokenizer.js';
import { SAMPLES as SAMPLE_TEXT } from './samples.js';

let controller = null;

export function initTokenAcademy() {
  if (!document.getElementById('ta')) return;
  controller?.abort();
  controller = new AbortController();
  const signal = controller.signal;
  const alive = () => !signal.aborted && !!document.getElementById('ta');
  let lvis = false;

const $=id=>document.getElementById(id);
const fmt=(n,d=0)=>Number(n).toLocaleString("en-US",{maximumFractionDigits:d,minimumFractionDigits:d});
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep=ms=>new Promise(r=>setTimeout(r,RM?0:ms));
const runs={};const guard=k=>{runs[k]=(runs[k]||0)+1;const id=runs[k];return()=>runs[k]===id};
function tween(el,to,{dec=0,suf="",ms=600}={}){const from=parseFloat(el.dataset.v||0);el.dataset.v=to;
  if(RM){el.textContent=fmt(to,dec)+suf;return}const t0=performance.now();
  const f=t=>{const p=Math.min(1,(t-t0)/ms),e=1-Math.pow(1-p,3);el.textContent=fmt(from+(to-from)*e,dec)+suf;if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)}
const setv=(el,v,dec=0,suf="")=>{el.dataset.v=v;el.textContent=fmt(v,dec)+suf};

// Prices come from pricing.ts through the page (#ta-data), so every widget and
// the calculator agree. Each row is [name, input, cached, output, long tier].
const DATA=JSON.parse($("ta-data").textContent);
const MODELS=DATA.models.map(m=>[m.name,m.in,m.cached,m.out,m.long]);
const MI=n=>MODELS.findIndex(m=>m[0]===n);
const SON=MI(DATA.defaultModel);

/* 1 bricks */
const COLORS=["#0078D4","#005A9E","#003E70","#2B88D8","#0A7F9E","#0B2A4A","#3B8FD9"];
function split(s){const out=[],re=/ ?[A-Z]?[a-z]+| ?[A-Z]+(?![a-z])| ?\d{1,3}|\s+|[^\sA-Za-z\d]/g;let m;
  while((m=re.exec(s))){const t=m[0],lead=t.startsWith(" ")?" ":"";let w=lead?t.slice(1):t;
    if(/^[A-Za-z]+$/.test(w)&&w.length>8){out.push(lead+w.slice(0,6));w=w.slice(6);while(w.length>7){out.push(w.slice(0,6));w=w.slice(6)}out.push(w)}else out.push(t)}return out}
async function w1(anim){const ok=guard(1),s=$("b-in").value,t=split(s),box=$("b-out");box.innerHTML="";setv($("b-c"),s.length);setv($("b-n"),0);
  for(let i=0;i<t.length;i++){if(!ok())return;const b=document.createElement("span");b.className="brick";b.style.background=COLORS[i%COLORS.length];
    b.textContent=t[i].replace(/^ /,"·").replace(/\n/g,"↵");box.append(b);$("b-n").textContent=i+1;if(anim)await sleep(160)}setv($("b-n"),t.length)}
$("b-in").addEventListener("input",()=>w1(false));

/* 2 parcel */
const ITEMS=[["Your note","10","#8DB9E2",10],["Copilot’s rulebook","2,100","#0B1020",2100],["Project instructions","650","#005A9E",650],["Toolbox (tools it can use)","1,900","#1F6FB2",1900],["Earlier messages","3,200","#0078D4",3200],["Code files you pointed at","4,140","#3B8FD9",4140]];
async function w2(anim){const ok=guard(2),box=$("p-box");box.innerHTML="";let w=0;setv($("p-w"),0);$("p-msg").textContent="Your note is about 10 tokens.";
  for(let i=0;i<ITEMS.length;i++){if(!ok())return;const it=ITEMS[i],d=document.createElement("div");d.className="item";d.style.background=it[2];
    d.innerHTML=`<b></b><span>${it[1]}</span>`;d.firstChild.textContent=it[0];if(i===0)d.style.color="#0B1020";box.append(d);w+=it[3];
    anim?tween($("p-w"),w,{ms:450}):setv($("p-w"),w);if(anim)await sleep(i===0?900:700)}
  $("p-msg").innerHTML="Your 10-token note became a <b>12,000-token</b> parcel. Your note is less than 0.1% of it."}

/* 3 taxi */
async function w3(anim){const ok=guard(3),A=300,B=4000,ra=$("t-a"),rb=$("t-b");
  const roadW=()=>ra.parentElement.clientWidth-56;
  if(!anim){ra.style.left=(roadW()*A/B)+"px";rb.style.left=roadW()+"px";setv($("t-am"),A);setv($("t-bm"),B);return}
  ra.style.left="0";rb.style.left="0";setv($("t-am"),0);setv($("t-bm"),0);await sleep(200);
  const steps=60;for(let i=1;i<=steps;i++){if(!ok())return;const tok=B*i/steps;
    const a=Math.min(A,tok);ra.style.left=(roadW()*a/B)+"px";rb.style.left=(roadW()*tok/B)+"px";
    $("t-am").textContent=fmt(a);$("t-bm").textContent=fmt(tok);await sleep(45)}
  $("t-am").textContent=fmt(A)+" · 0.3 cr";$("t-bm").textContent=fmt(B)+" · 4 cr"}

/* 4 cache */
const CI=[["Rulebook",2100],["Instructions",650],["Toolbox",1900],["Earlier messages",3200],["Code files",4140],["New question",10]];
function trip(el,cached){el.innerHTML=CI.map((c,i)=>`<div class="ti${cached&&i<5?" c":""}" id="${el.id}-${i}">${c[0]}<em>${fmt(c[1])}</em></div>`).join("")}
const cost=(cached)=>{let f=0,c=0;CI.forEach((x,i)=>{if(cached&&i<5)c+=x[1];else f+=x[1]});return (f*2+c*0.1)/1e6*100};
async function w4(anim){const ok=guard(4);trip($("c-1"),false);$("c-1s").textContent=fmt(cost(false),2)+" cr";
  if(!anim){trip($("c-2"),true);$("c-2s").textContent=fmt(cost(true),2)+" cr";return}
  trip($("c-2"),false);$("c-2s").textContent=fmt(cost(false),2)+" cr";$("c-2s").dataset.v=cost(false);await sleep(700);
  for(let i=0;i<5;i++){if(!ok())return;$("c-2-"+i).classList.add("c");await sleep(350)}
  tween($("c-2s"),cost(true),{dec:2,suf:" cr"})}

/* 5 snowball */
const NEW=[6,3.5,3.5,3.5,3.5,3.5,3.5,3.5,3.5,3.5];
function msgRows(){$("s-msgs").innerHTML=NEW.map((_,i)=>`<div class="msg"><span class="small">Msg ${i+1}</span><div class="tr" style="display:flex"><div class="fl old" id="s-o${i}"></div><div class="fl" id="s-n${i}"></div></div><span class="small num" id="s-v${i}"></span></div>`).join("")}
msgRows();
async function w5(anim){const ok=guard(5);let size=0,tot=0;const ball=$("s-ball");
  NEW.forEach((_,i)=>{$("s-o"+i).style.width="0";$("s-n"+i).style.width="0";$("s-v"+i).textContent=""});ball.style.width=ball.style.height="40px";ball.textContent="0K";setv($("s-tot"),0,0,"K");
  for(let i=0;i<NEW.length;i++){if(!ok())return;const old=size;size+=NEW[i];tot+=size;
    $("s-o"+i).style.width=(old/40*100)+"%";$("s-n"+i).style.width=(NEW[i]/40*100)+"%";$("s-v"+i).textContent=fmt(size,1)+"K";
    const d=40+size*3.9;ball.style.width=ball.style.height=d+"px";ball.textContent=fmt(size,1)+"K";
    anim?tween($("s-tot"),tot,{suf:"K",ms:300}):setv($("s-tot"),tot,0,"K");if(anim)await sleep(450)}}

/* 6 couriers */
const K=[["GPT-6 Luna","Economy","🛵","var(--good)"],["Gemini 3.8 Flash","Economy+","🚐","var(--lite)"],["Claude Sonnet 5.5","Standard","🚚","#0078D4"],["Claude Opus 5.5","Premium","🚛","var(--think)"],["GPT-6 Astra","Express","✈️","var(--warn)"]].map(k=>[MI(k[0]),...k.slice(1)]);
const req=m=>(12000*m[1]+800*m[3])/1e6*100;
$("k-list").innerHTML=K.map(k=>`<div class="cour"><div class="nm"><b>${k[1]}</b><small>${MODELS[k[0]][0]}</small></div><div class="track"><div class="van" id="k-${k[0]}" style="background:${k[3]}">${k[2]}</div></div><div class="pr num" id="k-p${k[0]}">0</div></div>`).join("");
async function w6(anim){const ok=guard(6),max=req(MODELS[K[K.length-1][0]]);
  K.forEach(k=>{$("k-"+k[0]).style.width="0";setv($("k-p"+k[0]),0,2," cr")});if(anim)await sleep(80);
  for(const k of K){if(!ok())return;const c=req(MODELS[k[0]]);$("k-"+k[0]).style.width=Math.max(14,c/max*100)+"%";
    anim?tween($("k-p"+k[0]),c,{dec:2,suf:" cr",ms:900}):setv($("k-p"+k[0]),c,2," cr");if(anim)await sleep(300)}}

/* 7 instructions & skills */
const RUNS=[
 ["bad","No instructions","The agent explores and guesses",[["List project folders",8],["Read README",10],["Read 6 files to learn style",22],["Guess the test framework",26],["Write the endpoint",30],["Run tests: wrong command","x",34],["Fix the test command",37],["Fix style it guessed wrong","x",41],["Run tests: pass",44]]],
 ["good","Short instructions + a skill","600-token map; tests skill loads when needed",[["Read 2 relevant files",8.6],["Write the endpoint",11],["Load “unit-tests” skill","k",14.2],["Write tests",17],["Run dotnet test: pass",19]]],
 ["mid","Bloated instructions","6,000 tokens of docs sent on every call",[["Read 2 relevant files",14],["Write the endpoint",16.4],["Write tests",19.6],["Fix a test",22.4],["Run tests: pass",24.4]]]];
$("i-tri").innerHTML=RUNS.map((r,j)=>`<div class="col ${r[0]}"><h3>${r[1]}</h3><div class="sub">${r[2]}</div>${r[3].map((c,i)=>{const t=typeof c[1]==="string"?c[1]:"";const k=t?c[2]:c[1];return `<div class="call ${t}" id="i-${j}-${i}"><span>${i+1}. ${c[0]}</span><em>${k}K</em></div>`}).join("")}<div class="tot"><span><b class="num" id="i-t${j}">0K</b> input</span><span class="num" id="i-c${j}">0 cr</span></div></div>`).join("");
async function w7(anim){const ok=guard(7),tot=[0,0,0];RUNS.forEach((r,j)=>{r[3].forEach((_,i)=>$("i-"+j+"-"+i).classList.toggle("on",!anim));setv($("i-t"+j),0,0,"K");setv($("i-c"+j),0,1," cr")});
  const steps=Math.max(...RUNS.map(r=>r[3].length));
  for(let i=0;i<steps;i++){if(!ok())return;RUNS.forEach((r,j)=>{const c=r[3][i];if(!c)return;const k=typeof c[1]==="string"?c[2]:c[1];tot[j]+=k;
      $("i-"+j+"-"+i).classList.add("on");const cr=tot[j]*1000*2/1e6*100;
      if(anim){tween($("i-t"+j),tot[j],{dec:0,suf:"K",ms:300});tween($("i-c"+j),cr,{dec:1,suf:" cr",ms:300})}else{setv($("i-t"+j),tot[j],0,"K");setv($("i-c"+j),cr,1," cr")}});
    if(anim)await sleep(600)}}

/* tips */
const TIPS=[["🗺️","Give a map, not a manual","copilot-instructions.md is sent with every request. Keep it to your stack, commands and real pitfalls.",".github/copilot-instructions.md"],
 ["🧰","Detail goes in skills","Skills and prompt files load only when a task needs them, so they don’t ride on every call.",".github/prompts/*.prompt.md"],
 ["🧹","New task, new chat","Every message re-sends the whole chat. When the task changes, clear it so the old history stops riding along on each request.","/clear · New Chat (Ctrl+N / ⌘N)"],
 ["📝","Plan to a file, then start fresh","Plan with a strong model, save it, then implement in a new chat that carries one page instead of the whole history.","Implement step 1 of #file:PLAN.md"],
 ["🤖","Cheap helpers","Sub-agents don’t inherit the main chat history, so a light model is often enough for them.","Light model for sub-agents"],
 ["🔌","Unplug unused tools","Every enabled MCP tool adds its description to every request.","Enable only the toolsets you need"],
 ["⏱️","Mind the cache clock","Caches expire after a period of inactivity that each provider sets. Back after a long break? Summarize first.","/compact in Copilot CLI"],
 ["📏","Stay under the long-context line","Some models charge double per token above a size limit, for example GPT-5.6 Sol above 272K input tokens.","/context in Copilot CLI"],
 ["🎚️","Reasoning is a dial","Higher reasoning effort writes more tokens. Use normal effort and raise it only for hard problems.","Set it before the chat starts"],
 ["🛑","Set a session limit","An AI credit session limit stops a long agent task cleanly and asks before it spends more.","Copilot CLI / SDK session limit"],
 ["🔍","Let Copilot audit you","Session analysis finds your repeated waste so you can fix it once in instructions.","/chronicle cost-tips"]];
$("tips").innerHTML=TIPS.map(t=>`<button class="tip" type="button" aria-expanded="false"><span class="e" aria-hidden="true">${t[0]}</span><b>${t[1]}</b><span class="why">${t[2]}</span><code>${t[3]}</code><span class="more">Show why</span></button>`).join("");
$("tips").onclick=e=>{const b=e.target.closest(".tip");if(!b)return;const x=b.getAttribute("aria-expanded")==="true";b.setAttribute("aria-expanded",!x);b.querySelector(".more").textContent=x?"Show why":"Hide"};

/* ================= academy ================= */
const enc=()=>window.GPTTokenizer_o200k_base, enc2=()=>window.GPTTokenizer_cl100k_base;
const hasTok=()=>!!enc();
const tokO=s=>hasTok()?enc().encode(s).length:Math.ceil(s.length/4);
const tokC=s=>enc2()?enc2().encode(s).length:Math.ceil(s.length/4);
const FAM=n=>/^GPT/.test(n)?"openai":/^Claude/.test(n)?"claude":/^Gemini/.test(n)?"gemini":"other";
const RANGE={openai:[1,1],claude:[1.05,1.3],gemini:[0.9,1.1],other:[0.95,1.15]};
const estFor=(name,o)=>{const r=RANGE[FAM(name)];return Math.round(o*(r[0]+r[1])/2)};
// Above a model's long-context threshold the whole request moves to the higher rates.
const crOf=(m,fi,ca,o)=>{const r=m[4]&&fi+ca>m[4].over?[0,m[4].in,m[4].cached,m[4].out]:m;return (fi*r[1]+ca*r[2]+o*r[3])/1e6*100};
const opts=(sel,def)=>{sel.innerHTML=MODELS.map((m,i)=>`<option value="${i}">${m[0]} · $${m[1]} in / $${m[3]} out</option>`).join("");sel.value=def};
const esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------- generation ---------- */
const GP=["Write"," a"," Python"," function"," that"," adds"," two"," numbers"];
const GS=[[["def",71],["Here",14],["```",9],["Sure",6]],[[" add",64],[" sum",22],[" add_numbers",10],[" plus",4]],[["(",97],["_",2],[":",1]],
 [["a",58],["x",27],["num",15]],[[",",95],[":",5]],[[" b",93],[" y",5],[" num",2]],[["):",88],[")",7],[":",5]],[["\n   ",90],["\n",8],[" #",2]],
 [[" return",96],[" result",4]],[[" a",90],[" sum",10]],[[" +",97],[" -",3]],[[" b",98],[" a",2]],[["⟨end⟩",86],["\n",14]]];
let gi=0,gbusy=false,gauto=false;
const shown=t=>t.replace(/\n/g,"↵").replace(/^ /,"␣").replace(/ /g,"␣");
const idOf=t=>{if(t==="⟨end⟩")return "end";try{if(hasTok()){const e=enc().encode(t);if(e.length===1)return e[0]}}catch(e){}let h=7;for(const c of t)h=(h*31+c.charCodeAt(0))%90000;return 1000+h};
function chip(t,gen){const s=document.createElement("span");s.className="tk"+(gen?" g":"");s.innerHTML=`<span></span><small>${idOf(t)}</small>`;s.firstChild.textContent=shown(t);return s}
const gspeed=()=>[0,1.8,1.3,1,.6,.3][$("g-speed").value];
function gcount(){const o=gi;setv($("g-in"),GP.length);setv($("g-out"),o);setv($("g-read"),GP.length+o);$("g-cr").textContent=fmt(crOf(MODELS[SON],GP.length,0,o),5)}
function greset(){gauto=false;gi=0;const q=$("g-seq");q.innerHTML="";GP.forEach(t=>q.append(chip(t)));$("g-probs").innerHTML="";$("g-brain").textContent="Model";$("g-play").textContent="▶ Play";
  $("g-explain").innerHTML=`Your prompt was split into <b>${GP.length} tokens</b> (blue). Each has an ID number from the model’s vocabulary. In Copilot, about 12,000 more tokens of context would be added before this.`;gcount()}
async function gstep(){if(gbusy)return;if(gi>=GS.length){gauto=false;$("g-play").textContent="▶ Play";return}gbusy=true;const sp=gspeed();
  const toks=[...$("g-seq").children];toks.forEach(t=>t.classList.add("read"));$("g-brain").classList.add("on");$("g-brain").textContent=`Reading ${toks.length} tokens`;
  $("g-explain").innerHTML=`Step ${gi+1}: the model looks at <b>all ${toks.length} tokens</b> so far and scores every possible next token.`;setv($("g-read"),toks.length);
  const c=GS[gi];$("g-probs").innerHTML=c.map(p=>`<div class="pr"><span>${esc(shown(p[0]))}</span><div class="tr"><div class="fl"></div></div><span class="pc">${p[1]}%</span></div>`).join("");
  await sleep(350*sp);[...$("g-probs").children].forEach((r,i)=>r.querySelector(".fl").style.width=c[i][1]+"%");await sleep(700*sp);
  if(!$("g-probs").children[0]){gbusy=false;return}$("g-probs").children[0].classList.add("win");$("g-explain").innerHTML=`It picks <b>${esc(shown(c[0][0]))}</b> (${c[0][1]}%) and adds it to the end. That is <b>1 output token</b>.`;await sleep(500*sp);
  toks.forEach(t=>t.classList.remove("read"));$("g-brain").classList.remove("on");
  $("g-seq").append(chip(c[0][0],true));gi++;$("g-brain").textContent="Model";gcount();
  if(gi===GS.length){$("g-explain").innerHTML=`The model predicted the <b>end token</b>, so it stops. Total: <b>${GP.length} input</b> + <b>${gi} output</b> tokens. A whole-file answer would have kept going for thousands of tokens.`;gauto=false;$("g-play").textContent="▶ Play"}
  gbusy=false}
async function gplay(){if(gauto){gauto=false;$("g-play").textContent="▶ Play";return}if(gi>=GS.length)greset();gauto=true;$("g-play").textContent="❚❚ Pause";
  while(gauto&&gi<GS.length){await gstep();await sleep(300*gspeed())}}
$("g-play").onclick=gplay;$("g-step").onclick=()=>{gauto=false;$("g-play").textContent="▶ Play";gstep()};$("g-reset").onclick=greset;greset();

/* ---------- samples (the lesson counts them live) ---------- */
const SAMPLES=Object.fromEntries(Object.entries(SAMPLE_TEXT).map(([k,v])=>[k,v.text]));

/* ---------- ask ---------- */
const FILLER=/\b(hi|hello|hey)( copilot)?[,!.]?\s*|\b(could|can|would) you (please )?|\bplease,?\s*|\bkindly\s*|\bthanks( a lot| in advance)?[!.]?|\bthank you[!.]?|\bi (think|guess|was wondering if)( that)?\s*|\bif possible,?\s*|\bjust\s+/gi;
function trimPrompt(s){let t=s.replace(FILLER,"").replace(/\s{2,}/g," ").replace(/\s+([.,!?])/g,"$1").trim();return t.charAt(0).toUpperCase()+t.slice(1)}
function askRun(){const s=$("a-in").value,n=tokO(s),tr=trimPrompt(s),tn=tokO(tr);setv($("a-tok"),n);setv($("a-fill"),Math.max(0,n-tn));$("a-trim").textContent=tr||"(empty)";$("a-trimn").textContent=fmt(tn);
  const lines=s.split("\n").length;
  const C=[
   [/#file:|\b\w+\.(cs|ts|tsx|js|py|java|go|rb|json|yml|yaml|md|sql)\b|\b[A-Z][a-z]+[A-Z]\w*|\w+\(\)|line \d+/.test(s),"Names the file, class or method","Point to the exact place: a #file reference, a class or a method name. Otherwise the agent explores to find it."],
   [!/\b(fix it|fix this|make it better|improve it|optimi[sz]e (it|this)|clean ?up|some bug|somewhere|something)\b/i.test(s),"Says exactly what to change","Vague words like “fix it” or “some bug” make the model guess, which leads to retries."],
   [!/\b(whole|entire|full) (file|code|class|project)|rewrite (everything|the file|it all)/i.test(s),"Doesn’t ask to regenerate everything","Asking for the whole file means thousands of output tokens, the most expensive kind. Ask for the changed lines."],
   [/\b(only|diff|done when|don'?t|do not|return|show|output|stop)\b/i.test(s),"Says when it’s done and what to return","Add a stopping point and format, for example “Show only the diff”."],
   [/\b(use|using|keep|must|without|framework|library|style|pattern)\b/i.test(s),"Gives constraints","Name the library, pattern or rule to follow, so the first answer fits."],
   [lines<=40&&n<=1500,"Keeps pasted content small","Large pasted code or logs ride along on every later message. Select or reference just the relevant lines."]];
  const ok=C.filter(c=>c[0]).length;$("a-score").textContent=ok+"/6";
  const multi=(s.match(/\?/g)||[]).length>2||/\b(and also|another thing)\b/i.test(s);
  $("a-checks").innerHTML=C.map(c=>`<div class="chk2 ${c[0]?"ok":"warn"}"><span class="ic">${c[0]?"✓":"!"}</span><div><b>${c[1]}</b>${c[0]?"":`<span>${c[2]}</span>`}</div></div>`).join("")+
   (multi?`<div class="chk2 info"><span class="ic">i</span><div><b>Several tasks in one prompt</b><span>Split unrelated tasks into separate chats so each stays small.</span></div></div>`:"")+
   (n-tn>0?`<div class="chk2 info"><span class="ic">i</span><div><b>Politeness is free to skip</b><span>Greetings and “please” don’t change the answer. Removing them saves ${n-tn} tokens here; the bigger win is a precise task.</span></div></div>`:"")}
$("a-in").addEventListener("input",askRun);
function tplRun(){const v=id=>$(id).value.trim();const p=[v("t-task"),v("t-ctx")&&("Context: "+v("t-ctx")),v("t-con")&&("Constraints: "+v("t-con")),v("t-done")&&("Done when: "+v("t-done"))].filter(Boolean).join("\n");
  $("t-out").textContent=p;$("t-n").textContent=fmt(tokO(p))}
["t-task","t-ctx","t-con","t-done"].forEach(id=>$(id).addEventListener("input",tplRun));
/* ---------- patterns ---------- */
const PAT=[
 {id:"single",name:"Single question",desc:"One request, one answer. The cost is simply input plus output at the model’s rates.",
  f:"credits = (input × in_rate + output × out_rate) ÷ 1,000,000 × 100",
  ps:[["I","Input tokens",1000,100000,1000,12000],["O","Output tokens",100,10000,100,800]],
  gen:p=>[{fi:p.I,ca:0,o:p.O,th:0}],lesson:"Output is about 5× pricier per token. Halving the answer length often saves more than trimming the prompt."},
 {id:"chat",name:"Long chat",desc:"Each new message re-sends everything before it, so input grows every turn and the total grows much faster than the number of questions.",
  f:"input(turn k) = first + (k − 1) × growth\ntotal input  = n × first + growth × n(n − 1) ÷ 2",
  ps:[["n","Messages",1,40,1,12],["B","First request (tokens)",1000,30000,500,6000],["g","Growth per turn",500,10000,500,3500],["O","Output per turn",100,3000,100,800]],
  gen:p=>Array.from({length:p.n},(_,k)=>({fi:p.B+k*p.g,ca:0,o:p.O,th:0})),lesson:"Total input rises with the square of the number of turns. Starting a new chat for a new topic resets it."},
 {id:"cache",name:"Chat with cache",desc:"Same long chat, but the part that was already sent recently is reused from cache, usually at 10% of the input price or less.",
  f:"cached(turn k) = hit % × input(turn k − 1)\nfresh(turn k)  = input(turn k) − cached(turn k)",
  ps:[["n","Messages",1,40,1,12],["B","First request (tokens)",1000,30000,500,6000],["g","Growth per turn",500,10000,500,3500],["h","Cache hit rate %",0,95,5,85],["O","Output per turn",100,3000,100,800]],
  gen:p=>Array.from({length:p.n},(_,k)=>{const inp=p.B+k*p.g,ca=k?Math.round(p.h/100*(p.B+(k-1)*p.g)):0;return{fi:inp-ca,ca,o:p.O,th:0}}),lesson:"Cache keeps long sessions affordable, but it breaks if you switch models, change settings or come back after it expires."},
 {id:"agent",name:"Agent loop",desc:"One instruction starts many model calls: plan, read files, run tools, edit, test. Every call carries the growing context plus the latest tool output.",
  f:"input(call k) = start + (k − 1) × (tool output + output)",
  ps:[["n","Model calls",2,40,1,14],["B","Starting context",5000,40000,1000,14000],["t","Tool output per call",200,10000,100,3000],["O","Output per call",100,3000,100,700],["h","Cache hit rate %",0,95,5,0]],
  gen:p=>Array.from({length:p.n},(_,k)=>{const inp=p.B+k*(p.t+p.O),ca=k?Math.round(p.h/100*(p.B+(k-1)*(p.t+p.O))):0;return{fi:inp-ca,ca,o:p.O,th:0}}),lesson:"Long tool outputs (logs, big files) are re-sent on every later call. Trimming them with a hook or a focused command pays back many times."},
 {id:"sub",name:"Sub-agents",desc:"The main agent hands side tasks to sub-agents. Each sub-agent starts with its own small context and can run on a lighter model.",
  f:"total = main calls on the main model\n      + sub-agent calls on the sub-agent model (own small context)",
  ps:[["m","Main agent calls",2,20,1,6],["s","Sub-agents",0,6,1,3],["c","Calls per sub-agent",1,8,1,4],["L","Sub-agents on a light model (1 = yes)",0,1,1,1]],
  gen:p=>{const a=[];for(let k=0;k<p.m;k++)a.push({fi:20000+k*4000,ca:0,o:800,th:0});for(let s=0;s<p.s;s++)for(let k=0;k<p.c;k++)a.push({fi:8000+k*2000,ca:0,o:500,th:0,sub:1});return a},
  lesson:"Sub-agents don’t inherit the main chat history, so their calls stay small. Putting them on a light model cuts their cost further."},
 {id:"reason",name:"Reasoning model",desc:"Reasoning models write hidden thinking tokens before the visible answer. On most models those are billed as output.",
  f:"output billed = visible answer + thinking tokens",
  ps:[["I","Input tokens",1000,60000,1000,12000],["O","Visible answer",100,5000,100,800],["r","Thinking tokens (× answer)",0,20,1,6]],
  gen:p=>[{fi:p.I,ca:0,o:p.O,th:p.O*p.r}],lesson:"Use normal reasoning effort by default and raise it for genuinely hard problems; set it before the chat starts so the cache stays valid."},
 {id:"long",name:"Long-context tier",desc:"Some models charge a higher rate once a request passes a size threshold. Example from GitHub’s price list: GPT‑5.6 Sol is $4 per 1M input up to 272K input tokens and $8 above; output goes from $20 to $30.",
  f:"if input > 272,000:  input × $8 + output × $30\nelse:                input × $4 + output × $20     (GPT-5.6 Sol, per 1M)",
  ps:[["I","Input tokens in the request",20000,600000,10000,300000],["O","Output tokens",500,10000,500,2000]],
  gen:p=>[100,150,200,250,300,350,400,450,500,550,600].map(k=>({fi:k*1000,ca:0,o:p.O,th:0,long:k*1000>272000})),fixed:MI("GPT-5.6 Sol"),
  lesson:"Crossing the threshold doubles the input price for the whole request. Keep long sessions compact so requests stay under the line."}];
let pcur=PAT[0];const pv={};
$("p-btns").innerHTML=PAT.map(p=>`<button type="button" data-p="${p.id}" aria-pressed="false">${p.name}</button>`).join("");
opts($("p-model"),SON);
$("p-btns").onclick=e=>{const b=e.target.closest("button");if(b)pSel(b.dataset.p)};
function pSel(id){pcur=PAT.find(p=>p.id===id);document.querySelectorAll("#p-btns button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.p===id));
  $("p-title").textContent=pcur.name;$("p-desc").textContent=pcur.desc;$("p-formula").textContent=pcur.f;$("p-lesson").textContent=pcur.lesson;
  $("p-params").innerHTML=pcur.ps.map(q=>`<label for="pp-${q[0]}">${q[1]}: <b id="pv-${q[0]}">${fmt(q[5])}</b><input type="range" id="pp-${q[0]}" min="${q[2]}" max="${q[3]}" step="${q[4]}" value="${q[5]}"></label>`).join("");
  $("p-model").disabled=pcur.fixed!=null;if(pcur.fixed!=null)$("p-model").value=pcur.fixed;else if(+$("p-model").value===MI("GPT-5.6 Sol"))$("p-model").value=SON;pRun(true)}
function pRun(anim){const p={};pcur.ps.forEach(q=>{p[q[0]]=+$("pp-"+q[0]).value;$("pv-"+q[0]).textContent=fmt(p[q[0]])});
  const m=MODELS[+$("p-model").value],light=MODELS[MI("GPT-6 Luna")];let calls=pcur.gen(p);
  if(pcur.id==="long"){const one={fi:p.I,ca:0,o:p.O,th:0,long:p.I>272000};const cost=c=>c.long?(c.fi*8+c.o*30)/1e6*100:(c.fi*4+c.o*20)/1e6*100;
    pChart(calls,true);setv($("p-calls"),1);setv($("p-in"),one.fi);setv($("p-out"),one.o);$("p-cr").textContent=fmt(cost(one),2)+(one.long?" (long rate)":"");return}
  pChart(calls,false);let ti=0,to=0,cr=0;calls.forEach(c=>{const mm=c.sub&&p.L?light:m;ti+=c.fi+c.ca;to+=c.o+c.th;cr+=crOf(mm,c.fi,c.ca,c.o+c.th)});
  setv($("p-calls"),calls.length);anim?tween($("p-in"),ti):setv($("p-in"),ti);anim?tween($("p-out"),to):setv($("p-out"),to);anim?tween($("p-cr"),cr,{dec:2}):setv($("p-cr"),cr,2)}
function pChart(calls,long){const max=Math.max(...calls.map(c=>c.fi+c.ca+c.o+c.th),1),H=210;const el=$("p-chart");
  el.innerHTML=calls.map(c=>`<div class="pcol" title="${fmt(c.fi+c.ca)} in · ${fmt(c.o+c.th)} out${c.sub?" · sub-agent":""}"><span class="${c.long?"x":"i"}" style="height:0" data-h="${c.fi/max*H}"></span><span class="c" style="height:0" data-h="${c.ca/max*H}"></span><span class="o" style="height:0" data-h="${c.o/max*H}"></span><span class="x" style="height:0" data-h="${c.th/max*H}"></span></div>`).join("")+
   (long?`<div class="thr" style="bottom:${272000/max*H}px"><span>272K threshold · indigo = priced at long-context rate</span></div>`:"");
  requestAnimationFrame(()=>requestAnimationFrame(()=>el.querySelectorAll("[data-h]").forEach(s=>s.style.height=s.dataset.h+"px")))}
$("p-params").addEventListener("input",()=>pRun(false));$("p-model").addEventListener("change",()=>pRun(true));

/* ---------- customize: overhead ---------- */
const OP=[["ins","Custom instructions (tokens)",0,8000,100,600],["path","Matching path-specific instructions (tokens)",0,4000,100,300],["mcp","Enabled tools (~120 tokens each)",0,80,1,20],["sk","Installed skills (~60-token description each)",0,30,1,8],["req","Requests per developer per day",5,300,5,60]];
$("o-params").innerHTML=OP.map(q=>`<label for="op-${q[0]}">${q[1]}: <b id="ov-${q[0]}">${fmt(q[5])}</b><input type="range" id="op-${q[0]}" min="${q[2]}" max="${q[3]}" step="${q[4]}" value="${q[5]}"></label>`).join("");
opts($("o-model"),SON);
function oRun(){const v={};OP.forEach(q=>{v[q[0]]=+$("op-"+q[0]).value;$("ov-"+q[0]).textContent=fmt(v[q[0]])});const m=MODELS[+$("o-model").value];
  const parts=[["custom instructions",v.ins],["path-specific instructions",v.path],["tool definitions",v.mcp*120],["skill descriptions",v.sk*60]];
  const per=parts.reduce((a,p)=>a+p[1],0),day=per*v.req,mon=day*21;
  setv($("o-req"),per);setv($("o-day"),day);setv($("o-mon"),crOf(m,mon,0,0),1);setv($("o-mon2"),crOf(m,mon*.2,mon*.8,0),1);
  const big=parts.slice().sort((a,b)=>b[1]-a[1])[0];
  $("o-msg").innerHTML=per?`The biggest item is <b>${big[0]}</b> at ${fmt(big[1])} tokens per request. Over 21 working days that’s ${fmt(big[1]*v.req*21)} tokens for one developer. This overhead usually still pays off if it stops the agent exploring; keep it as small as it can be while staying useful.`:"No overhead: every request starts from zero, so the agent has to discover your project each time."}
$("o-params").addEventListener("input",oRun);$("o-model").addEventListener("change",oRun);

/* ---------- hooks ---------- */
async function hRun(anim){const ok=guard("h");["h1","h2","h3"].forEach(i=>$(i).classList.remove("on"));
  if(!anim){setv($("h2v"),9000);setv($("h3v"),400);setv($("h-save5"),51600);return}
  setv($("h2v"),0);setv($("h3v"),0);setv($("h-save5"),0);$("h1").classList.add("on");await sleep(600);if(!ok())return;
  $("h2").classList.add("on");tween($("h2v"),9000,{ms:900});await sleep(1100);if(!ok())return;
  $("h3").classList.add("on");setv($("h3v"),9000);tween($("h3v"),400,{ms:900});await sleep(1000);if(!ok())return;tween($("h-save5"),51600,{ms:900})}
$("h-play").onclick=()=>hRun(true);

/* ---------- one project, five setups ---------- */
// Each stage: calls list [kind, label, role]; kinds: x = exploring/redo, w = work, s = skill, h = hook
const STAGES=[
 {key:"none",name:"Nothing set up",what:"No instructions, no custom agents, no skills, no hooks. One general agent with every tool enabled, one model for everything.",
  adds:"Nothing", saves:"Nothing",
  tools:4000,instr:0,skd:0,tool:3500,red:1.5,mix:false,
  calls:[["x","List folders"],["x","Read README"],["x","Read 4 controllers to learn style"],["x","Find the test project"],["x","Guess validation library"],["w","Plan the change"],["w","Write endpoint"],["w","Write validator"],["x","Run tests: wrong command"],["x","Fix test command"],["w","Write unit tests"],["x","Tests fail: wrong mocking style"],["x","Rewrite tests"],["w","Run tests: pass"]],
  retry:"About 1 in 2 tasks like this needs a second attempt: the agent guessed conventions and got some wrong. Redo factor ×1.5."},
 {key:"inst",name:"+ Instructions",what:"Add a short .github/copilot-instructions.md: stack, folder map, build and test commands, the validation library, test conventions.",
  adds:"~600 tokens on every request", saves:"Exploring the repo and wrong guesses",
  tools:4000,instr:600,skd:0,tool:3000,red:1.25,mix:false,
  calls:[["x","Read 2 controllers for style"],["w","Plan the change"],["w","Write endpoint"],["w","Write validator"],["w","Write unit tests"],["w","Run dotnet test"],["x","Fix a mocking detail"],["w","Run tests: pass"],["w","Summarize"],["w","Self-review"]],
  retry:"The map removes most guessing. Roughly 1 in 4 tasks still needs a redo. Redo factor ×1.25."},
 {key:"agents",name:"+ Custom agents",what:"Add three agents: a planner (read-only tools, reasoning model), an implementer (edit and run tools, mid-tier model) and a test-writer (light model).",
  adds:"A short agent prompt per call", saves:"Tool definitions (each agent sees only its tools) and money (each job on the right-sized model)",
  tools:1500,instr:600,skd:0,tool:3000,red:1.2,mix:true,
  calls:[["w","Planner: read 2 files","plan"],["w","Planner: write plan","plan"],["w","Implementer: endpoint","impl"],["w","Implementer: validator","impl"],["w","Test-writer: tests","test"],["w","Test-writer: run tests","test"],["x","Test-writer: fix mock","test"],["w","Implementer: run all tests","impl"],["w","Summarize","impl"]],
  retry:"Focused agents with fewer tools drift less. Redo factor ×1.2."},
 {key:"skills",name:"+ Skills",what:"Add two skills: unit-tests (how this team writes and runs tests) and api-endpoint (route, validation and ProblemDetails pattern). Only their descriptions sit in context until needed.",
  adds:"~120 tokens of skill descriptions; ~1,200 tokens when a skill loads", saves:"Test and pattern mistakes, so fewer fix-up calls",
  tools:1500,instr:600,skd:120,tool:3000,red:1.1,mix:true,
  calls:[["w","Planner: read 2 files","plan"],["w","Planner: write plan","plan"],["s","Load api-endpoint skill","impl"],["w","Implementer: endpoint + validator","impl"],["s","Load unit-tests skill","test"],["w","Test-writer: tests","test"],["w","Test-writer: run tests: pass","test"],["w","Summarize","impl"]],
  retry:"The agent follows the team’s exact recipe first time. Redo factor ×1.1."},
 {key:"hooks",name:"+ Hooks",what:"Add two hooks: preToolUse blocks reading bin/, obj/ and generated files; a test-output hook keeps only failures and the summary instead of the full log.",
  adds:"0 model tokens to run (they’re commands); a few tokens when they report back", saves:"Tool output re-sent on every later call",
  tools:1500,instr:600,skd:120,tool:1500,red:1.05,mix:true,
  calls:[["w","Planner: read 2 files","plan"],["w","Planner: write plan","plan"],["s","Load api-endpoint skill","impl"],["h","Blocked: read obj/ files","impl"],["w","Implementer: endpoint + validator","impl"],["s","Load unit-tests skill","test"],["w","Test-writer: tests","test"],["h","Run tests: log trimmed to failures","test"]],
  retry:"Smaller tool outputs keep context small and the agent on track. Redo factor ×1.05."}];
const ROLE={plan:MI("Claude Opus 5.5"),impl:MI("Claude Sonnet 5.5"),test:MI("Claude Haiku 5.5")};
opts($("j-model"),SON);
function stageCalc(st){const single=MODELS[+$("j-model").value];let inTot=0,outTot=0,cr=0,ctx=2000+st.tools+st.instr+st.skd+150+3000,loaded=0;
  st.calls.forEach((c,k)=>{if(c[0]==="s")loaded+=1200;const tout=c[0]==="h"?300:st.tool,o=700;
    const callIn=ctx+loaded+st._grow;st._grow+=tout+o;const m=st.mix&&c[2]?MODELS[ROLE[c[2]]]:single;
    inTot+=callIn;outTot+=o;cr+=crOf(m,callIn,0,o)});
  return {n:st.calls.length,in:Math.round(inTot*st.red),out:Math.round(outTot*st.red),cr:cr*st.red}}
function stageRes(st){st._grow=0;return stageCalc(st)}
let jcur=0;
$("j-stages").innerHTML=STAGES.map((s,i)=>`<button type="button" data-j="${i}" aria-pressed="${i===0}"><b>${i+1}</b>${s.name}</button>`).join("");
$("j-stages").onclick=e=>{const b=e.target.closest("button");if(!b)return;jcur=+b.dataset.j;jShow(true)};
function jShow(anim){document.querySelectorAll("#j-stages button").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.j===jcur));
  const st=STAGES[jcur];$("j-title").textContent=st.name;$("j-what").textContent=st.what;$("j-adds").textContent=st.adds;$("j-saves").textContent=st.saves;$("j-retry").textContent=st.retry;
  jRun(anim);jTable()}
async function jRun(anim){const ok=guard("j"),st=STAGES[jcur],r=stageRes(st),box=$("j-calls");box.innerHTML="";
  ["j-n","j-in","j-out","j-cr"].forEach(i=>setv($(i),0));
  for(let k=0;k<st.calls.length;k++){if(!ok())return;const c=st.calls[k],d=document.createElement("div");d.className="cl "+c[0];
    d.innerHTML=`<span>${k+1}</span><b></b>${st.mix&&c[2]?`<em>${{plan:"planner",impl:"implementer",test:"test-writer"}[c[2]]}</em>`:""}`;d.querySelector("b").textContent=c[1];box.append(d);
    setv($("j-n"),k+1);if(anim)await sleep(260)}
  if(anim){tween($("j-in"),r.in);tween($("j-out"),r.out);tween($("j-cr"),r.cr,{dec:1})}else{setv($("j-in"),r.in);setv($("j-out"),r.out);setv($("j-cr"),r.cr,1)}}
function jTable(){const rs=STAGES.map(stageRes),max=Math.max(...rs.map(r=>r.cr));
  $("j-table").innerHTML=`<tr><th>Setup</th><th class="r">Calls</th><th class="r">Input tokens</th><th class="r">Output tokens</th><th class="r">Redo factor</th><th class="r">AI Credits</th><th class="r">vs nothing</th></tr>`+
   STAGES.map((s,i)=>`<tr class="${i===jcur?"sel":""}"><td><b>${i+1}. ${s.name}</b></td><td class="r">${s.calls.length}</td><td class="r">${fmt(rs[i].in)}</td><td class="r">${fmt(rs[i].out)}</td><td class="r">×${s.red}</td><td class="r"><b>${fmt(rs[i].cr,1)}</b></td><td class="r">${i?"−"+fmt((1-rs[i].cr/rs[0].cr)*100)+"%":"—"}</td></tr>`).join("");
  $("j-bars").innerHTML=STAGES.map((s,i)=>`<div class="jb${i===jcur?" on":""}"><span>${s.name}</span><div class="tr"><div class="fl" style="width:${rs[i].cr/max*100}%"></div></div><span class="num">${fmt(rs[i].cr,1)} cr</span></div>`).join("")}
$("j-play").onclick=()=>jRun(true);$("j-model").addEventListener("change",()=>jShow(false));

/* ---------- writing guide ---------- */
const PICK=[["Every request in this repo should know it (stack, commands, rules)","inst","Use <b>custom instructions</b>: a short map in <code>.github/copilot-instructions.md</code>. It rides on every request, so keep it small."],
 ["Only some files or folders need these rules","path","Use <b>path-specific instructions</b>: <code>.github/instructions/*.instructions.md</code> with an <code>applyTo</code> pattern, so the rules load only for matching files."],
 ["Only some tasks need a detailed recipe","skill","Use a <b>skill</b>: <code>.github/skills/&lt;name&gt;/SKILL.md</code>. The description decides when it loads; the steps cost tokens only then."],
 ["I want a specialist with its own tools, model or role","agent","Use a <b>custom agent</b>: <code>.github/agents/&lt;name&gt;.md</code> with a clear description and a short tool list."],
 ["Something must always happen automatically, or a rule must be enforced","hook","Use a <b>hook</b>: <code>.github/hooks/*.json</code> runs your command at a set moment, like before a tool runs. It doesn’t rely on the model remembering."],
 ["I keep typing the same prompt","prompt","Use a <b>prompt file</b>: <code>.github/prompts/&lt;name&gt;.prompt.md</code>. Run it when you need it; it costs nothing otherwise."]];
$("pick").innerHTML=PICK.map((p,i)=>`<button type="button" data-p="${i}">${p[0]}</button>`).join("");
$("pick").onclick=e=>{const b=e.target.closest("button");if(!b)return;document.querySelectorAll("#pick button").forEach(x=>x.classList.toggle("on",x===b));const p=PICK[b.dataset.p];$("pick-out").innerHTML=p[2];
  const t=GUIDE.findIndex(g=>g.key===p[1]);if(t>=0)gShow(t)};
const GUIDE=[
 {key:"inst",tab:"📘 Instructions",title:"Custom instructions",file:".github/copilot-instructions.md",
  what:"Plain Markdown that Copilot adds to every chat and agent request in the repository. Think of it as the one-page map a new teammate would need.",
  cost:"Paid on every request, so every line has a cost. A 600-token file × 60 requests a day is 36,000 tokens a day per developer.",
  tpl:`# Orders API

## Stack
- .NET 8, ASP.NET Core minimal APIs, EF Core (SQL Server)
- Tests: xUnit + Moq; shared fixtures in tests/TestBase.cs

## Commands
- Build: dotnet build
- Test: dotnet test tests/Orders.Tests

## Layout
- src/Api: endpoints · src/Domain: entities and rules · tests/

## Rules
- Validate requests with FluentValidation
- Errors return ProblemDetails; no exceptions for control flow
- Never edit generated/ or Migrations/

## How to answer
- Show diffs, not whole files. Be concise.`,
  dos:["Keep it to one screen: stack, commands, folder map, real pitfalls","Write rules the agent actually broke (from real mistakes)","Include exact build and test commands","Ask for concise answers and diffs","Review it when the project changes"],
  donts:["Paste architecture docs or long guidelines","Copy AI-generated advice that doesn’t match your code","Add one-off preferences","Repeat what the code already shows clearly","Put task-specific recipes here (use skills)"]},
 {key:"agent",tab:"🤖 Custom agents",title:"Custom agents",file:".github/agents/test-writer.md",
  what:"A specialist profile: a description (required) that says when to use it, an optional tool list and model, and a Markdown prompt. Select it yourself, or let Copilot pick it from the description.",
  cost:"Its prompt is sent while the agent is in use. A short tool list cuts tool definitions from every call, and a lighter model makes routine work cheaper.",
  tpl:`---
name: test-writer
description: Writes and fixes xUnit unit tests for the Orders API. Use when asked to add, repair or extend unit tests.
tools: ["read", "search", "edit", "execute"]
---

You write unit tests for the Orders API.

- Use xUnit and Moq. Reuse fixtures from tests/TestBase.cs.
- One behaviour per test. Name tests Method_Condition_Result.
- Run: dotnet test tests/Orders.Tests
- Stop when the new tests pass. Do not change production code;
  if a test exposes a bug, report it instead.`,
  dos:["Give each agent one job and say when to use it in the description","List only the tools it needs (read-only for planners and reviewers)","Say exactly when it is done","Put cheaper models on routine roles where your setup allows choosing","Keep the prompt short and specific"],
  donts:["Create a “do everything” agent with all tools","Write a vague description: it decides when the agent is picked","Duplicate the repository instructions inside every agent","Let a reviewer agent have edit tools","Chain many agents for a small task"]},
 {key:"skill",tab:"🧰 Skills",title:"Agent skills",file:".github/skills/unit-tests/SKILL.md",
  what:"A folder with a SKILL.md (and optional scripts or examples). Copilot decides to use a skill from your prompt and the skill’s description, then loads its SKILL.md into context. Works in agent mode, Copilot CLI, the cloud agent and code review.",
  cost:"Only when selected. Detailed procedures can live here without being sent on every request.",
  tpl:`---
name: unit-tests
description: How this team writes and runs xUnit tests for the Orders API. Use when writing, fixing or reviewing unit tests.
---

# Writing unit tests

1. Find the class under test and its existing test file in tests/.
2. Inherit from TestBase to get the mocked repository and clock.
3. Cover: the happy path, invalid input (expect 400), not found (404).
4. Name tests Method_Condition_Result.
5. Run: dotnet test tests/Orders.Tests --filter <ClassName>
6. Done when the new tests pass; report any production bug found.

See examples/OrderServiceTests.cs for the expected style.`,
  dos:["Write the description as “what it does + when to use it”","Name the folder and name field in lowercase-with-hyphens, the same","Use numbered steps and a clear finish line","Put examples and scripts in the skill folder and reference them","One skill per procedure"],
  donts:["Write a vague description (the skill won’t be picked)","Pre-approve shell or bash in allowed-tools unless you trust the scripts","Copy the whole team wiki into one skill","Repeat repository instructions inside the skill","Rely on a skill for rules that must always apply (use instructions or a hook)"]},
 {key:"hook",tab:"🪝 Hooks",title:"Hooks",file:".github/hooks/guard.json",
  what:"Your own commands that run at set moments in an agent session: before or after a tool runs, when a session starts, when the agent stops. They run outside the model, so running them uses no model tokens. Supported in Copilot CLI and Copilot cloud agent (preview in VS Code). The template is illustrative: check the hooks reference for the exact input and output fields.",
  cost:"Zero model tokens to run. Tokens only when a hook adds context (for example sessionStart’s additionalContext). Used well, they reduce tokens by stopping waste.",
  tpl:`// .github/hooks/guard.json
{
  "version": 1,
  "hooks": {
    "preToolUse": [
      { "type": "command",
        "bash": "./.github/hooks/scripts/block-generated.sh",
        "timeoutSec": 10 }
    ]
  }
}

# .github/hooks/scripts/block-generated.sh
#!/usr/bin/env bash
input=$(cat)                       # hook input arrives as JSON on stdin
args=$(echo "$input" | jq -r '.toolArgs // ""')
if echo "$args" | grep -Eq '/(bin|obj|node_modules|Migrations)/'; then
  echo '{"permissionDecision":"deny","permissionDecisionReason":"Generated or vendor files. Read the source in src/ instead."}'
else
  echo '{"permissionDecision":"allow"}'
fi`,
  dos:["Use preToolUse to block reads of generated, vendor or huge files","Use postToolUse to shorten noisy tool results (see the hooks reference for output fields)","Keep hooks fast and set timeoutSec","Return a clear reason when you deny, so the agent changes course","Test the script by hand with sample JSON before committing"],
  donts:["Inject large context in sessionStart: it’s paid in every session","Let a hook crash: a failing preToolUse hook denies the tool call","Use hooks for advice the model should weigh (use instructions)","Put secrets in hook scripts","Assume every surface runs hooks (check Copilot CLI and cloud agent support)"]}];
$("gtabs").innerHTML=GUIDE.map((g,i)=>`<button type="button" role="tab" data-g="${i}" aria-pressed="${i===0}">${g.tab}</button>`).join("");
$("gtabs").onclick=e=>{const b=e.target.closest("button");if(b)gShow(+b.dataset.g)};
function gShow(i){document.querySelectorAll("#gtabs button").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.g===i));const g=GUIDE[i];
  $("gbody").innerHTML=`<div class="gwrap"><div class="gtext"><h3 class="h2">${g.title}</h3><p>${g.what}</p><div class="explain"><b>Token cost:</b> ${g.cost}</div>
   <div class="dd"><div class="do"><h3>✓ Do</h3><ul>${g.dos.map(x=>`<li>${x}</li>`).join("")}</ul></div><div class="dont"><h3>✗ Don’t</h3><ul>${g.donts.map(x=>`<li>${x}</li>`).join("")}</ul></div></div></div>
   <div class="gcode"><div class="ctl"><span class="small mono">${g.file}</span><button class="btn btn-outline btn-sm" type="button" id="g-copy">Copy</button></div><pre class="outbox" id="g-tpl"></pre><span class="small">Template: <b class="num">${fmt(tokO(g.tpl))}</b> tokens (o200k).</span></div></div>`;
  $("g-tpl").textContent=g.tpl;
  $("g-copy").onclick=async()=>{try{await navigator.clipboard.writeText(g.tpl);$("g-copy").textContent="Copied"}catch(e){const r=document.createRange();r.selectNodeContents($("g-tpl"));const s=getSelection();s.removeAllRanges();s.addRange(r);$("g-copy").textContent="Selected, press Ctrl+C"}}}
gShow(0);jShow(false);

/* ================= billing & scenarios ================= */
const WRITE=Object.fromEntries(DATA.models.filter(m=>m.write).map(m=>[m.name,m.write]));

/* 1 PRU */
const LEG=[["Claude Haiku 4.5",.33],["GPT-4o",.33],["GPT-5.1-Codex-Mini",.33],["MAI-Code-1.1-Flash",.25],["GPT-5.1",3],["GPT-5.1-Codex",3],["GPT-5.3-Codex",6],["Gemini 3 Pro",6],["Claude Sonnet 4.6",9],["Claude Opus 4.8",27]];
$("pr-model").innerHTML=LEG.map((l,i)=>`<option value="${i}">${l[0]} · ×${l[1]}</option>`).join("");$("pr-model").value=8;
function prRun(){const m=LEG[+$("pr-model").value][1],n=+$("pr-n").value,cr=+$("pr-cr").value,plan=+$("pr-plan").value;
  $("pr-nv").textContent=n;$("pr-crv").textContent=cr;const used=n*m+cr*13,over=Math.max(0,used-plan);
  setv($("pr-used"),used,used%1?1:0);$("pr-over").textContent="$"+fmt(over*0.04,2);
  const pct=Math.min(used/plan,1.6);$("pr-fill").style.height=Math.min(100,pct/1.6*100)+"%";$("pr-fill").classList.toggle("over",used>plan);
  document.querySelector(".bline").style.bottom=(1/1.6*100)+"%";$("pr-lab").textContent=`${fmt(used,used%1?1:0)} of ${fmt(plan)} · ${n} prompts × ${m} + ${cr} reviews × 13`}
["pr-model","pr-plan","pr-n","pr-cr"].forEach(id=>$(id).addEventListener("input",prRun));

/* 2 why */
const S46=MODELS[MI("Claude Sonnet 4.6")];
const whyA=crOf(S46,2000,0,300),whyB=crOf(S46,4500000*.15,4500000*.85,90000);
async function whyRun(anim){const ok=guard("why");const set=(id,w)=>$(id).style.width=w+"%";
  ["why-a1","why-a2","why-b1","why-b2"].forEach(i=>set(i,0));if(anim)await sleep(150);if(!ok())return;
  set("why-a1",50);set("why-b1",50);$("why-a1v").textContent="9 PRU";$("why-b1v").textContent="9 PRU";if(anim)await sleep(900);if(!ok())return;
  set("why-a2",Math.max(.6,whyA/whyB*100));set("why-b2",100);$("why-a2v").textContent=fmt(whyA,2)+" cr";$("why-b2v").textContent=fmt(whyB,0)+" cr"}
$("why-play").onclick=()=>whyRun(true);

/* 4 real costs */
const TASKS=[["Quick question",2000,300],["Generate a small function",4000,600],["Bug fix, 3-turn chat",45000,3000],["Feature with agent mode, 20 calls",600000,15000],["Long chat, 30 turns",900000,30000]];
const RCM=["GPT-6 Luna","Claude Haiku 5.5","Claude Sonnet 5.5","GPT-6.1 Sol","Claude Opus 5.5","GPT-6 Astra"].map(MI);
$("rc-table").innerHTML=`<tr><th>Task</th><th class="r">Tokens in / out</th>${RCM.map(i=>`<th class="r">${MODELS[i][0]}</th>`).join("")}</tr>`+
  TASKS.map(t=>`<tr><td><b>${t[0]}</b></td><td class="r">${fmt(t[1])} / ${fmt(t[2])}</td>${RCM.map(i=>{const c=crOf(MODELS[i],t[1],0,t[2]);return `<td class="r">${fmt(c,c<10?2:0)}<br><span class="small">$${fmt(c/100,c<100?3:2)}</span></td>`}).join("")}</tr>`).join("");

/* 5 model prices */
const MP=[["GPT-6.1 Sol","replaces GPT‑5.5","—"],["GPT-5.6 Sol","above 272K input: $8 / $30","—"],["Claude Opus 5.5","","—"],["Claude Opus 4.8","","×27"],["Claude Sonnet 5.5","","—"],["Claude Sonnet 4.6","","×9"]];
$("mp-table").innerHTML=`<tr><th>Model</th><th class="r">Input</th><th class="r">Cached</th><th class="r">Cache write</th><th class="r">Output</th><th class="r">Legacy multiplier</th><th>Note</th></tr>`+
  MP.map(p=>{const m=MODELS[MI(p[0])];return `<tr><td><b>${p[0]}</b></td><td class="r">$${m[1].toFixed(2)}</td><td class="r">$${m[2].toFixed(2)}</td><td class="r">$${(WRITE[p[0]]||0).toFixed(2)}</td><td class="r">$${m[3].toFixed(2)}</td><td class="r">${p[2]}</td><td class="small">${p[1]}</td></tr>`}).join("");
$("mp-bars").innerHTML=MP.map(p=>`<div class="mr"><span>${p[0]}</span><div class="tr"><div class="fl" id="mp-${MI(p[0])}"></div></div><span class="v num" id="mpv-${MI(p[0])}">0</span></div>`).join("");
async function mpRun(anim){const ok=guard("mp"),vals=MP.map(p=>[MI(p[0]),crOf(MODELS[MI(p[0])],12000,0,800)]),max=Math.max(...vals.map(v=>v[1]));
  vals.forEach(v=>{$("mp-"+v[0]).style.width="0";setv($("mpv-"+v[0]),0,2," cr")});if(anim)await sleep(80);
  for(const v of vals){if(!ok())return;$("mp-"+v[0]).style.width=v[1]/max*100+"%";anim?tween($("mpv-"+v[0]),v[1],{dec:2,suf:" cr",ms:700}):setv($("mpv-"+v[0]),v[1],2," cr");if(anim)await sleep(220)}}
$("mp-play").onclick=()=>mpRun(true);

/* 6 agent */
const AG2=["Plan","Read OrderController","Read DiscountService","Search for tests","Read test file","Write endpoint","Write validator","Run build","Fix build error","Write tests","Run tests","Read failure log","Fix test","Run tests","Read failure log","Fix mock setup","Run tests: pass","Run all tests","Self-review diff","Summarize"];
async function ag2Run(anim){const ok=guard("ag2"),box=$("ag2-calls");box.innerHTML="";let tin=0,tout=0,ctx=14000;
  setv($("ag2-n"),0);setv($("ag2-in"),0);setv($("ag2-cr"),0,1);
  for(let i=0;i<AG2.length;i++){if(!ok())return;tin+=ctx;tout+=700;const d=document.createElement("div");d.className="agc"+(/Fix|failure/.test(AG2[i])?" x":"");
    d.innerHTML=`<span>${i+1}</span><b></b><em>${fmt(ctx/1000,1)}K</em>`;d.querySelector("b").textContent=AG2[i];box.append(d);
    ctx+=/log|Read/.test(AG2[i])?4000:2000;setv($("ag2-n"),i+1);setv($("ag2-in"),tin);setv($("ag2-cr"),crOf(MODELS[SON],tin,0,tout),1);if(anim)await sleep(180)}}
$("ag2-play").onclick=()=>ag2Run(true);

/* 7 team calculator */
const TC=[["devs","Developers",1,200,1,25],["q","Quick questions per dev per day",0,60,1,15],["ch","Chat sessions per dev per day (≈30K in / 2K out)",0,20,1,4],["ag","Agent tasks per dev per day (≈300K in / 8K out)",0,10,1,2],["cache","Share of input from cache (%)",0,90,5,60]];
$("tc-params").innerHTML=TC.map(q=>`<label for="tc-${q[0]}">${q[1]}: <b id="tcv-${q[0]}">${q[5]}</b><input type="range" id="tc-${q[0]}" min="${q[2]}" max="${q[3]}" step="${q[4]}" value="${q[5]}"></label>`).join("");
opts($("tc-model"),SON);
function tcRun(){const v={};TC.forEach(q=>{v[q[0]]=+$("tc-"+q[0]).value;$("tcv-"+q[0]).textContent=v[q[0]]});const m=MODELS[+$("tc-model").value],c=v.cache/100;
  const day=v.q*crOf(m,2000,0,300)+v.ch*crOf(m,30000*(1-c),30000*c,2000)+v.ag*crOf(m,300000*(1-c),300000*c,8000);
  const dev=day*21,team=dev*v.devs,pool=v.devs*+$("tc-plan").value,over=Math.max(0,team-pool);
  setv($("tc-dev"),dev);setv($("tc-team"),team);setv($("tc-pool"),pool);$("tc-over").textContent="$"+fmt(over/100,0);
  const pct=team/pool*100;$("tc-fill").style.width=Math.min(100,pct)+"%";$("tc-fill").classList.toggle("over",pct>100);$("tc-pct").textContent=fmt(pct,0)+"% of the pool used"}
$("tc-params").addEventListener("input",tcRun);["tc-model","tc-plan"].forEach(id=>$(id).addEventListener("change",tcRun));

/* ---------- scenarios ---------- */
const turns=(n,base,grow,out,cache=0)=>Array.from({length:n},(_,k)=>{const inp=base+k*grow,ca=k?Math.round(cache*(base+(k-1)*grow)):0;return{i:inp-ca,c:ca,o:out,t:0}});
const SCN=[
 {id:"context-bloat",name:"Context bloat",desc:"You attach a whole folder “just in case”. Every turn in that chat carries all of it.",
  bl:"40 files attached (~60K tokens), 8 turns",al:"2 relevant files (~5K tokens), 8 turns",
  b:()=>turns(8,62000,1500,800),a:()=>turns(8,7000,1500,800),fix:"Attach or select only the code the task touches. Use #file for the two files that matter, not the folder."},
 {id:"structured-phrasing",name:"Structured phrasing",desc:"A rambling prompt makes the model guess. Three attempts later, you have the answer a structured prompt would have given first time.",
  bl:"Vague prompt, 3 attempts × 3 turns",al:"Task · context · constraints · done-when, 2 turns",
  b:()=>[...turns(3,6000,2500,1500),...turns(3,6000,2500,1500),...turns(3,6000,2500,1500)],a:()=>turns(2,6200,2000,900),fix:"State the task, the files, the rules and when it’s done. The prompt grows by a sentence; retries disappear."},
 {id:"session-lifecycle",name:"Session lifecycle",desc:"One chat used all day for unrelated tasks keeps re-sending the whole history.",
  bl:"One 30-turn session",al:"Three focused 10-turn sessions, each starting with a short summary",
  b:()=>turns(30,6000,3000,800),a:()=>[...turns(10,6000,3000,800),...turns(10,7500,3000,800),...turns(10,7500,3000,800)],fix:"New topic, new chat. To continue long work, summarize (or /compact in Copilot CLI) and start fresh."},
 {id:"workflow-modes",name:"Workflow modes",desc:"Agent mode for a simple question explores the repo and loops. Ask mode answers in one call.",
  bl:"Agent mode: 6 calls",al:"Ask mode with the code selected: 1 call",
  b:()=>turns(6,14000,3000,600),a:()=>turns(1,3000,0,400),fix:"Use Ask for questions, Plan for design, Agent for multi-file changes. Pick the mode before you type."},
 {id:"instruction-caching",name:"Instruction caching",desc:"A stable prefix (instructions, tools, files) can be served from cache at 10% of the input price or less. Changing the model or settings mid-session throws the cache away.",
  bl:"Model switched mid-session: no cache",al:"Same model and settings throughout: ~85% cached",
  b:()=>turns(15,12000,2000,700,0),a:()=>turns(15,12000,2000,700,.85),fix:"Choose the model, reasoning level and tools before you start, and keep them for the session."},
 {id:"agents-md-hygiene",name:"AGENTS.md hygiene",desc:"Instructions ride on every request. A 6,000-token file of copied docs costs 10× a 600-token map, on every call.",
  bl:"6,000-token instructions file, 20 calls",al:"600-token map, 20 calls",
  b:()=>turns(20,14000,1500,700),a:()=>turns(20,8600,1500,700),fix:"Keep copilot-instructions.md or AGENTS.md to stack, commands, layout and real pitfalls. Move recipes into skills."},
 {id:"mcp-schema-tax",name:"MCP schema tax",desc:"Every enabled tool sends its definition with every request. A 40-tool server can add 10–15 KB (roughly 2,500–4,000 tokens) per turn.",
  bl:"Full 40-tool MCP server, 20 calls",al:"Only the 4 tools this task needs",
  b:()=>turns(20,11500,2000,700),a:()=>turns(20,8300,2000,700),fix:"Enable only the toolsets the task needs, or give a custom agent a short tool list. Prefer a CLI command for one-off lookups."},
 {id:"subagent-compression",name:"Sub-agent compression",desc:"Exploring 30K tokens of code in the main chat means those 30K ride along on every later turn. A sub-agent explores in its own context and returns a short summary.",
  bl:"Main agent reads 30K of files itself",al:"Sub-agent reads them, returns a 1K summary",
  b:()=>{const a=turns(10,10000,1500,700);a.forEach((c,k)=>{if(k>=2)c.i+=30000});return a},
  a:()=>{const s=turns(3,12000,10000,600).map(c=>({...c,m:"Claude Haiku 5.5"}));const a=turns(10,10000,1500,700);a.forEach((c,k)=>{if(k>=2)c.i+=1000});return[...a.slice(0,2),...s,...a.slice(2)]},
  fix:"Send exploration to a sub-agent on a light model; keep only its summary in the main conversation."},
 {id:"model-routing",name:"Model routing",desc:"The same 12 calls, either all on the most powerful model or each on the model the step needs.",
  bl:"All 12 calls on Claude Opus 5.5",al:"2 planning calls on Opus, 7 on Sonnet 5.5, 3 on Haiku 5.5",
  b:()=>turns(12,14000,3000,700).map(c=>({...c,m:"Claude Opus 5.5"})),a:()=>turns(12,14000,3000,700).map((c,k)=>({...c,m:k<2?"Claude Opus 5.5":k<9?"Claude Sonnet 5.5":"Claude Haiku 5.5"})),
  fix:"Reasoning models for design and hard bugs; mid-tier to implement; light models for tests, docs and formatting. Or use Auto."},
 {id:"reasoning-depth",name:"Reasoning depth",desc:"High reasoning effort writes many hidden thinking tokens, billed as output, before each answer.",
  bl:"High effort: ~8× thinking per answer",al:"Normal effort: ~1× thinking",
  b:()=>turns(6,12000,2000,800).map(c=>({...c,t:6400})),a:()=>turns(6,12000,2000,800).map(c=>({...c,t:800})),fix:"Use normal reasoning by default. Raise it for genuinely hard problems, and set it before the chat starts."},
 {id:"output-control",name:"Output control",desc:"Asking for the whole file back means thousands of output tokens, the priciest kind, and each answer then becomes input for the next turn.",
  bl:"“Rewrite the whole file”, 5 turns",al:"“Show only the changed lines”, 5 turns",
  b:()=>turns(5,10000,6800,6000),a:()=>turns(5,10000,1200,400),fix:"Ask for diffs or changed methods only. Say the format and length you want."}];
let scur=SCN[0];
$("sc-btns").innerHTML=SCN.map(s=>`<button type="button" data-s="${s.id}" aria-pressed="false">${s.name}</button>`).join("");
opts($("sc-model"),SON);
$("sc-btns").onclick=e=>{const b=e.target.closest("button");if(b)scSel(b.dataset.s,true)};
function scCost(calls){const dm=MODELS[+$("sc-model").value];let i=0,o=0,cr=0;calls.forEach(c=>{const m=c.m?MODELS[MI(c.m)]:dm;i+=c.i+c.c;o+=c.o+c.t;cr+=crOf(m,c.i,c.c,c.o+c.t)});return{i,o,cr}}
function scChart(el,calls,max,anim){const H=170;el.innerHTML=calls.map(c=>`<div class="pcol${c.m==="Claude Haiku 5.5"?" lite":""}" title="${fmt(c.i+c.c)} in · ${fmt(c.o+c.t)} out${c.m?" · "+c.m:""}"><span class="i" data-h="${c.i/max*H}"></span><span class="c" data-h="${c.c/max*H}"></span><span class="o" data-h="${c.o/max*H}"></span><span class="x" data-h="${c.t/max*H}"></span></div>`).join("");
  const go=()=>el.querySelectorAll("[data-h]").forEach(s=>s.style.height=s.dataset.h+"px");if(anim)requestAnimationFrame(()=>requestAnimationFrame(go));else{el.querySelectorAll("[data-h]").forEach(s=>s.style.transition="none");go()}}
function scSel(id,anim){scur=SCN.find(s=>s.id===id);document.querySelectorAll("#sc-btns button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.s===id));
  $("sc-title").textContent=scur.name;$("sc-desc").textContent=scur.desc;$("sc-bl").textContent=scur.bl;$("sc-al").textContent=scur.al;$("sc-fix").textContent=scur.fix;scRun(anim)}
function scRun(anim){const b=scur.b(),a=scur.a(),max=Math.max(...[...b,...a].map(c=>c.i+c.c+c.o+c.t));
  scChart($("sc-bc"),b,max,anim);scChart($("sc-ac"),a,max,anim);const cb=scCost(b),ca=scCost(a);
  const line=c=>`<span><b class="num">${b===null?"":fmt(c.i)}</b> input</span><span><b class="num">${fmt(c.o)}</b> output</span><span class="crv"><b class="num">${fmt(c.cr,c.cr<10?2:1)}</b> credits</span>`;
  $("sc-bt").innerHTML=line(cb);$("sc-at").innerHTML=line(ca);const s=(1-ca.cr/cb.cr)*100;
  anim?tween($("sc-save"),s,{suf:"%",ms:800}):setv($("sc-save"),s,0,"%");$("sc-save").dataset.v=s}
$("sc-play").onclick=()=>scRun(true);$("sc-model").addEventListener("change",()=>scRun(true));
$("strat").innerHTML=SCN.map(s=>`<button type="button" data-go="${s.id}"><b>${s.name}</b><span>${s.fix}</span></button>`).join("");
$("strat").onclick=e=>{const b=e.target.closest("[data-go]");if(!b)return;location.hash="scenarios";setTimeout(()=>scSel(b.dataset.go,true),400)};
prRun();whyRun(false);mpRun(false);ag2Run(false);tcRun();scSel("context-bloat",false);

function onTok(){askRun();tplRun();const gb=document.querySelector("#gtabs [aria-pressed=true]");if(gb)gShow(+gb.dataset.g);if(!gauto&&!gbusy&&gi===0)greset()}
onTok();
loadTokenizers().then(()=>{if(alive())onTok()});
pSel("single");oRun();hRun(false);

/* ---------- learn: animated lesson ---------- */
const LCHIP=["#DEECF9","#C7E0F4","#E6F2FB","#B3D6F2","#D3E9F7"];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const LSENT="Copilot counts every token you send.";
function lPieces(s){if(hasTok()){const e=enc();return e.encode(s).map(id=>[e.decode([id]),id])}return split(s).map(t=>[t,idOf(t)])}
function lSentence(el){const d=document.createElement("div");d.className="lsent";
  d.innerHTML=lPieces(LSENT).map((p,i)=>`<span class="lt" data-c="${LCHIP[i%5]}"><span>${esc(p[0])}</span><small>${p[1]}</small></span>`).join("");el.append(d);return d}
const lPaint=c=>{c.style.background=c.dataset.c;c.style.color="#0B1020"};
const LS=[
 {name:"Pieces",tag:"Scene 1 · What a token is",title:"Text is cut into small pieces",
  text:"Before a model reads anything, your text is cut into tokens. A common word is usually one token, often together with the space in front of it. Long or unusual words are split into several pieces.",
  run:async(el,ok)=>{const d=lSentence(el),st=document.createElement("div");st.className="counters";
   st.innerHTML=`<div class="ct"><div class="v">${LSENT.length}</div><div class="l">characters</div></div><div class="ct"><div class="v">${LSENT.split(" ").length}</div><div class="l">words</div></div><div class="ct hot"><div class="v" id="l1t">?</div><div class="l">tokens</div></div>`;el.append(st);
   await sleep(900);if(!ok())return;d.classList.add("cut");const ch=[...d.children];
   for(let i=0;i<ch.length;i++){if(!ok())return;lPaint(ch[i]);$("l1t").textContent=i+1;await sleep(280)}}},
 {name:"Numbers",tag:"Scene 2 · Tokens are numbers",title:"Every piece gets an ID number",
  text:"The model never sees letters. Each token is looked up in a fixed vocabulary and replaced by its ID. OpenAI’s o200k_base vocabulary has about 200,000 entries; other model families use their own.",
  run:async(el,ok)=>{const d=lSentence(el);d.classList.add("cut");const ch=[...d.children];ch.forEach(lPaint);
   const arr=document.createElement("div");arr.className="outbox";arr.textContent="[ ]";el.append(arr);
   const n=document.createElement("span");n.className="small";n.textContent=hasTok()?"Real IDs from the o200k_base tokenizer.":"Illustrative IDs: the tokenizer is still loading.";el.append(n);
   await sleep(700);for(let i=0;i<ch.length;i++){if(!ok())return;ch[i].classList.add("id");
     arr.textContent="[ "+ch.slice(0,i+1).map(c=>c.querySelector("small").textContent).join(", ")+(i<ch.length-1?", …":"")+" ]";await sleep(420)}}},
 {name:"Rule of thumb",tag:"Scene 3 · Rule of thumb",title:"About 4 characters per token",
  text:"For English text, 1 token is roughly 4 characters, or ¾ of a word. So 100 tokens is about 75 words, and 1,000 tokens is about a page and a half.",
  run:async(el,ok)=>{el.innerHTML=`<div class="lmerge" id="l3m">${[..."code"].map(c=>`<span class="ll">${c}</span>`).join("")}</div><div class="leq" id="l3e">4 characters…</div>
   <div class="counters"><div class="ct hot"><div class="v" id="l3a">0</div><div class="l">tokens</div></div><div class="ct"><div class="v" id="l3b">0</div><div class="l">words, roughly</div></div><div class="ct"><div class="v" id="l3c">0</div><div class="l">characters, roughly</div></div></div>`;
   await sleep(900);if(!ok())return;$("l3m").classList.add("join");$("l3e").innerHTML="4 characters ≈ <b>1 token</b> ≈ ¾ of a word";await sleep(1200);
   for(const n of [100,1000]){if(!ok())return;tween($("l3a"),n,{ms:700});tween($("l3b"),n*.75,{ms:700});tween($("l3c"),n*4,{ms:700});await sleep(1700)}}},
 {name:"Code costs more",tag:"Scene 4 · Not all text is equal",title:"Same length, different token counts",
  text:"Code, JSON and logs split into more tokens per character than plain English, because brackets, quotes, dots and indentation are tokens too. These four samples are counted live with the o200k_base tokenizer.",
  run:async(el,ok)=>{const rows=[["English prompt",SAMPLES.prompt],["Dart code",SAMPLES.code],["JSON",SAMPLES.json],["Test log",SAMPLES.log]].map(r=>[r[0],r[1].length,tokO(r[1])]);
   const per=rows.map(r=>r[2]/r[1]*100),max=Math.max(...per);
   el.innerHTML=`<div class="mb">${rows.map((r,i)=>`<div class="mr"><span><b>${r[0]}</b><br><span class="small">${fmt(r[1])} chars · <span id="l4r${i}">…</span></span></span><div class="tr"><div class="fl" id="l4f${i}"></div></div><span class="v num" id="l4v${i}">0</span></div>`).join("")}</div><span class="small">Bar and number = tokens per 100 characters.</span>`;
   await sleep(300);for(let i=0;i<rows.length;i++){if(!ok())return;$("l4f"+i).style.width=per[i]/max*100+"%";tween($("l4v"+i),per[i],{ms:700});$("l4r"+i).textContent=fmt(rows[i][2])+" tokens";await sleep(650)}}},
 {name:"Input",tag:"Scene 5 · Input tokens",title:"Copilot sends much more than your prompt",
  text:"Your 10-token question travels with Copilot’s system instructions, your repository instructions, tool definitions, earlier messages and the files you referenced. All of it counts as input.",
  run:async(el,ok)=>{el.innerHTML=`<div class="lsplit"><div class="lpile" id="l5p"></div><div class="counters" style="grid-template-columns:1fr"><div class="ct hot"><div class="v" id="l5w">0</div><div class="l">input tokens in this request</div></div><div class="ct"><div class="v" id="l5s">100%</div><div class="l">of it is your prompt</div></div></div></div>`;
   let w=0;for(let i=0;i<ITEMS.length;i++){if(!ok())return;const it=ITEMS[i],d=document.createElement("div");d.className="item";d.style.background=it[2];d.style.minHeight=(28+it[3]/4140*44)+"px";if(i===0)d.style.color="#0B1020";
     d.innerHTML=`<b></b><span>${it[1]}</span>`;d.firstChild.textContent=it[0];$("l5p").append(d);w+=it[3];tween($("l5w"),w,{ms:450});$("l5s").textContent=fmt(10/w*100,w>10?2:0)+"%";await sleep(i?700:1000)}}},
 {name:"Output",tag:"Scene 6 · Output tokens",title:"The answer is written one token at a time",
  text:"The model predicts one token, adds it to the end, then predicts the next, until it predicts an end token. Each output token needs its own pass through the model, which is why output costs about 5× input on most models.",
  run:async(el,ok)=>{const out=GS.slice(0,-1).map(c=>c[0][0]);
   el.innerHTML=`<div class="engine"><div class="brain" id="l6b">Model</div><div style="display:flex;flex-direction:column;gap:10px;min-width:0"><div class="seq" id="l6q" style="background:var(--card)"></div>
    <div class="counters"><div class="ct out"><div class="v" id="l6o">0</div><div class="l">output tokens</div></div><div class="ct"><div class="v" id="l6p">0</div><div class="l">passes through the model</div></div></div>
    <div class="fares"><div class="fare" style="background:var(--inS);color:var(--inC)">Input<b>$2</b>per 1M tokens</div><div class="fare" style="background:var(--outS);color:var(--outC)">Output<b>$10</b>per 1M tokens</div></div><span class="small">Rates: Claude Sonnet 5.5.</span></div></div>`;
   await sleep(500);for(let i=0;i<out.length;i++){if(!ok())return;$("l6b").classList.add("on");$("l6b").textContent="Predicting…";await sleep(300);if(!ok())return;
     $("l6q").append(chip(out[i],true));$("l6b").classList.remove("on");$("l6b").textContent="Model";setv($("l6o"),i+1);setv($("l6p"),i+1);await sleep(260)}
   if(ok())$("l6b").textContent="End token: stop"}},
 {name:"Chat history",tag:"Scene 7 · Context window",title:"Every message re-sends the whole chat",
  text:"The model keeps no memory between requests. Each new message carries the whole conversation so far, so a long chat sends far more tokens than you typed. Every model also has a limit on how much fits in one request.",
  run:async(el,ok)=>{const T=[["Copilot’s context",12,"#0B1020"]];for(let k=1;k<=5;k++)T.push([`You: question ${k}`,1,"#2B88D8"],[`Copilot: answer ${k}`,3,"#0078D4"]);
   el.innerHTML=`<div class="lsplit"><div class="lwin" id="l7w"></div><div class="counters" style="grid-template-columns:1fr"><div class="ct"><div class="v" id="l7t">0K</div><div class="l">tokens you typed</div></div><div class="ct"><div class="v" id="l7n">0K</div><div class="l">in the conversation now</div></div><div class="ct hot"><div class="v" id="l7s">0K</div><div class="l">sent in total, across all requests</div></div></div></div>`;
   const w=$("l7w");let now=0,typed=0,sent=0;
   const add=t=>{const d=document.createElement("div");d.className="lmsg";d.style.background=t[2];d.style.height=Math.max(18,t[1]*6.5)+"px";d.textContent=`${t[0]} · ${t[1]}K`;w.append(d);now+=t[1];setv($("l7n"),now,0,"K")};
   add(T[0]);await sleep(800);
   for(let k=1;k<T.length;k+=2){if(!ok())return;add(T[k]);typed+=1;setv($("l7t"),typed,0,"K");w.classList.remove("send");void w.offsetWidth;w.classList.add("send");
     sent+=now;tween($("l7s"),sent,{suf:"K",ms:500});await sleep(850);if(!ok())return;add(T[k+1]);await sleep(450)}}},
 {name:"Cache",tag:"Scene 8 · Cached tokens",title:"Repeated parts are reused at a discount",
  text:"Send a follow-up soon after, and most of the request is identical. That repeated start is read from cache, usually at 10% of the input price or less (5% on Claude Sonnet 5.5). Switching models or coming back after it expires throws the cache away.",
  run:async(el,ok)=>{el.innerHTML=`<div class="trips"><div class="trip"><h3>Request 1</h3><div id="lc1"></div><div class="sum"><span>Cost</span><span class="num" id="lc1s"></span></div></div><div class="trip"><h3>Request 2, a minute later</h3><div id="lc2"></div><div class="sum"><span>Cost</span><span class="num" id="lc2s"></span></div></div></div><span class="small">Input only, Claude Sonnet 5.5: $2 fresh, $0.10 cached per 1M tokens. Teal = read from cache.</span>`;
   trip($("lc1"),false);trip($("lc2"),false);setv($("lc1s"),cost(false),2," cr");setv($("lc2s"),cost(false),2," cr");await sleep(1000);
   for(let i=0;i<5;i++){if(!ok())return;$("lc2-"+i).classList.add("c");await sleep(400)}if(ok())tween($("lc2s"),cost(true),{dec:2,suf:" cr"})}},
 {name:"Cost",tag:"Scene 9 · AI Credits",title:"Tokens × price = AI Credits",
  text:"Each model has its own price per million input, cached and output tokens. Multiply, add, and convert: 1 AI Credit is $0.01. The same request costs very different amounts on different models.",
  run:async(el,ok)=>{const m=MODELS[SON],a=12000*m[1]/1e6*100,b=800*m[3]/1e6*100;
   el.innerHTML=`<div class="frow lform"><div class="pill in lp"><b>12,000 input</b><small>× $${m[1]} per 1M = <span id="l9a">0</span> cr</small></div><span class="op lp">+</span><div class="pill out lp"><b>800 output</b><small>× $${m[3]} per 1M = <span id="l9b">0</span> cr</small></div><span class="op lp">=</span><div class="pill cr lp"><b><span id="l9c">0</span> AI Credits</b><small>on ${m[0]}</small></div></div><div class="mb" id="l9m"></div>`;
   for(const p of el.querySelectorAll(".lp")){if(!ok())return;p.classList.add("show");await sleep(380)}
   tween($("l9a"),a,{dec:1});await sleep(500);if(!ok())return;tween($("l9b"),b,{dec:1});await sleep(500);if(!ok())return;tween($("l9c"),a+b,{dec:1});await sleep(1200);if(!ok())return;
   const L=["GPT-6 Luna","Claude Haiku 5.5","Claude Sonnet 5.5","Claude Opus 5.5","GPT-6 Astra"].map(n=>[n,crOf(MODELS[MI(n)],12000,0,800)]),max=Math.max(...L.map(x=>x[1]));
   $("l9m").innerHTML=`<span class="small"><b>The same request on other models</b></span>`+L.map((x,i)=>`<div class="mr"><span>${x[0]}</span><div class="tr"><div class="fl" id="l9f${i}"></div></div><span class="v num" id="l9v${i}">0</span></div>`).join("");
   await sleep(60);for(let i=0;i<L.length;i++){if(!ok())return;$("l9f"+i).style.width=Math.max(1.5,L[i][1]/max*100)+"%";tween($("l9v"+i),L[i][1],{dec:2,suf:" cr",ms:600});await sleep(320)}}},
 {name:"Recap",tag:"Scene 10 · Recap",title:"Five things to remember",
  text:"That is the whole idea. Paste your own text into the Token calculator to see it split, or open Token scenarios to watch these rules play out in real tasks.",
  run:async(el,ok)=>{const R=[["🧩","Tokens are pieces","About 4 characters, or ¾ of a word."],["📦","Input is the whole parcel","Instructions, tools, history and files all count."],["🚕","Output costs more","About 5× input. Ask for diffs, not whole files."],["⛄","Chats snowball","Each message re-sends the chat. New topic, new chat."],["♻️","Cache saves","Stay on one model during a task."]];
   el.innerHTML=`<div class="lrecap">${R.map(r=>`<div class="mini lp"><span style="font-size:26px" aria-hidden="true">${r[0]}</span><b>${r[1]}</b><span>${r[2]}</span></div>`).join("")}</div>`;
   for(const p of el.querySelectorAll(".lp")){if(!ok())return;p.classList.add("show");await sleep(380)}}}];
const LDWELL=4500;let lcur=0,lauto=false;const lseen=new Set();
$("l-steps").innerHTML=LS.map((s,i)=>`<button type="button" data-l="${i}" aria-pressed="false"><b>${i+1}</b>${s.name}</button>`).join("");
function lBar(ms){const b=$("l-prog");b.style.transition="none";b.style.width="0";if(!ms)return;void b.offsetWidth;b.style.transition=`width ${ms}ms linear`;b.style.width="100%"}
function lStop(){lauto=false;$("l-play").textContent="▶ Play lesson";lBar(0)}
async function lShow(i){lcur=i;const ok=guard("l"),s=LS[i],bar=$("l-steps");lseen.add(i);
  bar.querySelectorAll("button").forEach(b=>{const k=+b.dataset.l;b.setAttribute("aria-pressed",k===i);b.classList.toggle("seen",lseen.has(k)&&k!==i);if(k===i)bar.scrollLeft=b.offsetLeft-(bar.clientWidth-b.offsetWidth)/2});
  $("l-tag").textContent=s.tag;$("l-title").textContent=s.title;$("l-text").textContent=s.text;
  $("l-prev").disabled=i===0;$("l-next").textContent=i===LS.length-1?"Start again ›":"Next ›";
  const el=$("l-stage");el.innerHTML="";lBar(0);el.classList.remove("lin");void el.offsetWidth;el.classList.add("lin");
  await s.run(el,ok);if(!ok()||!lauto)return;lBar(LDWELL);await wait(LDWELL);if(!ok()||!lauto)return;
  if(i<LS.length-1)lShow(i+1);else lStop()}
$("l-play").onclick=()=>{if(lauto){lStop();return}lauto=true;$("l-play").textContent="❚❚ Pause";lShow(lcur===LS.length-1?0:lcur)};
$("l-prev").onclick=()=>{if(lcur>0)lShow(lcur-1)};
$("l-next").onclick=()=>lShow(lcur<LS.length-1?lcur+1:0);
$("l-again").onclick=()=>lShow(lcur);
$("l-steps").onclick=e=>{const b=e.target.closest("button");if(b)lShow(+b.dataset.l)};
addEventListener("keydown",e=>{if(!lvis||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
  if(e.key==="ArrowRight"&&lcur<LS.length-1)lShow(lcur+1);if(e.key==="ArrowLeft"&&lcur>0)lShow(lcur-1)},{signal});

/* demos: each shows its end state, and plays only when its button is pressed */
const RUN={1:w1,2:w2,3:w3,4:w4,5:w5,6:w6,7:w7};
Object.values(RUN).forEach(f=>f(false));
document.addEventListener("click",e=>{const b=e.target.closest("[data-play]");if(b)RUN[b.dataset.play](true)},{signal});
addEventListener("resize",()=>w3(false),{signal});
// Optional blocks are laid out while closed, so the ones that measure width redraw on opening.
const onOpen={picture:()=>w3(false),scenarios:()=>scRun(false),project:()=>jShow(false)};
document.querySelectorAll("#ta details.ta-more[id]").forEach(d=>d.addEventListener("toggle",()=>{if(d.open)onOpen[d.id]?.()},{signal}));

/* ---------- a guided course: one step on screen at a time ---------- */
// Every step stays in the HTML (search engines and no-JS readers get the whole
// page); with JavaScript, the reader sees one lesson, a map of all nine, and
// a clear way on. Progress is a per-reader convenience, so it lives in
// localStorage and the page works the same when that is unavailable.
const onFirstView = {
  continue: () => cvRun(),
  patterns: () => pRun(false),
};
const seenStep = {};
const path = $("ta-path");
const steps = [...document.querySelectorAll("#ta .ta-step:not(#faq)")];
const ids = steps.map(s => s.id);
const titleOf = s => s.querySelector(".ta-head h2").textContent.trim();
const KEY = "ta-course-v3";
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const state = Object.assign({ done: [], ans: {}, last: null }, load());
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };
let cur = null;

document.getElementById("ta").classList.add("is-course");

// Back and Next at the foot of every step.
steps.forEach((s, i) => {
  const prev = steps[i - 1], next = steps[i + 1];
  const pager = document.createElement("nav");
  pager.className = "ta-pager";
  pager.setAttribute("aria-label", "Lesson navigation");
  pager.innerHTML =
    (prev ? `<a class="btn btn-outline btn-sm" href="#${prev.id}">← Back</a>` : "<span></span>") +
    `<a class="btn btn-outline btn-sm ta-to-calc" href="#calculator">↑ Back to the calculator</a>` +
    (next
      ? `<a class="btn btn-accent ta-next" href="#${next.id}" data-from="${s.id}"><span>Next: Lesson ${i + 2}</span><b></b><i aria-hidden="true">→</i></a>`
      : `<div class="ta-finish" id="ta-finish"></div>`);
  if (next) pager.querySelector("b").textContent = titleOf(next);
  s.append(pager);
});

// ---- check yourself: a few questions closing each step ----
const qOf = key => { const [id, i] = key.split(":"); return document.querySelectorAll(`#${id} .ta-q`)[+i]; };
const isRight = (key, v) => { const q = qOf(key); return !!q && v === +q.dataset.correct; };
const stepAnswered = step => [...step.querySelectorAll(".ta-q")].every(q => q.dataset.done);
function answer(q, i) {
  q.dataset.done = 1;
  const btns = q.querySelectorAll(".ta-check-opts button"), right = i === +q.dataset.correct;
  btns[i].classList.add(right ? "is-right" : "is-wrong");
  if (!right) btns[+q.dataset.correct].classList.add("is-right");
  btns.forEach(b => (b.disabled = true));
  q.classList.add(right ? "is-right" : "is-wrong");
  q.querySelector(".ta-check-fb").textContent = (right ? "Correct. " : "Not quite. ") + q.dataset.why;
}
function resetQ(q) {
  delete q.dataset.done;
  q.classList.remove("is-right", "is-wrong");
  q.querySelectorAll(".ta-check-opts button").forEach(b => { b.disabled = false; b.classList.remove("is-right", "is-wrong"); });
  q.querySelector(".ta-check-fb").textContent = "";
}
// Live score for a step, and a clear word on whether to move on.
function stepScore(step) {
  const box = step.querySelector(".ta-check");
  if (!box) return;
  const qs = [...box.querySelectorAll(".ta-q")], done = qs.filter(q => q.dataset.done);
  const right = done.filter(q => q.classList.contains("is-right")).length;
  box.querySelector(".ta-check-score").innerHTML = `<b>${done.length}</b> / ${qs.length} answered`;
  const ready = box.querySelector(".ta-ready");
  box.classList.toggle("is-complete", done.length === qs.length);
  if (done.length < qs.length) { ready.innerHTML = ""; return; }
  // Point back to the lessons behind the questions that were missed.
  const missed = qs.filter(q => q.classList.contains("is-wrong")).map(q => q.dataset.from).filter((v, i, a) => v && a.indexOf(v) === i);
  ready.innerHTML = right === qs.length
    ? `<b>🎉 ${right} of ${qs.length} right.</b> You have the whole picture. Put it to use in the <a href="#calculator">calculator</a>.`
    : `<b>${right} of ${qs.length} right.</b> Worth another look: ${missed.map(id => `<a href="#${id}">${document.querySelector(`#${id} h2, #${id} summary`)?.textContent.replace(/optional$/, "").trim() ?? id}</a>`).join(" · ")}.`;
}

// ---- the idea in 3 frames: a looping storyboard beside each answer ----
let storyTimer = null;
function frame(fig, i) {
  fig.querySelectorAll(".ta-frame").forEach((f, k) => f.classList.toggle("is-on", k === i));
  fig.querySelectorAll(".ta-story-dots button").forEach((b, k) => b.toggleAttribute("aria-current", k === i));
  fig.dataset.f = i;
}
function playStory(id) {
  clearInterval(storyTimer);
  const fig = document.querySelector(`#${id} .ta-story`);
  if (!fig) return;
  // Readers step through the frames themselves; nothing moves on its own.
  frame(fig, 0);
}

// ---- a little celebration for a full score ----
function confetti(host, n = 26) {
  if (RM || !host) return;
  host.classList.add("ta-confetti-host");
  const colors = ["#0078d4", "#63b1ee", "#003e70", "#8fcbf7", "#0a7f9e", "#c25e0b"];
  for (let i = 0; i < n; i++) {
    const c = document.createElement("i");
    c.className = "ta-confetti";
    c.style.cssText = `left:${8 + Math.random() * 84}%;background:${colors[i % colors.length]};--dx:${(Math.random() - 0.5) * 240}px;--r:${Math.random() * 720 - 360}deg;animation-delay:${Math.random() * 150}ms`;
    host.append(c);
    setTimeout(() => c.remove(), 1800);
  }
}

// ---- prompt makeover: how people ask, and the best way ----
const mkBox = document.getElementById("makeover");
function mkCount(panel) {
  if (!panel) return;
  const ask = panel.querySelector(".ta-mk-bubble").textContent;
  const best = [...panel.querySelectorAll(".ta-mk-part span")].map(x => x.textContent).join(" ");
  panel.querySelector('[data-tok="ask"]').textContent = `${fmt(tokO(ask))} tokens · usually means guessing and retries`;
  panel.querySelector('[data-tok="best"]').textContent = `${fmt(tokO(best))} tokens · right first time`;
}
function mkShow(id) {
  mkBox.querySelectorAll(".ta-mk-picks button").forEach(b => b.setAttribute("aria-pressed", b.dataset.mk === id));
  mkBox.querySelectorAll(".ta-mk-panel").forEach(x => x.classList.toggle("is-on", x.dataset.mk === id));
  mkCount(mkBox.querySelector(`.ta-mk-panel[data-mk="${id}"]`));
}
if (mkBox) {
  mkBox.querySelectorAll(".ta-mk-panel").forEach(mkCount);
  loadTokenizers().then(() => { if (alive()) mkBox.querySelectorAll(".ta-mk-panel").forEach(mkCount); });
}

// ---- continue the chat, or start fresh? ----
// Next five messages, priced both ways on the default model. Continuing
// re-sends the history: from cache if it is warm, at full price on the first
// message if it has expired. A new chat starts from a 1,000-token summary.
const CV = { time: "warm", topic: "same" };
function cvRun() {
  if (!document.getElementById("cv-turns")) return;
  const T = +$("cv-turns").value, g = +$("cv-grow").value, base = +$("cv-base").value;
  $("cv-turns-v").textContent = fmt(T); $("cv-grow-v").textContent = fmt(g); $("cv-base-v").textContent = fmt(base);
  const m = MODELS[SON], O = 800, S = 1000;
  let a = 0, b = 0, aNext, bNext;
  for (let k = 1; k <= 5; k++) {
    const inA = base + (T + k) * g;
    const caA = k === 1 && CV.time === "cold" ? 0 : base + (T + k - 1) * g;
    a += crOf(m, inA - caA, caA, O);
    const inB = base + S + k * g;
    const caB = k === 1 ? 0 : base + S + (k - 1) * g;
    b += crOf(m, inB - caB, caB, O);
    if (k === 1) { aNext = [inA, caA]; bNext = [inB, caB]; }
  }
  $("cv-a-next").textContent = `Next message: ${fmt(aNext[0])} input tokens, ${fmt(aNext[1])} from cache`;
  $("cv-b-next").textContent = `Next message: ${fmt(bNext[0])} input tokens, ${fmt(bNext[1])} from cache`;
  tween($("cv-a-cr"), a, { dec: 1 }); tween($("cv-b-cr"), b, { dec: 1 });
  const max = Math.max(a, b);
  $("cv-a-bar").style.width = (a / max) * 100 + "%"; $("cv-b-bar").style.width = (b / max) * 100 + "%";
  const fresh = CV.topic === "new" || b < a;
  $("cv-a").classList.toggle("is-best", !fresh); $("cv-b").classList.toggle("is-best", fresh);
  const d = fmt(Math.abs(a - b), 1);
  let v;
  if (CV.topic === "new")
    v = `<b>↻ Start a new chat.</b> The old history has nothing to do with the new question. It would ride along on every message${a > b ? `, costing about ${d} more credits over the next five,` : ""} and it can pull the answers off course.`;
  else if (a <= b)
    v = `<b>✓ Continue this chat.</b> ${CV.time === "warm" ? "The cache serves the history at a fraction of the input price" : "The history is short enough that even full price on the first message is fine"}, and Copilot already knows the task. About ${d} credits cheaper over the next five messages.`;
  else if (CV.time === "cold")
    v = `<b>↻ Summarize, then start fresh.</b> The cache has expired, so the next message would send all ${fmt(aNext[0])} tokens at full price. A new chat with a short summary is about ${d} credits cheaper over the next five.`;
  else
    v = `<b>↻ Compact, or start fresh.</b> The history is so long that even at the cached price it costs more than a fresh start: about ${d} credits over the next five. In Copilot CLI, /compact does this for you.`;
  $("cv-verdict").innerHTML = v;
}
["cv-turns", "cv-grow", "cv-base"].forEach(id => document.getElementById(id)?.addEventListener("input", cvRun, { signal }));
cvRun();

function paint() {
  const done = new Set(state.done);
  path.querySelectorAll("a[data-step]").forEach(a => {
    const id = a.dataset.step, i = ids.indexOf(id);
    if (i < 0) return;
    a.classList.toggle("is-done", done.has(id));
    a.querySelector("b").textContent = done.has(id) ? "✓" : String(i + 1);
    a.toggleAttribute("aria-current", id === cur);
  });
  const pct = Math.round((done.size / ids.length) * 100);
  path.style.setProperty("--p", pct + "%");
  path.title = `${done.size} of ${ids.length} steps done`;
  const fin = document.getElementById("ta-finish");
  if (fin) {
    const answered = Object.keys(state.ans).length, right = Object.entries(state.ans).filter(([k, v]) => isRight(k, v)).length;
    fin.innerHTML = `<b>${done.size === ids.length ? "🎉 Course complete" : `${done.size} of ${ids.length} steps done`}</b>` +
      `<span>${answered ? `${right} of ${answered} check question${answered === 1 ? "" : "s"} right` : "Answer the check questions to see your score"}</span>` +
      `<a class="btn btn-outline btn-sm" href="#faq">Read the FAQ ↓</a>` +
      `<button type="button" class="btn btn-outline btn-sm" id="ta-reset">Start over</button>`;
  }
}
function markDone(id) {
  const fresh = !state.done.includes(id);
  if (fresh) state.done.push(id);
  save();
  paint();
  if (fresh && state.done.length === ids.length) confetti(document.getElementById("ta-finish"), 60);
}

function show(id, { scroll = true } = {}) {
  if (!ids.includes(id)) return;
  if (cur === "learn" && id !== "learn" && lauto) lStop();
  cur = id;
  state.last = id;
  save();
  steps.forEach(s => (s.hidden = s.id !== id));
  paint();
  const a = path.querySelector(`a[data-step="${id}"]`);
  if (a) path.scrollTo({ left: a.offsetLeft - (path.clientWidth - a.offsetWidth) / 2, behavior: RM ? "auto" : "smooth" });
  const step = document.getElementById(id);
  step.classList.remove("is-entering");
  void step.offsetWidth;
  step.classList.add("is-entering");
  if (scroll) step.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" });
  playStory(id);
  if (!seenStep[id]) { seenStep[id] = 1; onFirstView[id]?.(); }
}

// A hash can name a lesson, or anything inside one (#scenarios, #w3): open the
// lesson that holds it, and any optional block around it, and scroll there.
function route({ scroll = true } = {}) {
  const h = decodeURIComponent(location.hash.slice(1));
  if (!h) return false;
  if (ids.includes(h)) { show(h, { scroll }); return true; }
  const el = document.getElementById(h);
  const step = el && el.closest("#ta .ta-step");
  if (step && step.id !== "faq") {
    show(step.id, { scroll: false });
    for (let d = el.closest("details"); d; d = d.parentElement?.closest("details")) d.open = true;
    requestAnimationFrame(() => el.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" }));
    return true;
  }
  return false;
}
addEventListener("hashchange", () => route(), { signal });
addEventListener("popstate", () => { if (!route()) show(firstStep); }, { signal });

// The site's page router takes over same-page # links without a hashchange,
// so links that open a step are handled here first, in the capture phase.
document.addEventListener("click", e => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest('a[href*="#"]');
  if (!a) return;
  const url = new URL(a.href, location.href);
  if (url.pathname !== location.pathname) return;
  const h = decodeURIComponent(url.hash.slice(1));
  const inStep = document.getElementById(h)?.closest("#ta .ta-step:not(#faq)");
  if (!h || !(ids.includes(h) || inStep)) return;
  e.preventDefault();
  if (a.classList.contains("ta-next")) markDone(a.dataset.from);
  history.pushState(null, "", "#" + h);
  route();
}, { signal, capture: true });

document.addEventListener("click", e => {
  const next = e.target.closest(".ta-next");
  if (next) markDone(next.dataset.from);
  const opt = e.target.closest(".ta-check-opts button");
  if (opt) {
    const q = opt.closest(".ta-q"), step = opt.closest(".ta-step");
    const key = `${step.id}:${[...q.parentElement.children].indexOf(q)}`;
    if (!(key in state.ans)) {
      state.ans[key] = +opt.dataset.i;
      answer(q, +opt.dataset.i);
      stepScore(step);
      if (stepAnswered(step)) {
        const qs = [...step.querySelectorAll(".ta-q")];
        if (qs.every(x => x.classList.contains("is-right"))) confetti(step.querySelector(".ta-check"));
        markDone(step.id);
      } else save();
    }
  }
  const mkb = e.target.closest(".ta-mk-picks button");
  if (mkb) mkShow(mkb.dataset.mk);
  const cvb = e.target.closest("[data-cv-time], [data-cv-topic]");
  if (cvb) {
    const key = cvb.dataset.cvTime ? "time" : "topic";
    CV[key] = cvb.dataset.cvTime || cvb.dataset.cvTopic;
    cvb.parentElement.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === cvb));
    cvRun();
  }
  const dot = e.target.closest(".ta-story-dots button");
  if (dot) { clearInterval(storyTimer); frame(dot.closest(".ta-story"), +dot.dataset.f); }
  if (e.target.closest("#ta-reset")) {
    state.done = []; state.ans = {}; state.last = null; save();
    document.querySelectorAll("#ta .ta-q").forEach(resetQ); steps.forEach(stepScore);
    location.hash = ids[0];
  }
}, { signal });

for (const [key, v] of Object.entries(state.ans)) { const q = qOf(key); if (q) answer(q, v); }
steps.forEach(stepScore);
const firstStep = state.last && ids.includes(state.last) ? state.last : ids[0];
if (!route({ scroll: true })) show(firstStep, { scroll: false });

// The lesson plays only when the reader presses Play, and pauses when
// scrolled away so it never runs unseen.
const lessonIO = new IntersectionObserver(([en]) => {
  lvis = en.isIntersecting;
  if (!lvis && lauto) lStop();
}, { threshold: 0.4 });
lessonIO.observe(document.querySelector("#ta .lesson"));
lShow(0);
lStop();

signal.addEventListener("abort", () => { clearInterval(storyTimer); lessonIO.disconnect(); lauto = false; gauto = false; });
}

document.addEventListener('astro:before-swap', () => controller?.abort());
