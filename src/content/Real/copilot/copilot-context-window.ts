import type { ReelSpec } from '../src/types.ts';

/**
 * Reel: LLMs are stateless, so how does Copilot appear to know your codebase?
 *
 * The reel makes one argument — "it never remembered, it re-read" — so the
 * stage is built as a request pipeline across the top (EDITOR, GATHER, PACK,
 * MODEL, SUGGEST) with a scene underneath that zooms into the hot node. The
 * whole reel follows a single concrete completion: `const tax = subtotal *
 * TAX_RATE;`. Stage 4 shows the suffix that demands `tax`, stage 5 shows the
 * open tab that supplied `TAX_RATE`, so the mechanism is watched rather than
 * asserted.
 *
 * Everything named is a real mechanism: fill-in-the-middle prefix/suffix,
 * neighbouring-tab retrieval, the workspace index behind #codebase, a fixed
 * token budget, and transcript replay per chat turn. The token figures in the
 * budget scene are labelled a sample, not a measurement, and the window size is
 * deliberately shown as an example because it differs per model.
 */

const stageHtml = `
    <div class="c-scene" id="c-scene">

      <!-- Opening hook: the assumption every viewer is carrying -->
      <div class="c-hook" id="c-hook">
        <div class="c-hook-l1">Between two requests, an LLM keeps</div>
        <div class="c-hook-big" id="c-hook-big">no memory</div>
        <div class="c-hook-row">
          <span class="c-hook-chip" id="c-hk-1">your repo</span>
          <span class="c-hook-chip" id="c-hk-2">yesterday&rsquo;s chat</span>
          <span class="c-hook-chip" id="c-hk-3">the file you just closed</span>
          <span class="c-hook-chip" id="c-hk-4">your naming style</span>
          <span class="c-hook-chip" id="c-hk-5">the bug you fixed</span>
        </div>
        <div class="c-hook-l2" id="c-hook-l2">It holds none of it &mdash; and still finishes your line.</div>
      </div>

      <!-- Request chrome: one Copilot request, start to finish -->
      <div class="c-top" id="c-top">
        <div class="c-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a4 4 0 0 1 4 4v1h1a4 4 0 0 1 4 4v3a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-3a4 4 0 0 1 4-4h1V7a4 4 0 0 1 4-4Z"/><path d="M9 14v2M15 14v2"/></svg>
        </div>
        <div class="c-proj" id="c-proj">GitHub Copilot &middot; VS Code</div>
        <div class="c-state" id="c-state">idle</div>
      </div>

      <!-- The request pipeline. One node per phase, lit as the story reaches it. -->
      <div class="c-flow" id="c-flow">

        <div class="c-node" id="c-n1">
          <div class="c-ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2.6"/><path d="M3 8.5h18"/><path d="M7 13h6"/></svg>
          </div>
          <div class="c-nm">EDITOR</div>
          <div class="c-ns">file + cursor</div>
        </div>

        <div class="c-node" id="c-n2">
          <div class="c-ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.6-3.6"/></svg>
          </div>
          <div class="c-nm">GATHER</div>
          <div class="c-ns">tabs + index</div>
        </div>

        <div class="c-node" id="c-n3">
          <div class="c-ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/></svg>
          </div>
          <div class="c-nm">PACK</div>
          <div class="c-ns">one window</div>
        </div>

        <div class="c-node" id="c-n4">
          <div class="c-ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="4.5" width="15" height="15" rx="4"/><path d="M9.5 9.5h5v5h-5z"/><path d="M12 4.5V2M12 22v-2.5M4.5 12H2M22 12h-2.5"/></svg>
          </div>
          <div class="c-nm">MODEL</div>
          <div class="c-ns">no memory</div>
        </div>

        <div class="c-node" id="c-n5">
          <div class="c-ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17l9-10"/></svg>
          </div>
          <div class="c-nm">SUGGEST</div>
          <div class="c-ns">then forget</div>
        </div>

        <div class="c-edge" id="c-e1"><i></i></div>
        <div class="c-edge" id="c-e2"><i></i></div>
        <div class="c-edge" id="c-e3"><i></i></div>
        <div class="c-edge" id="c-e4"><i></i></div>
      </div>

      <!-- One scene per stage: the zoomed-in view of the hot pipeline node. -->
      <div class="c-stack" id="c-stack">

        <!-- STAGE 2 · the model is a frozen function -->
        <div class="c-sc" id="c-sc-state">
          <div class="c-reqs">
            <div class="msd-label">Two requests in a row</div>

            <div class="c-req msd-reveal" id="c-rq1">
              <div class="c-rq-h"><span class="c-rq-t">09:14:02</span><span class="c-rq-n">request 1</span></div>
              <div class="c-rq-p">// sort users by last login</div>
              <div class="c-rq-a">users.sort((a, b) =&gt; b.last - a.last)</div>
            </div>

            <div class="c-void" id="c-void">
              <span class="c-void-x">&times;</span>nothing is written back
            </div>

            <div class="c-req msd-reveal" id="c-rq2">
              <div class="c-rq-h"><span class="c-rq-t">09:14:58</span><span class="c-rq-n">request 2</span></div>
              <div class="c-rq-p">// now the same for orders</div>
              <div class="c-rq-a" id="c-rq2-a">the same for <em>what</em>?</div>
            </div>
          </div>

          <div class="c-llm" id="c-llm">
            <div class="c-llm-h">
              <span class="c-badge">the model</span>
              <span class="c-ro" id="c-ro">weights: read-only</span>
            </div>

            <div class="c-io">
              <div class="c-io-l">tokens in</div>
              <div class="c-toks">
                <span class="c-tok" id="c-tk-1">const</span>
                <span class="c-tok" id="c-tk-2">tax</span>
                <span class="c-tok" id="c-tk-3">=</span>
                <span class="c-tok" id="c-tk-4">subtotal</span>
                <span class="c-tok" id="c-tk-5">*</span>
              </div>
            </div>

            <div class="c-pred" id="c-pred">P( next token | everything in the prompt )</div>

            <div class="c-io">
              <div class="c-io-l">one token out</div>
              <div class="c-toks">
                <span class="c-tok c-tok-hot" id="c-tk-out">TAX_RATE</span>
              </div>
            </div>

            <div class="c-llm-f">No database. No session. No file access of its own.</div>
          </div>
        </div>

        <!-- STAGE 3 · the editor assembles a prompt from scratch -->
        <div class="c-sc" id="c-sc-build">
          <div class="c-src" id="c-src">
            <div class="msd-label">Sent with every request</div>
            <div class="c-src-row msd-reveal" id="c-s1"><span class="c-src-i">01</span>the file around your cursor</div>
            <div class="c-src-row msd-reveal" id="c-s2"><span class="c-src-i">02</span>snippets from open tabs</div>
            <div class="c-src-row msd-reveal" id="c-s3"><span class="c-src-i">03</span>imported symbols and types</div>
            <div class="c-src-row msd-reveal" id="c-s4"><span class="c-src-i">04</span>your repo instruction files</div>
            <div class="c-src-row msd-reveal" id="c-s5"><span class="c-src-i">05</span>code from the workspace index</div>
            <div class="c-src-row msd-reveal" id="c-s6"><span class="c-src-i">06</span>the chat transcript so far</div>
            <div class="c-src-f" id="c-src-f">Rebuilt from scratch. Every time.</div>
          </div>

          <div class="c-pay" id="c-pay">
            <div class="c-pay-h">
              <span class="msd-label">The prompt</span>
              <span class="c-pay-b" id="c-pay-b">assembling</span>
            </div>
            <div class="c-pr msd-reveal"><span class="c-key">system</span><span class="c-val">copilot-instructions.md</span></div>
            <div class="c-pr msd-reveal"><span class="c-key">context</span><span class="c-val">// tax.ts &rarr; TAX_RATE</span></div>
            <div class="c-pr msd-reveal"><span class="c-key">prefix</span><span class="c-val">function priceCart(items) {</span></div>
            <div class="c-pr msd-reveal"><span class="c-key">suffix</span><span class="c-val">return { subtotal, tax }</span></div>
            <div class="c-pr msd-reveal"><span class="c-key">history</span><span class="c-val">4 earlier turns</span></div>
            <div class="c-pay-f" id="c-pay-f">One HTTP request. Then the connection closes.</div>
          </div>
        </div>

        <!-- STAGE 4 · fill in the middle -->
        <div class="c-sc" id="c-sc-fim">
          <div class="msd-editor c-ed">
            <div class="bar">
              <i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i>
              <span class="c-file">cart.ts</span>
            </div>
            <div class="body">
              <div class="c-cl c-pre" id="c-cl-1"><span class="ln">1</span><span class="kw">export function</span> <span class="fn">priceCart</span>(items) {</div>
              <div class="c-cl c-pre" id="c-cl-2"><span class="ln">2</span>&nbsp;&nbsp;<span class="kw">const</span> subtotal = items.<span class="fn">reduce</span>(</div>
              <div class="c-cl c-pre" id="c-cl-3"><span class="ln">3</span>&nbsp;&nbsp;&nbsp;&nbsp;(s, i) =&gt; s + i.price * i.qty, <span class="st">0</span>);</div>
              <div class="c-cl c-cur" id="c-cl-4"><span class="ln">4</span>&nbsp;&nbsp;<span class="ghost" id="c-ghost"></span><span class="cursor"></span></div>
              <div class="c-cl c-suf" id="c-cl-5"><span class="ln">5</span></div>
              <div class="c-cl c-suf" id="c-cl-6"><span class="ln">6</span>&nbsp;&nbsp;<span class="kw">return</span> { subtotal, tax, total };</div>
              <div class="c-cl c-suf" id="c-cl-7"><span class="ln">7</span>}</div>
            </div>
          </div>

          <div class="c-fim">
            <div class="c-fb" id="c-fb-1">
              <b>PREFIX</b><span>everything above the cursor</span>
            </div>
            <div class="c-fb" id="c-fb-2">
              <b>SUFFIX</b><span>everything below it &mdash; this is where <i>tax</i> is demanded</span>
            </div>
            <div class="c-fb c-fb-out" id="c-fb-3">
              <b>MIDDLE</b><span>the only part the model writes</span>
            </div>
          </div>

          <div class="c-ask" id="c-ask"><span>but where did <em>TAX_RATE</em> come from?</span></div>
        </div>

        <!-- STAGE 5 · neighbouring tabs -->
        <div class="c-sc" id="c-sc-tabs">
          <div class="c-tabbar" id="c-tabbar">
            <span class="c-tab c-tab-on">cart.ts</span>
            <span class="c-tab" id="c-tb-1">tax.ts</span>
            <span class="c-tab" id="c-tb-2">useCart.tsx</span>
            <span class="c-tab" id="c-tb-3">orders.ts</span>
            <span class="c-tab c-tab-off" id="c-tb-4">README.md</span>
          </div>

          <div class="c-snips">
            <div class="c-snip" id="c-sn-1">
              <div class="c-sn-f">tax.ts</div>
              <div class="c-sn-c"><span class="kw">export const</span> TAX_RATE = <span class="st">0.0825</span>;</div>
              <div class="c-sn-m"><span class="c-sn-t"><i id="c-sm-1"></i></span><span class="c-sn-v">0.91</span></div>
            </div>
            <div class="c-snip" id="c-sn-2">
              <div class="c-sn-f">useCart.tsx</div>
              <div class="c-sn-c"><span class="kw">const</span> { subtotal } = <span class="fn">priceCart</span>(items);</div>
              <div class="c-sn-m"><span class="c-sn-t"><i id="c-sm-2"></i></span><span class="c-sn-v">0.62</span></div>
            </div>
            <div class="c-snip" id="c-sn-3">
              <div class="c-sn-f">orders.ts</div>
              <div class="c-sn-c"><span class="kw">function</span> <span class="fn">shipping</span>(zone) { &hellip;</div>
              <div class="c-sn-m"><span class="c-sn-t"><i id="c-sm-3"></i></span><span class="c-sn-v">0.34</span></div>
            </div>
          </div>

          <div class="c-tnote" id="c-tnote">
            <span class="c-tn-k">pasted into the prompt</span>
            <span class="c-tn-v">Close the tab and it leaves the prompt. That is the entire mechanism.</span>
          </div>
        </div>

        <!-- STAGE 6 · the workspace index behind #codebase -->
        <div class="c-sc" id="c-sc-index">
          <div class="c-query" id="c-query">
            <span class="c-hash">#codebase</span>where do we apply tax?
          </div>

          <div class="c-idx" id="c-idx">
            <div class="c-idx-h">
              <span class="msd-label">Workspace index</span>
              <span class="c-idx-b">chunk &rarr; embed &rarr; search</span>
            </div>
            <div class="c-dots" id="c-dots"></div>
            <div class="c-idx-f">Built once, re-queried on every turn.</div>
          </div>

          <div class="c-hits" id="c-hits">
            <div class="msd-label">Top matches, pasted in</div>
            <div class="c-hit msd-reveal"><span class="c-hit-f">tax.ts</span><span class="c-hit-s">0.89</span></div>
            <div class="c-hit msd-reveal"><span class="c-hit-f">checkout.service.ts</span><span class="c-hit-s">0.74</span></div>
            <div class="c-hit msd-reveal"><span class="c-hit-f">pricing.test.ts</span><span class="c-hit-s">0.66</span></div>
            <div class="c-hits-f" id="c-hits-f">A search engine, not a memory.</div>
          </div>
        </div>

        <!-- STAGE 7 · one fixed token budget -->
        <div class="c-sc" id="c-sc-win">
          <div class="c-win-h">
            <span class="msd-label">Context window</span>
            <span class="c-win-b" id="c-win-b">sample budget &middot; 16k tokens</span>
          </div>

          <div class="c-meter" id="c-meter">
            <i class="c-seg c-g1" id="c-sg-1"></i>
            <i class="c-seg c-g2" id="c-sg-2"></i>
            <i class="c-seg c-g3" id="c-sg-3"></i>
            <i class="c-seg c-g4" id="c-sg-4"></i>
            <i class="c-seg c-g5" id="c-sg-5"></i>
            <i class="c-seg c-g6" id="c-sg-6"></i>
          </div>

          <div class="c-legend">
            <span class="c-lg"><i class="c-g1"></i>instructions<b>1.2k</b></span>
            <span class="c-lg"><i class="c-g2"></i>current file<b>4.2k</b></span>
            <span class="c-lg"><i class="c-g3"></i>open tabs<b>2.7k</b></span>
            <span class="c-lg"><i class="c-g4"></i>retrieved<b>2.2k</b></span>
            <span class="c-lg"><i class="c-g5"></i>chat history<b>3.4k</b></span>
            <span class="c-lg" id="c-lg-6"><i class="c-g6"></i>room to answer<b>2.3k</b></span>
          </div>

          <div class="c-drop" id="c-drop">
            <div class="msd-label">When it will not fit</div>
            <div class="c-dr msd-reveal" id="c-dr-1"><span class="c-dn">1</span>the oldest chat turns are cut</div>
            <div class="c-dr msd-reveal" id="c-dr-2"><span class="c-dn">2</span>the weakest snippets are dropped</div>
            <div class="c-dr msd-reveal" id="c-dr-3"><span class="c-dn">3</span>long files are truncated</div>
            <div class="c-dr-f" id="c-dr-f">Something always leaves.</div>
          </div>

          <div class="c-cost" id="c-cost">
            <div class="msd-label">Rough sizes</div>
            <div class="c-co msd-reveal"><b>1 token</b><span>&asymp; 4 characters of code</span></div>
            <div class="c-co msd-reveal"><b>600-line file</b><span>&asymp; 7k tokens on its own</span></div>
            <div class="c-co msd-reveal"><b>the answer</b><span>has to fit in there too</span></div>
          </div>
        </div>

        <!-- STAGE 8 · chat memory is the transcript, resent -->
        <div class="c-sc" id="c-sc-chat">
          <div class="c-chat" id="c-chat">
            <div class="msd-label">Your chat</div>
            <div class="c-turn msd-reveal" id="c-tn-1"><span class="c-tn-i">T1</span>we use snake_case in this repo</div>
            <div class="c-turn msd-reveal" id="c-tn-2"><span class="c-tn-i">T2</span>write the pricing helper</div>
            <div class="c-turn msd-reveal" id="c-tn-3"><span class="c-tn-i">T3</span>add the tax line</div>
            <div class="c-turn msd-reveal" id="c-tn-4"><span class="c-tn-i">T4</span>now the order version</div>
            <div class="c-turn c-turn-now msd-reveal" id="c-tn-5"><span class="c-tn-i">T5</span>why is it camelCase again?</div>
          </div>

          <div class="c-replay">
            <div class="msd-label">What actually goes over the wire</div>
            <div class="c-rp" id="c-rp-1">
              <div class="c-rp-l">turn 2</div>
              <div class="c-rp-b"><span class="c-blk c-blk-s">sys</span><span class="c-blk">T1</span><span class="c-blk c-blk-n">T2</span></div>
            </div>
            <div class="c-rp" id="c-rp-2">
              <div class="c-rp-l">turn 4</div>
              <div class="c-rp-b"><span class="c-blk c-blk-s">sys</span><span class="c-blk">T1</span><span class="c-blk">T2</span><span class="c-blk">T3</span><span class="c-blk c-blk-n">T4</span></div>
            </div>
            <div class="c-rp" id="c-rp-3">
              <div class="c-rp-l">turn 5</div>
              <div class="c-rp-b"><span class="c-blk c-blk-s">sys</span><span class="c-blk c-blk-x" id="c-blk-x">T1</span><span class="c-blk">T2</span><span class="c-blk">T3</span><span class="c-blk">T4</span><span class="c-blk c-blk-n">T5</span></div>
            </div>
            <div class="c-rp-f" id="c-rp-f">T1 fell out of the window. So the rule you set is simply gone.</div>
          </div>
        </div>

        <!-- STAGE 9 · you own the context -->
        <div class="c-sc" id="c-sc-you">
          <div class="c-cards">
            <div class="msd-card c-card msd-reveal">
              <div class="c-card-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></svg>
              </div>
              <b>Write the rules down</b>
              <span>copilot-instructions.md is re-sent with every request, so it never falls out of the chat.</span>
            </div>

            <div class="msd-card c-card msd-reveal">
              <div class="c-card-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2.6"/><path d="M3 8.5h18"/><path d="M8 4v4.5"/></svg>
              </div>
              <b>Curate your tabs</b>
              <span>The files you keep open are the cheapest context there is. Close the noise.</span>
            </div>

            <div class="msd-card c-card msd-reveal">
              <div class="c-card-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h6l2 2h8v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7Z"/><path d="m11 13 2 2 4-4"/></svg>
              </div>
              <b>Point at it</b>
              <span>#file, #selection and #codebase beat hoping the ranker guessed right.</span>
            </div>

            <div class="msd-card c-card msd-reveal">
              <div class="c-card-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 6"/><path d="M20 5v6h-6"/></svg>
              </div>
              <b>Start a fresh chat</b>
              <span>When the window is full of stale turns, a new chat beats a better prompt.</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Bottom strip: the takeaway line for whichever stage is playing -->
      <div class="msd-card c-strip" id="c-strip">
        <div class="c-strip-l" id="c-strip-l">THE CATCH</div>
        <div class="c-strip-t" id="c-strip-t">Every request is the model&rsquo;s first request.</div>
        <div class="c-chips">
          <span class="c-chip" id="c-ch1">stateless</span>
          <span class="c-chip" id="c-ch2">no session</span>
          <span class="c-chip" id="c-ch3">no file access</span>
        </div>
      </div>

    </div>
`;

const stageCss = `
#stage .c-scene{ position:relative; width:100%; height:100%; }

/* ---------------------------------------------------------- opening hook -- */
/* Fully opaque, otherwise the pipeline behind it ghosts through as grey text. */
#stage .c-hook{
  position:absolute; inset:0; z-index:9; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:16px; text-align:center;
  background:radial-gradient(circle at 50% 40%, rgba(58,160,255,.14), transparent 62%), #0E1420;
  opacity:0; transform:scale(.985); pointer-events:none;
  transition:opacity .3s ease, transform .3s cubic-bezier(.22,1,.36,1);
}
#stage .c-hook.on{ opacity:1; transform:none; }
#stage .c-hook-l1{ color:var(--text-dim); font-size:36px; font-weight:600; }
#stage .c-hook-big{
  color:#fff; font-size:110px; font-weight:900; line-height:1.04; letter-spacing:-4px;
  text-shadow:0 0 80px rgba(58,160,255,.45);
}
#stage .c-hook-row{ display:flex; flex-wrap:wrap; gap:14px; justify-content:center; max-width:880px; margin-top:22px; }
#stage .c-hook-chip{
  padding:12px 24px; border-radius:100px; background:rgba(20,27,43,.9);
  border:1.5px solid var(--border); color:var(--text-dim);
  font-family:var(--font-mono); font-size:25px; font-weight:600;
  opacity:0; transform:translateY(12px) scale(.94);
  transition:opacity .24s ease, transform .24s cubic-bezier(.22,1,.36,1), border-color .24s ease, color .24s ease;
}
#stage .c-hook-chip.on{ opacity:1; transform:none; }
#stage .c-hook-chip.gone{ border-color:rgba(244,74,106,.55); color:var(--danger); text-decoration:line-through; }
#stage .c-hook-l2{
  color:var(--accent-1); font-size:30px; font-weight:700; margin-top:20px;
  opacity:0; transition:opacity .3s ease;
}
#stage .c-hook-l2.on{ opacity:1; }

/* ------------------------------------------------------------ request bar -- */
#stage .c-top{ position:absolute; top:0; left:0; width:992px; height:50px; display:flex; align-items:center; gap:16px; }
#stage .c-mark{
  width:44px; height:44px; border-radius:13px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  background:rgba(58,160,255,.16); border:1.5px solid rgba(58,160,255,.45); color:var(--accent-1);
}
#stage .c-mark svg{ width:26px; height:26px; }
#stage .c-proj{ color:var(--text-primary); font-family:var(--font-mono); font-size:24px; font-weight:600; }
#stage .c-state{
  margin-left:auto; color:var(--text-dim); font-family:var(--font-mono); font-size:22px;
  transition:color .26s ease;
}
#stage .c-state.hot{ color:var(--accent-cyan); }

/* --------------------------------------------------------- the pipeline --- */
#stage .c-flow{ position:absolute; top:72px; left:0; width:992px; height:156px; }
#stage .c-node{
  position:absolute; top:0; width:176px; height:156px; border-radius:22px;
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px;
  background:linear-gradient(180deg, var(--bg-panel), var(--bg-panel-2));
  border:1.5px solid var(--border);
  opacity:.42; transform:scale(.96);
  transition:opacity .3s ease, transform .3s cubic-bezier(.22,1,.36,1), border-color .3s ease, box-shadow .3s ease;
}
#stage #c-n1{ left:0; }
#stage #c-n2{ left:204px; }
#stage #c-n3{ left:408px; }
#stage #c-n4{ left:612px; }
#stage #c-n5{ left:816px; }
#stage .c-node.done{ opacity:.78; transform:none; border-color:rgba(58,160,255,.34); }
#stage .c-node.hot{
  opacity:1; transform:scale(1.045); border-color:var(--accent-1);
  box-shadow:0 0 0 1px var(--accent-1), 0 0 52px rgba(58,160,255,.3);
}
#stage .c-node.cold{ border-color:rgba(244,74,106,.5); box-shadow:0 0 0 1px rgba(244,74,106,.4), 0 0 46px rgba(244,74,106,.2); }
#stage .c-ic{
  width:54px; height:54px; border-radius:16px;
  display:flex; align-items:center; justify-content:center;
  background:rgba(58,160,255,.12); color:var(--accent-1);
  transition:background .3s ease, color .3s ease;
}
#stage .c-ic svg{ width:30px; height:30px; }
#stage .c-node.hot .c-ic{ background:var(--accent-1); color:#0E1420; }
#stage .c-node.cold .c-ic{ background:rgba(244,74,106,.16); color:var(--danger); }
#stage .c-nm{ color:#fff; font-size:21px; font-weight:800; letter-spacing:1.4px; }
#stage .c-ns{ color:var(--text-dim); font-size:18px; font-weight:600; }

#stage .c-edge{
  position:absolute; top:77px; width:28px; height:3px; border-radius:2px;
  background:var(--border); overflow:hidden; transition:background .3s ease;
}
#stage #c-e1{ left:176px; }
#stage #c-e2{ left:380px; }
#stage #c-e3{ left:584px; }
#stage #c-e4{ left:788px; }
#stage .c-edge.on{ background:linear-gradient(90deg, rgba(58,160,255,.4), var(--accent-1)); }
#stage .c-edge i{
  position:absolute; top:0; left:-40%; width:40%; height:100%; border-radius:2px;
  background:var(--accent-cyan); opacity:0;
}
#stage .c-edge.on i{ opacity:1; animation:c-run 1.1s linear infinite; }

/* ------------------------------------------------------------ scene stack -- */
#stage .c-stack{ position:absolute; top:280px; left:0; width:992px; height:520px; }
#stage .c-sc{
  position:absolute; inset:0; opacity:0; transform:scale(.985); pointer-events:none;
  transition:opacity .3s ease, transform .3s cubic-bezier(.22,1,.36,1);
}
#stage .c-sc.on{ opacity:1; transform:none; }

/* ---- stage 2 · the frozen function ---- */
#stage .c-reqs{
  position:absolute; top:0; left:0; width:452px; height:520px; padding:24px 24px 0;
  border-radius:24px; background:linear-gradient(180deg, var(--bg-panel), var(--bg-panel-2));
  border:1.5px solid var(--border);
}
#stage .c-req{
  margin-top:18px; padding:18px 20px; border-radius:18px;
  background:rgba(20,27,43,.9); border:1.5px solid var(--border);
}
#stage .c-req.hot{ border-color:var(--accent-1); box-shadow:0 0 0 1px var(--accent-1); }
#stage .c-rq-h{ display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
#stage .c-rq-t{ color:var(--text-dim); font-family:var(--font-mono); font-size:19px; font-weight:600; }
#stage .c-rq-n{ color:var(--accent-1); font-family:var(--font-mono); font-size:18px; font-weight:700; letter-spacing:1.2px; }
#stage .c-rq-p{ color:var(--code-comment); font-family:var(--font-mono); font-size:21px; font-weight:600; }
#stage .c-rq-a{ color:var(--text-primary); font-family:var(--font-mono); font-size:20px; font-weight:600; margin-top:10px; }
#stage .c-rq-a em{ font-style:normal; color:var(--danger); font-weight:700; }
#stage .c-void{
  display:flex; align-items:center; justify-content:center; gap:12px; margin-top:18px;
  padding:14px 0; border-radius:14px;
  background:rgba(244,74,106,.08); border:1.5px dashed rgba(244,74,106,.42);
  color:var(--danger); font-size:21px; font-weight:700;
  opacity:0; transition:opacity .28s ease;
}
#stage .c-void.on{ opacity:1; }
#stage .c-void-x{ font-size:26px; font-weight:800; }

#stage .c-llm{
  position:absolute; top:0; right:0; width:518px; height:520px; padding:26px 28px;
  border-radius:24px; background:linear-gradient(180deg, var(--bg-panel), var(--bg-panel-2));
  border:1.5px solid var(--border);
  display:flex; flex-direction:column;
}
#stage .c-llm-h{ display:flex; align-items:center; justify-content:space-between; }
#stage .c-badge{
  padding:9px 20px; border-radius:100px; background:rgba(58,160,255,.16);
  border:1.5px solid rgba(58,160,255,.45); color:var(--accent-1);
  font-family:var(--font-mono); font-size:21px; font-weight:700;
}
#stage .c-ro{
  padding:8px 16px; border-radius:9px; background:rgba(20,27,43,.9);
  border:1px solid var(--border); color:var(--text-dim);
  font-family:var(--font-mono); font-size:19px; font-weight:600;
  transition:color .26s ease, border-color .26s ease;
}
#stage .c-ro.lit{ color:var(--warn); border-color:rgba(240,166,74,.5); }
#stage .c-io{ margin-top:26px; }
#stage .c-io-l{ color:var(--text-dim); font-size:19px; font-weight:800; letter-spacing:1.4px; text-transform:uppercase; }
#stage .c-toks{ display:flex; flex-wrap:wrap; gap:10px; margin-top:14px; }
#stage .c-tok{
  padding:10px 16px; border-radius:11px; background:rgba(20,27,43,.9);
  border:1.5px solid var(--border); color:var(--text-primary);
  font-family:var(--font-mono); font-size:21px; font-weight:600;
  opacity:0; transform:translateY(8px);
  transition:opacity .2s ease, transform .2s ease;
}
#stage .c-tok.on{ opacity:1; transform:none; }
#stage .c-tok-hot{ border-color:var(--accent-cyan); color:#fff; background:rgba(34,211,238,.14); }
#stage .c-pred{
  margin-top:26px; padding:18px 20px; border-radius:16px; text-align:center;
  background:rgba(58,160,255,.1); border:1.5px solid rgba(58,160,255,.32);
  color:var(--accent-1); font-family:var(--font-mono); font-size:21px; font-weight:600;
  opacity:0; transition:opacity .28s ease;
}
#stage .c-pred.on{ opacity:1; }
#stage .c-llm-f{
  margin-top:auto; padding-top:20px; border-top:1px solid var(--border);
  color:var(--text-dim); font-size:21px; font-weight:600; line-height:1.4;
}

/* ---- stage 3 · assembling the prompt ---- */
#stage .c-src{
  position:absolute; top:0; left:0; width:430px; height:520px; padding:24px 22px 0;
  border-radius:24px; background:linear-gradient(180deg, var(--bg-panel), var(--bg-panel-2));
  border:1.5px solid var(--border);
}
/* Six one-line rows: any row that wraps pushes the last one under the footer
   that is anchored to the bottom of the panel. */
#stage .c-src-row{
  display:flex; align-items:center; gap:14px; margin-top:13px;
  padding:13px 16px; border-radius:14px; white-space:nowrap;
  background:rgba(20,27,43,.85); border:1.5px solid var(--border);
  color:var(--text-primary); font-size:20px; font-weight:600; line-height:1.25;
}
#stage .c-src-i{
  flex-shrink:0; color:var(--accent-1); font-family:var(--font-mono); font-size:18px; font-weight:700;
}
#stage .c-src-f{
  position:absolute; left:22px; right:22px; bottom:22px;
  color:var(--accent-1); font-size:21px; font-weight:700;
  opacity:0; transition:opacity .28s ease;
}
#stage .c-src-f.on{ opacity:1; }

#stage .c-pay{
  position:absolute; top:0; right:0; width:530px; height:520px; padding:24px 24px 0;
  border-radius:24px; background:var(--editor-bg); border:1.5px solid #000;
}
#stage .c-pay-h{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
#stage .c-pay-b{
  padding:7px 15px; border-radius:9px; background:rgba(58,160,255,.14);
  border:1px solid rgba(58,160,255,.34); color:var(--accent-1);
  font-family:var(--font-mono); font-size:18px; font-weight:700;
}
/* Values are kept short enough to stay on one line — two-line rows push the
   fifth row into the footer that is anchored to the bottom of the card. */
#stage .c-pr{
  display:flex; align-items:center; gap:14px; margin-top:13px;
  padding:12px 15px; border-radius:12px; background:rgba(255,255,255,.04);
  white-space:nowrap;
}
#stage .c-key{
  flex-shrink:0; width:88px; color:var(--code-keyword);
  font-family:var(--font-mono); font-size:19px; font-weight:700;
}
#stage .c-val{ color:var(--code-plain); font-family:var(--font-mono); font-size:19px; font-weight:500; }
#stage .c-pay-f{
  position:absolute; left:24px; right:24px; bottom:22px;
  color:var(--code-comment); font-family:var(--font-mono); font-size:19px; font-weight:600;
  opacity:0; transition:opacity .28s ease;
}
#stage .c-pay-f.on{ opacity:1; }

/* ---- stage 4 · fill in the middle ---- */
#stage .c-ed{ position:absolute; top:0; left:0; width:616px; height:404px; }
#stage .c-file{ color:var(--text-dim); font-family:var(--font-mono); font-size:20px; margin-left:14px; }
/* nowrap: a wrapped line breaks the line-number gutter and the whole layout,
   so the font is sized to keep the longest line inside 616px. */
#stage .c-ed .body{ font-size:19px; line-height:2.05; padding-top:24px; }
#stage .c-cl{
  white-space:nowrap; border-radius:8px; padding:1px 6px;
  transition:background .26s ease, box-shadow .26s ease, opacity .26s ease;
}
#stage .c-cl.dim{ opacity:.34; }
#stage .c-pre.mark{ background:rgba(58,160,255,.16); box-shadow:inset 3px 0 0 var(--accent-1); }
#stage .c-suf.mark{ background:rgba(34,211,238,.14); box-shadow:inset 3px 0 0 var(--accent-cyan); }
#stage .c-cur.mark{ background:rgba(240,166,74,.14); box-shadow:inset 3px 0 0 var(--warn); }
#stage #c-ghost{ font-family:var(--font-mono); }

#stage .c-fim{ position:absolute; top:0; right:0; width:352px; height:520px; }
#stage .c-fb{
  height:162px; margin-bottom:17px; padding:18px 20px; border-radius:20px;
  display:flex; flex-direction:column; justify-content:center; gap:8px;
  background:linear-gradient(180deg, var(--bg-panel), var(--bg-panel-2));
  border:1.5px solid var(--border);
  opacity:.4; transition:opacity .26s ease, border-color .26s ease, box-shadow .26s ease;
}
#stage .c-fb.on{ opacity:1; }
#stage .c-fb.on#c-fb-1{ border-color:var(--accent-1); box-shadow:0 0 0 1px rgba(58,160,255,.5); }
#stage .c-fb.on#c-fb-2{ border-color:var(--accent-cyan); box-shadow:0 0 0 1px rgba(34,211,238,.5); }
#stage .c-fb.on#c-fb-3{ border-color:var(--warn); box-shadow:0 0 0 1px rgba(240,166,74,.5); }
#stage .c-fb b{ color:#fff; font-size:22px; font-weight:800; letter-spacing:1.6px; }
#stage .c-fb span{ color:var(--text-dim); font-size:19px; font-weight:500; line-height:1.3; }
#stage .c-fb span i{ font-style:normal; color:var(--accent-cyan); font-family:var(--font-mono); }
/* The text lives in a span: with the words as direct flex children they get
   spread across the box instead of reading as one sentence. */
#stage .c-ask{
  position:absolute; top:420px; left:0; width:616px; height:100px;
  padding:0 26px; border-radius:20px;
  display:flex; align-items:center; justify-content:center;
  background:rgba(244,74,106,.08); border:1.5px solid rgba(244,74,106,.4);
  color:var(--text-primary); font-size:27px; font-weight:700; line-height:1.3;
  opacity:0; transition:opacity .28s ease;
}
#stage .c-ask.on{ opacity:1; }
#stage .c-ask em{ font-style:normal; color:var(--danger); font-family:var(--font-mono); }

/* ---- stage 5 · neighbouring tabs ---- */
#stage .c-tabbar{
  position:absolute; top:0; left:0; width:992px; height:62px;
  display:flex; align-items:stretch; gap:8px;
}
#stage .c-tab{
  display:flex; align-items:center; padding:0 22px; border-radius:14px 14px 0 0;
  background:rgba(20,27,43,.75); border:1.5px solid var(--border); border-bottom:none;
  color:var(--text-dim); font-family:var(--font-mono); font-size:21px; font-weight:600;
  transition:color .24s ease, border-color .24s ease, background .24s ease;
}
#stage .c-tab-on{ background:var(--editor-bg); color:#fff; border-color:rgba(58,160,255,.5); }
#stage .c-tab.read{ color:var(--accent-cyan); border-color:rgba(34,211,238,.45); background:rgba(34,211,238,.08); }
#stage .c-tab-off{ opacity:.45; }

#stage .c-snips{
  position:absolute; top:86px; left:0; width:992px; height:318px;
  display:grid; grid-template-columns:repeat(3, 1fr); gap:18px;
}
#stage .c-snip{
  border-radius:22px; padding:24px 22px;
  display:flex; flex-direction:column; gap:16px;
  background:linear-gradient(180deg, var(--bg-panel), var(--bg-panel-2));
  border:1.5px solid var(--border);
  opacity:0; transform:translateY(14px);
  transition:opacity .28s ease, transform .28s cubic-bezier(.22,1,.36,1), border-color .28s ease, box-shadow .28s ease;
}
#stage .c-snip.on{ opacity:1; transform:none; }
#stage .c-snip.win{ border-color:var(--accent-1); box-shadow:0 0 0 1px var(--accent-1), 0 0 46px rgba(58,160,255,.26); }
#stage .c-sn-f{ color:#fff; font-family:var(--font-mono); font-size:22px; font-weight:700; }
#stage .c-sn-c{
  padding:16px 14px; border-radius:12px; background:var(--editor-bg);
  color:var(--code-plain); font-family:var(--font-mono); font-size:18px; line-height:1.4;
  word-break:break-word;
}
#stage .c-sn-m{ display:flex; align-items:center; gap:14px; margin-top:auto; }
#stage .c-sn-t{ flex:1; height:12px; border-radius:6px; background:rgba(35,44,64,.9); overflow:hidden; }
#stage .c-sn-t i{
  display:block; width:0; height:100%; border-radius:6px;
  background:linear-gradient(90deg, var(--accent-1), var(--accent-cyan));
  transition:width .8s cubic-bezier(.22,1,.36,1);
}
#stage .c-sn-v{ color:var(--text-primary); font-family:var(--font-mono); font-size:20px; font-weight:700; }

#stage .c-tnote{
  position:absolute; top:434px; left:0; width:992px; height:86px;
  display:flex; align-items:center; gap:18px; padding:0 24px; border-radius:18px;
  background:rgba(58,160,255,.08); border:1.5px solid rgba(58,160,255,.3);
  opacity:0; transform:translateY(10px); transition:opacity .28s ease, transform .28s ease;
}
#stage .c-tnote.on{ opacity:1; transform:none; }
#stage .c-tn-k{
  flex-shrink:0; color:var(--accent-1); font-family:var(--font-mono); font-size:19px;
  font-weight:700; letter-spacing:1.4px; text-transform:uppercase;
}
#stage .c-tn-v{ color:#fff; font-size:23px; font-weight:700; }

/* ---- stage 6 · the workspace index ---- */
#stage .c-query{
  position:absolute; top:0; left:0; width:992px; height:70px; border-radius:16px;
  display:flex; align-items:center; gap:16px; padding:0 24px;
  background:rgba(20,27,43,.9); border:1.5px solid var(--border);
  color:var(--text-primary); font-size:25px; font-weight:600;
  opacity:0; transform:translateY(-10px); transition:opacity .28s ease, transform .28s ease;
}
#stage .c-query.on{ opacity:1; transform:none; }
#stage .c-hash{
  padding:8px 16px; border-radius:9px; background:rgba(34,211,238,.12);
  border:1px solid rgba(34,211,238,.36); color:var(--accent-cyan);
  font-family:var(--font-mono); font-size:21px; font-weight:700;
}

#stage .c-idx{
  position:absolute; top:96px; left:0; width:470px; height:340px; padding:22px 24px;
  border-radius:22px; background:linear-gradient(180deg, var(--bg-panel), var(--bg-panel-2));
  border:1.5px solid var(--border);
  opacity:0; transform:translateY(12px); transition:opacity .28s ease, transform .28s ease, border-color .28s ease, box-shadow .28s ease;
}
#stage .c-idx.on{ opacity:1; transform:none; }
#stage .c-idx.hot{ border-color:var(--accent-1); box-shadow:0 0 0 1px var(--accent-1), 0 0 44px rgba(58,160,255,.22); }
#stage .c-idx-h{ display:flex; align-items:center; justify-content:space-between; }
#stage .c-idx-b{
  color:var(--text-dim); font-family:var(--font-mono); font-size:18px;
  padding:5px 13px; border-radius:8px; background:rgba(20,27,43,.8); border:1px solid var(--border);
}
#stage .c-dots{ display:grid; grid-template-columns:repeat(10, 1fr); gap:11px; margin-top:22px; }
#stage .c-dots i{
  display:block; width:100%; height:20px; border-radius:6px;
  background:rgba(139,149,167,.22); transition:background .2s ease, box-shadow .2s ease;
}
#stage .c-dots i.hit{ background:var(--accent-cyan); box-shadow:0 0 14px var(--accent-cyan); }
#stage .c-idx-f{
  position:absolute; left:24px; right:24px; bottom:20px;
  color:var(--text-dim); font-size:19px; font-weight:600;
}

#stage .c-hits{
  position:absolute; top:96px; right:0; width:490px; height:340px; padding:22px 24px;
  border-radius:22px; background:linear-gradient(180deg, var(--bg-panel), var(--bg-panel-2));
  border:1.5px solid var(--border);
}
#stage .c-hit{
  display:flex; align-items:center; justify-content:space-between; margin-top:14px;
  padding:15px 18px; border-radius:14px;
  background:rgba(34,211,238,.08); border:1.5px solid rgba(34,211,238,.28);
}
#stage .c-hit-f{ color:#fff; font-family:var(--font-mono); font-size:21px; font-weight:600; }
#stage .c-hit-s{ color:var(--accent-cyan); font-family:var(--font-mono); font-size:20px; font-weight:700; }
#stage .c-hits-f{
  position:absolute; left:24px; right:24px; bottom:20px;
  color:var(--accent-1); font-size:21px; font-weight:700; line-height:1.3;
  opacity:0; transition:opacity .28s ease;
}
#stage .c-hits-f.on{ opacity:1; }

/* ---- stage 7 · the token budget ---- */
#stage .c-win-h{ position:absolute; top:0; left:0; width:992px; display:flex; align-items:center; justify-content:space-between; }
#stage .c-win-b{
  color:var(--text-dim); font-family:var(--font-mono); font-size:19px;
  padding:6px 15px; border-radius:8px; background:rgba(20,27,43,.85); border:1px solid var(--border);
  transition:color .26s ease, border-color .26s ease;
}
#stage .c-win-b.full{ color:var(--danger); border-color:rgba(244,74,106,.5); }

#stage .c-meter{
  position:absolute; top:48px; left:0; width:992px; height:76px; border-radius:16px;
  display:flex; overflow:hidden;
  background:rgba(20,27,43,.9); border:1.5px solid var(--border);
  transition:border-color .28s ease, box-shadow .28s ease;
}
#stage .c-meter.full{ border-color:rgba(244,74,106,.55); box-shadow:0 0 0 1px rgba(244,74,106,.35); }
#stage .c-seg{ width:0; height:100%; transition:width .7s cubic-bezier(.22,1,.36,1); }
#stage .c-g1{ background:#1959C9; }
#stage .c-g2{ background:#3AA0FF; }
#stage .c-g3{ background:#22D3EE; }
#stage .c-g4{ background:#2f9e46; }
#stage .c-g5{ background:#F0A64A; }
#stage .c-g6{ background:repeating-linear-gradient(135deg, rgba(139,149,167,.3) 0 10px, rgba(139,149,167,.12) 10px 20px); }

/* A grid, not a flex row: six legend labels across 992px wrap mid-word, and a
   wrapped legend pushes the panels below it off the stage. */
#stage .c-legend{
  position:absolute; top:142px; left:0; width:992px;
  display:grid; grid-template-columns:repeat(3, 1fr); gap:10px 20px;
}
#stage .c-lg{
  display:flex; align-items:center; gap:10px; white-space:nowrap;
  color:var(--text-dim); font-size:19px; font-weight:600;
  transition:color .26s ease, opacity .26s ease;
}
#stage .c-lg i{ width:15px; height:15px; border-radius:4px; flex-shrink:0; }
#stage .c-lg b{ color:var(--text-primary); font-family:var(--font-mono); font-size:19px; font-weight:700; }
#stage .c-lg.gone{ opacity:.4; text-decoration:line-through; }

#stage .c-drop{
  position:absolute; top:212px; left:0; width:486px; height:308px; padding:22px 24px;
  border-radius:22px; background:linear-gradient(180deg, var(--bg-panel), var(--bg-panel-2));
  border:1.5px solid var(--border);
}
#stage .c-dr{
  display:flex; align-items:center; gap:14px; margin-top:13px;
  padding:12px 18px; border-radius:14px;
  background:rgba(20,27,43,.85); border:1.5px solid var(--border);
  color:var(--text-primary); font-size:21px; font-weight:600;
  transition:border-color .24s ease, color .24s ease;
}
#stage .c-dr.cut{ border-color:rgba(244,74,106,.45); color:var(--danger); }
#stage .c-dn{
  width:30px; height:30px; border-radius:9px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  background:rgba(244,74,106,.14); color:var(--danger);
  font-family:var(--font-mono); font-size:17px; font-weight:700;
}
#stage .c-dr-f{
  position:absolute; left:24px; right:24px; bottom:20px;
  color:var(--text-dim); font-size:19px; font-weight:600;
  opacity:0; transition:opacity .28s ease;
}
#stage .c-dr-f.on{ opacity:1; }

#stage .c-cost{
  position:absolute; top:212px; right:0; width:486px; height:308px; padding:22px 24px;
  border-radius:22px; background:linear-gradient(180deg, var(--bg-panel), var(--bg-panel-2));
  border:1.5px solid var(--border);
}
#stage .c-co{
  display:flex; align-items:baseline; gap:14px; margin-top:18px;
  padding-bottom:16px; border-bottom:1px solid var(--border);
}
#stage .c-co b{ color:#fff; font-family:var(--font-mono); font-size:23px; font-weight:700; }
#stage .c-co span{ color:var(--text-dim); font-size:20px; font-weight:500; }

/* ---- stage 8 · the transcript, resent ---- */
#stage .c-chat{
  position:absolute; top:0; left:0; width:392px; height:520px; padding:24px 22px;
  border-radius:24px; background:linear-gradient(180deg, var(--bg-panel), var(--bg-panel-2));
  border:1.5px solid var(--border);
}
#stage .c-turn{
  display:flex; align-items:center; gap:14px; margin-top:16px;
  padding:16px 18px; border-radius:16px;
  background:rgba(20,27,43,.88); border:1.5px solid var(--border);
  color:var(--text-primary); font-size:20px; font-weight:600; line-height:1.25;
  transition:opacity .3s ease, border-color .3s ease, color .3s ease;
}
#stage .c-tn-i{
  flex-shrink:0; color:var(--accent-1); font-family:var(--font-mono); font-size:18px; font-weight:700;
}
#stage .c-turn.faded{ opacity:.3; }
#stage .c-turn-now{ border-color:rgba(58,160,255,.5); }
#stage .c-turn.miss{ border-color:rgba(244,74,106,.5); color:var(--danger); }

#stage .c-replay{
  position:absolute; top:0; right:0; width:578px; height:520px; padding:24px 24px 0;
  border-radius:24px; background:linear-gradient(180deg, var(--bg-panel), var(--bg-panel-2));
  border:1.5px solid var(--border);
}
#stage .c-rp{
  margin-top:20px; opacity:0; transform:translateY(10px);
  transition:opacity .28s ease, transform .28s ease;
}
#stage .c-rp.on{ opacity:1; transform:none; }
#stage .c-rp-l{ color:var(--text-dim); font-family:var(--font-mono); font-size:18px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; }
#stage .c-rp-b{ display:flex; gap:9px; margin-top:11px; }
#stage .c-blk{
  flex:1; height:56px; border-radius:12px;
  display:flex; align-items:center; justify-content:center;
  background:rgba(58,160,255,.14); border:1.5px solid rgba(58,160,255,.34);
  color:var(--text-primary); font-family:var(--font-mono); font-size:19px; font-weight:700;
  transition:opacity .3s ease, background .3s ease, border-color .3s ease, color .3s ease;
}
#stage .c-blk-s{ flex:0 0 74px; background:rgba(139,149,167,.14); border-color:var(--border); color:var(--text-dim); }
#stage .c-blk-n{ background:rgba(34,211,238,.16); border-color:rgba(34,211,238,.45); color:#fff; }
#stage .c-blk-x.cut{
  background:rgba(244,74,106,.1); border-color:rgba(244,74,106,.42); border-style:dashed;
  color:var(--danger); text-decoration:line-through;
}
#stage .c-rp-f{
  position:absolute; left:24px; right:24px; bottom:22px;
  color:#fff; font-size:22px; font-weight:700; line-height:1.35;
  opacity:0; transition:opacity .3s ease;
}
#stage .c-rp-f.on{ opacity:1; }

/* ---- stage 9 · you own the context ---- */
#stage .c-cards{ display:grid; grid-template-columns:repeat(2, 1fr); gap:20px; }
#stage .c-card{ height:250px; padding:26px; display:flex; flex-direction:column; gap:12px; justify-content:center; }
#stage .c-card-ic{
  width:56px; height:56px; border-radius:16px; margin-bottom:4px;
  display:flex; align-items:center; justify-content:center;
  background:rgba(58,160,255,.14); color:var(--accent-1);
}
#stage .c-card-ic svg{ width:30px; height:30px; }
#stage .c-card b{ color:#fff; font-size:29px; font-weight:800; letter-spacing:-.4px; }
#stage .c-card span{ color:var(--text-dim); font-size:21px; font-weight:500; line-height:1.4; }

/* ----------------------------------------------------------- bottom strip -- */
#stage .c-strip{
  position:absolute; top:818px; left:0; width:992px; height:206px; padding:24px 30px;
  display:flex; flex-direction:column; gap:12px; justify-content:center;
}
#stage .c-strip-l{ color:var(--accent-1); font-family:var(--font-mono); font-size:19px; font-weight:700; letter-spacing:3px; }
#stage .c-strip-t{ color:#fff; font-size:29px; font-weight:700; line-height:1.3; }
#stage .c-chips{ display:flex; gap:12px; margin-top:4px; }
#stage .c-chip{
  padding:10px 18px; border-radius:10px;
  background:rgba(58,160,255,.12); border:1px solid rgba(58,160,255,.3);
  color:var(--accent-1); font-family:var(--font-mono); font-size:20px; font-weight:600;
  opacity:0; transform:translateY(8px);
  transition:opacity .24s ease, transform .24s ease;
}
/* MSD.show adds .show, not .on — the chips stay invisible if this drifts. */
#stage .c-chip.show{ opacity:1; transform:none; }

@keyframes c-run{ from{ left:-40%; } to{ left:100%; } }
`;

export const copilotContextWindowReel: ReelSpec = {
  slug: 'copilot-context-window',
  topic:
    'Why LLMs are stateless, and how GitHub Copilot rebuilds your project context into a token-limited prompt on every request',
  title: {
    main: 'LLMs have <em>no memory</em>',
    sub: 'So how does Copilot know your code? It never remembers. It re-reads, re-ranks and re-sends your context on every single request.',
    pill: '9 stages · 24 sec · AI engineering',
  },
  stageHtml,
  stageCss,
  stages: [
    {
      title: 'Copilot does not remember you',
      key: 'does not remember',
      desc: 'The model is stateless. Between two requests it holds nothing — not your repo, not your last question.',
      status: 'model idle · zero state',
      thinking: false,
      durationMs: 2600,
      js: `
      MSD.cls('#c-hook', 'on', true);
      MSD.cls('#c-hook-l2', 'on', false);
      MSD.cls('.c-hook-chip', 'on', false);
      MSD.cls('.c-hook-chip', 'gone', false);
      MSD.after(120, function(){ MSD.punch('#c-hook-big', 2); });
      MSD.qa('.c-hook-chip').forEach(function(el, i){
        MSD.after(680 + i * 140, function(){ el.classList.add('on'); MSD.sfx.tick(); });
      });
      MSD.after(1650, function(){ MSD.cls('.c-hook-chip', 'gone', true); MSD.sfx.error(); });
      MSD.after(1920, function(){ MSD.cls('#c-hook-l2', 'on', true); MSD.sfx.pop(); });
      `,
    },
    {
      title: 'The model is a frozen function',
      key: 'frozen function',
      desc: 'Tokens in, one token out. Weights are read-only at inference, so nothing you type is ever written back.',
      status: 'inference · weights read-only',
      thinking: false,
      durationMs: 2800,
      js: `
      MSD.cls('#c-hook', 'on', false);
      MSD.unfocus();
      MSD.cls('.c-sc', 'on', false);
      MSD.cls('.c-node', 'hot', false);
      MSD.cls('.c-node', 'done', false);
      MSD.cls('.c-edge', 'on', false);
      MSD.cls('#c-n4', 'cold', true);
      MSD.hide('#c-sc-state .msd-reveal');
      MSD.cls('#c-void, #c-pred', 'on', false);
      MSD.cls('.c-tok', 'on', false);
      MSD.cls('#c-ro', 'lit', false);
      MSD.cls('#c-sc-state', 'on', true);
      MSD.q('#c-state').textContent = 'one request, no history';
      MSD.cls('#c-state', 'hot', true);
      MSD.q('#c-strip-l').textContent = 'WHAT THE MODEL IS';
      MSD.q('#c-strip-t').textContent = 'A pure function over the prompt. Same prompt in, same distribution out.';
      MSD.q('#c-ch1').textContent = 'stateless';
      MSD.q('#c-ch2').textContent = 'no session';
      MSD.q('#c-ch3').textContent = 'no file access';
      MSD.hide('.c-chip');
      MSD.after(60, function(){ MSD.show('.c-chip', 90, true); });

      MSD.after(120, function(){ MSD.show('#c-rq1', 0); });
      MSD.qa('#c-tk-1, #c-tk-2, #c-tk-3, #c-tk-4, #c-tk-5').forEach(function(el, i){
        MSD.after(320 + i * 110, function(){ el.classList.add('on'); MSD.sfx.tick(); });
      });
      MSD.after(1000, function(){ MSD.cls('#c-pred', 'on', true); MSD.sfx.blip(2); });
      MSD.after(1350, function(){ MSD.cls('#c-tk-out', 'on', true); MSD.punch('#c-tk-out', 4); });
      MSD.after(1700, function(){ MSD.cls('#c-void', 'on', true); MSD.cls('#c-ro', 'lit', true); MSD.shake('#c-void'); });
      MSD.after(2100, function(){ MSD.show('#c-rq2', 0, true); MSD.sfx.error(); });
      MSD.after(2400, function(){ MSD.punch('#c-rq2-a', 1); });
      `,
    },
    {
      title: 'So the editor rebuilds the world',
      key: 'rebuilds the world',
      desc: 'Every suggestion is a fresh prompt your IDE assembles: the file, the tabs, repo rules, retrieved code, the chat so far.',
      status: 'assembling the prompt',
      thinking: true,
      durationMs: 2900,
      js: `
      MSD.cls('.c-sc', 'on', false);
      MSD.cls('#c-sc-build', 'on', true);
      MSD.cls('.c-node', 'hot', false);
      MSD.cls('#c-n4', 'cold', false);
      MSD.cls('.c-node', 'done', true);
      MSD.cls('.c-edge', 'on', true);
      MSD.hide('#c-sc-build .msd-reveal');
      MSD.cls('#c-src-f, #c-pay-f', 'on', false);
      MSD.q('#c-state').textContent = 'building the payload';
      MSD.q('#c-strip-l').textContent = 'THE TRICK';
      MSD.q('#c-strip-t').textContent = 'Your context is not stored anywhere. It is re-sent, in full, every time.';
      MSD.q('#c-ch1').textContent = 'prompt assembly';
      MSD.q('#c-ch2').textContent = 'per keystroke';
      MSD.q('#c-ch3').textContent = 'stateless API';
      MSD.hide('.c-chip');
      MSD.after(60, function(){ MSD.show('.c-chip', 90, true); });

      MSD.after(100, function(){ MSD.show('#c-src .msd-reveal', 150); });
      MSD.after(1050, function(){ MSD.show('#c-pay .msd-reveal', 180); });
      MSD.stream('#c-pay', { from: { x: -6, y: 40 }, to: { x: 30, y: 40 }, count: 5, duration: 900, gap: 700, silent: true });
      MSD.after(2100, function(){ MSD.cls('#c-src-f', 'on', true); MSD.sfx.pop(); });
      MSD.after(2400, function(){
        MSD.q('#c-pay-b').textContent = 'sent';
        MSD.cls('#c-pay-f', 'on', true);
        MSD.flash('#c-pay');
        MSD.sfx.chime();
      });
      `,
    },
    {
      title: 'It reads around your cursor',
      key: 'around your cursor',
      desc: 'Your file is split into a prefix and a suffix, and the model is asked to fill in only the middle.',
      status: 'fill-in-the-middle',
      thinking: false,
      durationMs: 2900,
      js: `
      MSD.cls('.c-sc', 'on', false);
      MSD.cls('#c-sc-fim', 'on', true);
      MSD.cls('.c-node', 'hot', false);
      MSD.cls('.c-node', 'done', false);
      MSD.cls('#c-n1', 'hot', true);
      MSD.cls('.c-edge', 'on', false);
      MSD.cls('.c-cl', 'mark', false);
      MSD.cls('.c-cl', 'dim', false);
      MSD.cls('.c-fb', 'on', false);
      MSD.cls('#c-ask', 'on', false);
      MSD.q('#c-ghost').textContent = '';
      MSD.q('#c-state').textContent = 'reading prefix + suffix';
      MSD.q('#c-strip-l').textContent = 'COMPLETIONS';
      MSD.q('#c-strip-t').textContent = 'The line below the cursor is context too — that is why the guess fits.';
      MSD.q('#c-ch1').textContent = 'prefix';
      MSD.q('#c-ch2').textContent = 'suffix';
      MSD.q('#c-ch3').textContent = 'fill-in-the-middle';
      MSD.hide('.c-chip');
      MSD.after(60, function(){ MSD.show('.c-chip', 90, true); });

      MSD.after(150, function(){ MSD.cls('.c-pre', 'mark', true); MSD.cls('#c-fb-1', 'on', true); MSD.sfx.blip(0); });
      MSD.after(750, function(){ MSD.cls('.c-suf', 'mark', true); MSD.cls('#c-fb-2', 'on', true); MSD.sfx.blip(2); });
      MSD.after(1300, function(){
        MSD.cls('.c-cur', 'mark', true);
        MSD.cls('#c-fb-3', 'on', true);
        MSD.type('#c-ghost', 'const tax = subtotal * TAX_RATE;', 46);
      });
      MSD.after(2500, function(){ MSD.cls('#c-ask', 'on', true); MSD.punch('#c-ask', 3); MSD.sfx.error(); });
      `,
    },
    {
      title: 'Your open tabs are the context',
      key: 'open tabs',
      desc: 'Copilot scans nearby files you have open, scores the snippets that look like your code, and pastes the winners in.',
      status: 'scanning neighbouring tabs',
      thinking: true,
      durationMs: 2800,
      js: `
      MSD.cls('.c-sc', 'on', false);
      MSD.cls('#c-sc-tabs', 'on', true);
      MSD.cls('.c-node', 'hot', false);
      MSD.cls('#c-n1', 'done', true);
      MSD.cls('#c-n2', 'hot', true);
      MSD.cls('#c-e1', 'on', true);
      MSD.cls('.c-tab', 'read', false);
      MSD.cls('.c-snip', 'on', false);
      MSD.cls('.c-snip', 'win', false);
      MSD.cls('#c-tnote', 'on', false);
      MSD.qa('.c-sn-t i').forEach(function(el){ el.style.width = '0'; });
      MSD.q('#c-state').textContent = 'ranking snippets by similarity';
      MSD.q('#c-strip-l').textContent = 'WHERE IT LOOKS';
      MSD.q('#c-strip-t').textContent = 'TAX_RATE was never memorised. It was sitting in a tab you left open.';
      MSD.q('#c-ch1').textContent = 'neighbouring tabs';
      MSD.q('#c-ch2').textContent = 'similarity score';
      MSD.q('#c-ch3').textContent = 'top-k pasted in';
      MSD.hide('.c-chip');
      MSD.after(60, function(){ MSD.show('.c-chip', 90, true); });

      ['#c-tb-1', '#c-tb-2', '#c-tb-3'].forEach(function(sel, i){
        MSD.after(120 + i * 170, function(){ MSD.cls(sel, 'read', true); MSD.sfx.step(i); });
      });
      [['#c-sn-1', '#c-sm-1', '91%'], ['#c-sn-2', '#c-sm-2', '62%'], ['#c-sn-3', '#c-sm-3', '34%']].forEach(function(row, i){
        MSD.after(700 + i * 240, function(){
          MSD.cls(row[0], 'on', true);
          var bar = MSD.q(row[1]);
          if(bar) bar.style.width = row[2];
          MSD.sfx.blip(i);
        });
      });
      MSD.after(1850, function(){ MSD.cls('#c-sn-1', 'win', true); MSD.punch('#c-sn-1', 4); MSD.sfx.lock(); });
      MSD.after(2250, function(){ MSD.cls('#c-tnote', 'on', true); MSD.sfx.pop(); });
      `,
    },
    {
      title: 'Chat searches your repo index',
      key: 'your repo index',
      desc: 'Ask about #codebase and your workspace is chunked, embedded and searched — again on every turn.',
      status: 'retrieving from the workspace index',
      thinking: true,
      durationMs: 2800,
      js: `
      MSD.cls('.c-sc', 'on', false);
      MSD.cls('#c-sc-index', 'on', true);
      MSD.cls('.c-node', 'hot', false);
      MSD.cls('#c-n1', 'done', true);
      MSD.cls('#c-n2', 'hot', true);
      MSD.cls('#c-e1', 'on', true);
      MSD.cls('#c-query, #c-idx', 'on', false);
      MSD.cls('#c-idx', 'hot', false);
      MSD.cls('#c-hits-f', 'on', false);
      MSD.hide('#c-hits .msd-reveal');
      MSD.q('#c-state').textContent = 'searching the index';
      MSD.q('#c-strip-l').textContent = 'CHAT CONTEXT';
      MSD.q('#c-strip-t').textContent = 'The index is searched again on every turn. Nothing carries over on its own.';
      MSD.q('#c-ch1').textContent = 'chunk + embed';
      MSD.q('#c-ch2').textContent = 'semantic search';
      MSD.q('#c-ch3').textContent = '#codebase';
      MSD.hide('.c-chip');
      MSD.after(60, function(){ MSD.show('.c-chip', 90, true); });

      var dots = MSD.q('#c-dots');
      if(dots && !dots.childNodes.length){
        for(var i = 0; i < 40; i++){ dots.appendChild(document.createElement('i')); }
      }
      MSD.qa('#c-dots i').forEach(function(el){ el.classList.remove('hit'); });

      MSD.after(100, function(){ MSD.cls('#c-query', 'on', true); MSD.sfx.blip(0); });
      MSD.after(480, function(){ MSD.cls('#c-idx', 'on', true); MSD.cls('#c-idx', 'hot', true); MSD.sfx.blip(2); });
      MSD.after(900, function(){
        [4, 11, 17, 26, 33].forEach(function(n, i){
          MSD.after(i * 140, function(){
            var hit = MSD.qa('#c-dots i')[n];
            if(hit) hit.classList.add('hit');
            MSD.sfx.data(i);
          });
        });
      });
      MSD.after(1700, function(){ MSD.cls('#c-idx', 'hot', false); MSD.show('#c-hits .msd-reveal', 190); });
      MSD.after(2400, function(){ MSD.cls('#c-hits-f', 'on', true); MSD.sfx.chime(); });
      `,
    },
    {
      title: 'Everything fights for one budget',
      key: 'one budget',
      desc: 'The context window is a fixed number of tokens. Rules, code, retrieved snippets, history and the answer all share it.',
      status: 'packing the context window',
      thinking: false,
      durationMs: 3000,
      js: `
      MSD.cls('.c-sc', 'on', false);
      MSD.cls('#c-sc-win', 'on', true);
      MSD.cls('.c-node', 'hot', false);
      MSD.cls('#c-n1, #c-n2', 'done', true);
      MSD.cls('#c-n3', 'hot', true);
      MSD.cls('#c-e1, #c-e2', 'on', true);
      MSD.hide('#c-sc-win .msd-reveal');
      MSD.cls('.c-dr', 'cut', false);
      MSD.cls('#c-lg-6', 'gone', false);
      MSD.cls('#c-meter', 'full', false);
      MSD.cls('#c-win-b', 'full', false);
      MSD.cls('#c-dr-f', 'on', false);
      MSD.q('#c-win-b').textContent = 'sample budget · 16k tokens';
      MSD.qa('.c-seg').forEach(function(el){ el.style.width = '0'; });
      MSD.q('#c-state').textContent = 'fitting it all in';
      MSD.q('#c-strip-l').textContent = 'THE LIMIT';
      MSD.q('#c-strip-t').textContent = 'A bigger window is still a window. Past the edge, something gets cut.';
      MSD.q('#c-ch1').textContent = 'fixed tokens';
      MSD.q('#c-ch2').textContent = 'ranked, then trimmed';
      MSD.q('#c-ch3').textContent = 'answer needs room';
      MSD.hide('.c-chip');
      MSD.after(60, function(){ MSD.show('.c-chip', 90, true); });

      [['#c-sg-1', '8%'], ['#c-sg-2', '26%'], ['#c-sg-3', '17%'], ['#c-sg-4', '14%'], ['#c-sg-5', '21%'], ['#c-sg-6', '14%']].forEach(function(row, i){
        MSD.after(140 + i * 190, function(){
          var seg = MSD.q(row[0]);
          if(seg) seg.style.width = row[1];
          MSD.sfx.blip(i);
        });
      });
      MSD.after(1350, function(){ MSD.show('#c-cost .msd-reveal', 170); });
      MSD.after(1750, function(){ MSD.show('#c-drop .msd-reveal', 150); });
      MSD.after(2250, function(){
        MSD.q('#c-sg-6').style.width = '0';
        MSD.q('#c-sg-2').style.width = '32%';
        MSD.q('#c-sg-5').style.width = '25%';
        MSD.cls('#c-lg-6', 'gone', true);
        MSD.cls('#c-meter', 'full', true);
        MSD.cls('#c-win-b', 'full', true);
        MSD.q('#c-win-b').textContent = 'full · nothing left over';
        MSD.shake('#c-meter');
      });
      MSD.after(2600, function(){ MSD.cls('#c-dr-1', 'cut', true); MSD.cls('#c-dr-f', 'on', true); MSD.sfx.error(); });
      `,
    },
    {
      title: 'Chat memory is the transcript, resent',
      key: 'the transcript, resent',
      desc: 'Every turn ships the whole conversation again. When it stops fitting, the oldest turns fall out — and it "forgets".',
      status: 'replaying the conversation',
      thinking: true,
      durationMs: 2900,
      js: `
      MSD.cls('.c-sc', 'on', false);
      MSD.cls('#c-sc-chat', 'on', true);
      MSD.cls('.c-node', 'hot', false);
      MSD.cls('#c-n1, #c-n2', 'done', true);
      MSD.cls('#c-n3', 'hot', true);
      MSD.cls('#c-e1, #c-e2', 'on', true);
      MSD.hide('#c-sc-chat .msd-reveal');
      MSD.cls('.c-rp', 'on', false);
      MSD.cls('.c-turn', 'faded', false);
      MSD.cls('.c-turn', 'miss', false);
      MSD.cls('#c-blk-x', 'cut', false);
      MSD.cls('#c-rp-f', 'on', false);
      MSD.q('#c-state').textContent = 'turn 5 · resending turns 1-4';
      MSD.q('#c-strip-l').textContent = 'WHY IT DRIFTS';
      MSD.q('#c-strip-t').textContent = 'It never forgot your rule. Your rule stopped being in the request.';
      MSD.q('#c-ch1').textContent = 'full replay';
      MSD.q('#c-ch2').textContent = 'sliding window';
      MSD.q('#c-ch3').textContent = 'oldest turns cut';
      MSD.hide('.c-chip');
      MSD.after(60, function(){ MSD.show('.c-chip', 90, true); });

      MSD.after(100, function(){ MSD.show('#c-chat .msd-reveal', 130); });
      MSD.after(900, function(){ MSD.cls('#c-rp-1', 'on', true); MSD.sfx.blip(0); });
      MSD.after(1250, function(){ MSD.cls('#c-rp-2', 'on', true); MSD.sfx.blip(2); });
      MSD.after(1600, function(){ MSD.cls('#c-rp-3', 'on', true); MSD.sfx.blip(4); });
      MSD.after(2050, function(){
        MSD.cls('#c-blk-x', 'cut', true);
        MSD.cls('#c-tn-1', 'faded', true);
        MSD.shake('#c-blk-x');
      });
      MSD.after(2400, function(){
        MSD.cls('#c-tn-5', 'miss', true);
        MSD.cls('#c-rp-f', 'on', true);
        MSD.punch('#c-rp-f', 2);
      });
      `,
    },
    {
      title: 'So give it what it needs to know',
      key: 'what it needs',
      desc: 'Instruction files, the right tabs open, explicit #file references and a fresh chat when it drifts. That is the real memory.',
      status: 'you own the context',
      thinking: false,
      durationMs: 2800,
      js: `
      MSD.cls('.c-sc', 'on', false);
      MSD.cls('#c-sc-you', 'on', true);
      MSD.cls('.c-node', 'hot', false);
      MSD.cls('.c-node', 'done', true);
      MSD.cls('.c-edge', 'on', true);
      MSD.hide('#c-sc-you .msd-reveal');
      MSD.q('#c-proj').textContent = 'GitHub Copilot · context you control';
      MSD.q('#c-state').textContent = 'better in, better out';
      MSD.q('#c-strip-l').textContent = 'THE TAKEAWAY';
      MSD.q('#c-strip-t').textContent = 'It never remembered. It re-read — so decide what it gets to read.';
      MSD.q('#c-ch1').textContent = 'instruction files';
      MSD.q('#c-ch2').textContent = 'curated tabs';
      MSD.q('#c-ch3').textContent = 'explicit references';
      MSD.hide('.c-chip');
      MSD.after(60, function(){ MSD.show('.c-chip', 90, true); });
      MSD.after(140, function(){ MSD.show('#c-sc-you .msd-reveal', 230); });
      MSD.after(1500, function(){ MSD.cls('.c-node', 'hot', true); MSD.sfx.sparkle(); });
      MSD.after(2000, function(){ MSD.flash('#c-flow'); MSD.punch('#c-strip', 3); });
      `,
    },
  ],
  end: {
    title: 'It never remembered. It re-read.',
    sub: 'Copilot feels like it knows your codebase because your editor rebuilds the context on every request — and all of it has to fit in one window.',
  },
  post: {
    caption: [
      'An LLM has no memory. None. Between two requests it keeps nothing about you, your repo or your last question.',
      '',
      'So why does Copilot seem to know your codebase?',
      '',
      'Because your editor rebuilds the context every single time: the file around your cursor as a prefix and a suffix, look-alike snippets from the tabs you left open, symbols from your imports, your repo instruction files, code pulled out of the workspace index for #codebase questions, and the entire chat transcript replayed from turn one.',
      '',
      'All of it competes for one fixed token budget. When it stops fitting, the oldest turns get cut, the weakest snippets get dropped, long files get truncated — and the assistant "forgets" the rule you set twenty messages ago. It never forgot. That rule simply was not in the request any more.',
      '',
      'Which is good news, because the context is the part you control: write the rules into an instructions file, keep the files that matter open, point at things explicitly with #file and #selection, and start a fresh chat when the window is full of stale turns.',
      '',
      'What is the one thing you wish your AI assistant would stop forgetting?',
    ].join('\n'),
    hashtags: [
      '#githubcopilot',
      '#ai',
      '#llm',
      '#contextwindow',
      '#promptengineering',
      '#aicoding',
      '#developertools',
      '#vscode',
      '#softwareengineering',
      '#generativeai',
      '#programming',
      '#msdevbuild',
    ],
  },
};
