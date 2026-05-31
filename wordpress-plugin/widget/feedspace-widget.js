"use strict";(()=>{var Y=`
#feedspace-widget-root *,
#feedspace-widget-root *::before,
#feedspace-widget-root *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

#feedspace-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 99998;
}
#feedspace-overlay.feedspace-active {
  pointer-events: auto;
}

#feedspace-widget-root {
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #1f2937;
  position: fixed;
  z-index: 99999;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.feedspace-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 8px 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  pointer-events: auto;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.feedspace-toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
}
.feedspace-toolbar-label {
  font-size: 10px;
  font-weight: 600;
  color: #9ca3af;
  padding: 0 8px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  user-select: none;
}
.feedspace-toolbar-divider {
  width: 1px;
  height: 28px;
  background: rgba(0, 0, 0, 0.06);
  margin: 0 6px;
}

.feedspace-tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.15s ease;
  position: relative;
}
.feedspace-tool-btn:hover {
  background: rgba(99, 102, 241, 0.08);
  color: #6366f1;
  transform: scale(1.05);
}
.feedspace-tool-btn:active {
  transform: scale(0.92);
}
.feedspace-tool-btn.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.feedspace-tool-btn svg {
  width: 20px;
  height: 20px;
}
.feedspace-tool-btn .badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  padding: 0 4px;
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.3);
}

.feedspace-device-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  color: #9ca3af;
  transition: all 0.15s ease;
}
.feedspace-device-btn:hover {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.feedspace-device-btn.active {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}
.feedspace-device-btn svg {
  width: 16px;
  height: 16px;
}

.feedspace-submit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
}
.feedspace-submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
}
.feedspace-submit-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
}
.feedspace-submit-btn svg {
  width: 16px;
  height: 16px;
}

.feedspace-annotation-pin {
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}
.feedspace-annotation-pin:hover {
  transform: scale(1.2);
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.3));
}

.feedspace-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 99998;
  animation: feedspace-fade-in 0.2s ease;
}

.feedspace-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  max-width: 100vw;
  height: 100vh;
  background: #fff;
  z-index: 99999;
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  animation: feedspace-slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.feedspace-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f3f4f6;
}
.feedspace-panel-title {
  font-size: 17px;
  font-weight: 600;
  color: #111827;
}
.feedspace-panel-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.feedspace-panel-close:hover {
  background: #f3f4f6;
  color: #374151;
}
.feedspace-panel-close svg {
  width: 18px;
  height: 18px;
}

.feedspace-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.feedspace-panel-footer {
  padding: 16px 24px 20px;
  border-top: 1px solid #f3f4f6;
}

.feedspace-comment-input-wrap {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}
.feedspace-comment-input {
  flex: 1;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  resize: none;
  min-height: 40px;
  max-height: 120px;
  transition: border-color 0.15s, box-shadow 0.15s;
  line-height: 1.5;
  background: #fff;
  color: #1f2937;
}
.feedspace-comment-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
.feedspace-comment-input::placeholder {
  color: #9ca3af;
}

.feedspace-icon-btn {
  width: 40px;
  height: 40px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.15s;
  flex-shrink: 0;
}
.feedspace-icon-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #6366f1;
}
.feedspace-icon-btn.active {
  background: rgba(99, 102, 241, 0.08);
  border-color: #6366f1;
  color: #6366f1;
}
.feedspace-icon-btn svg {
  width: 18px;
  height: 18px;
}

.feedspace-feedback-item {
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.15s;
}
.feedspace-feedback-item:hover {
  border-color: #e5e7eb;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transform: translateY(-1px);
}
.feedspace-feedback-item.highlight {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.feedspace-feedback-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.feedspace-feedback-type {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: 4px;
  background: #eef2ff;
  color: #6366f1;
}
.feedspace-feedback-status {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
}
.feedspace-feedback-status.open {
  background: #fef3c7;
  color: #d97706;
}
.feedspace-feedback-status.in_progress {
  background: #dbeafe;
  color: #2563eb;
}
.feedspace-feedback-status.resolved {
  background: #d1fae5;
  color: #059669;
}
.feedspace-feedback-status.closed {
  background: #f3f4f6;
  color: #6b7280;
}

.feedspace-feedback-content {
  font-size: 13px;
  color: #374151;
  line-height: 1.6;
  margin-bottom: 8px;
}
.feedspace-feedback-meta {
  font-size: 11px;
  color: #9ca3af;
}

.feedspace-reply {
  margin-top: 10px;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 8px;
}
.feedspace-reply-text {
  font-size: 12px;
  color: #4b5563;
}
.feedspace-reply-meta {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 4px;
}

.feedspace-file-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  margin-top: 6px;
  font-size: 12px;
  color: #374151;
}
.feedspace-file-preview svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
.feedspace-file-preview .remove {
  margin-left: auto;
  cursor: pointer;
  color: #ef4444;
  font-size: 16px;
  line-height: 1;
  font-weight: 600;
}
.feedspace-file-preview .remove:hover {
  color: #dc2626;
}

.feedspace-recording-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ef4444;
  font-size: 13px;
  font-weight: 500;
  padding: 10px 0;
}
.feedspace-recording-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  animation: feedspace-pulse 1s infinite;
}
.feedspace-recording-time {
  font-variant-numeric: tabular-nums;
  color: #6b7280;
}

.feedspace-empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #9ca3af;
}
.feedspace-empty-state svg {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  opacity: 0.3;
}
.feedspace-empty-state p {
  font-size: 14px;
  line-height: 1.6;
}

.feedspace-filter-tabs {
  display: flex;
  gap: 4px;
  padding: 0 24px 12px;
  border-bottom: 1px solid #f3f4f6;
  overflow-x: auto;
}
.feedspace-filter-tab {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  font-family: inherit;
}
.feedspace-filter-tab:hover {
  background: #f3f4f6;
}
.feedspace-filter-tab.active {
  background: #6366f1;
  color: #fff;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.25);
}

@keyframes feedspace-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes feedspace-slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
@keyframes feedspace-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
@keyframes feedspace-heartbeat {
  0% { r: 10; opacity: 1; }
  50% { r: 18; opacity: 0; }
  100% { r: 10; opacity: 0; }
}
@keyframes feedspace-scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.feedspace-name-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  animation: feedspace-fade-in 0.2s ease;
}
.feedspace-name-modal-card {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  width: 360px;
  max-width: 90vw;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2);
  animation: feedspace-scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.feedspace-name-modal h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #111827;
  letter-spacing: -0.01em;
}
.feedspace-name-modal p {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 20px;
  line-height: 1.5;
}
.feedspace-name-modal input {
  width: 100%;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 15px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  margin-bottom: 16px;
  color: #1f2937;
}
.feedspace-name-modal input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
.feedspace-name-modal input::placeholder {
  color: #9ca3af;
}
.feedspace-name-modal .actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.feedspace-name-modal .actions button {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: all 0.15s;
}
.feedspace-name-modal .actions .cancel {
  background: #f3f4f6;
  color: #374151;
}
.feedspace-name-modal .actions .cancel:hover {
  background: #e5e7eb;
}
.feedspace-name-modal .actions .confirm {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
}
.feedspace-name-modal .actions .confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
}

.feedspace-hover-highlight {
  outline: 2px solid #6366f1 !important;
  outline-offset: 2px !important;
  border-radius: 2px;
  transition: outline 0.1s ease;
}

[data-feedspace-tool="pin"] { cursor: crosshair; }
[data-feedspace-tool="rect"] { cursor: crosshair; }
[data-feedspace-tool="arrow"] { cursor: crosshair; }
[data-feedspace-tool="draw"] { cursor: crosshair; }

.feedspace-viewport-wrapper {
  overflow: auto;
  margin: 0 auto;
  background: #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.04), 0 8px 32px rgba(0, 0, 0, 0.08);
  min-height: 100vh;
  transition: max-width 0.3s ease;
}

.feedspace-draw-preview {
  pointer-events: none;
}
`,D=!1;function P(){if(D)return;let l=document.createElement("style");l.textContent=Y,document.head.appendChild(l),D=!0}function F(l,e,t,i){async function o(a,s={}){let d=`${l.replace(/\/+$/,"")}/api${a}`,c=await fetch(d,{...s,headers:{"Content-Type":"application/json",...s.headers}});if(!c.ok)throw new Error(`API error ${c.status}: ${await c.text()}`);return c.json()}async function r(a,s,d){let c=`${t.replace(/\/+$/,"")}/wp-json/feedspace/v1${s}`,p=await fetch(c,{method:a,headers:{"Content-Type":"application/json","X-Feedspace-Key":i},body:d?JSON.stringify(d):void 0});if(!p.ok)throw new Error(`WordPress API error ${p.status}: ${await p.text()}`);return p.json()}let n=!!(t&&i);return{verifyToken:()=>o("/widget/verify-token",{method:"POST",body:JSON.stringify({token:e})}),getAnnotations:(a,s)=>n?r("GET",`/annotations?pageUrl=${encodeURIComponent(a)}&projectId=${encodeURIComponent(s)}`):o(`/widget/annotations?token=${encodeURIComponent(e)}&pageUrl=${encodeURIComponent(a)}`),createAnnotation:a=>n?r("POST","/annotations",a):o("/widget/annotations",{method:"POST",body:JSON.stringify(a)}),updateAnnotation:(a,s)=>n?r("PATCH",`/annotations/${a}`,s):o(`/widget/annotations/${a}`,{method:"PATCH",body:JSON.stringify(s)}),deleteAnnotation:a=>n?r("DELETE",`/annotations/${a}`):o(`/widget/annotations/${a}`,{method:"DELETE"})}}function H(l){let e=l.closest("[data-feedspace-widget-id]");if(e)return e.getAttribute("data-feedspace-widget-id");let t=l.closest("[data-id]");return t?t.getAttribute("data-id"):null}function W(l){if(l.id)return`#${CSS.escape(l.id)}`;let e=H(l);if(e)return`[data-id="${e}"]`;let t=[],i=l;for(;i&&i!==document.body;){let o=i.tagName.toLowerCase(),r=i.parentElement;if(r){let a=Array.from(r.children).filter(s=>s.tagName===i.tagName).indexOf(i)+1;t.unshift(`${o}:nth-of-type(${a})`)}else t.unshift(o);i=r}return t.join(" > ")}function M(l){return(l.textContent||"").trim().slice(0,80)}function B(l){let e=l.tagName.toLowerCase(),t=M(l),i=Array.from(l.attributes).filter(n=>["class","style","src","href","alt","title"].includes(n.name)).map(n=>`${n.name}=${n.value}`).join("|"),o=`${e}|${t}|${i}`,r=0;for(let n=0;n<o.length;n++){let a=o.charCodeAt(n);r=(r<<5)-r+a,r|=0}return Math.abs(r).toString(36)}function N(l){let e=l,t=l.closest("[data-feedspace-widget-id],[data-id]");return t&&(e=t),{selector:W(e),tag:e.tagName.toLowerCase(),text:M(e),fingerprint:B(e),dataId:H(e)}}function x(l){if(l.selector)try{let t=document.querySelector(l.selector);if(t)return t}catch{}if(l.dataId){let t=document.querySelector(`[data-id="${l.dataId}"]`);if(t)return t}let e=document.querySelectorAll(l.tag);for(let t of e){let i=M(t);if(i===l.text||i.includes(l.text))return t}for(let t of e)if(B(t)===l.fingerprint)return t;return null}function R(l){let e=l.closest("[data-feedspace-widget-id],[data-id]");if(e)return e;let t=l.closest("h1,h2,h3,h4,h5,h6,p,a,button,img,section,article,figure");return t||l}function y(l,e,t){let i=l.getBoundingClientRect();return{x:(e-i.left-window.scrollX)/i.width*100,y:(t-i.top-window.scrollY)/i.height*100}}function L(l,e,t){let i=l.getBoundingClientRect();return{x:i.left+window.scrollX+i.width*e/100,y:i.top+window.scrollY+i.height*t/100}}var A=class{constructor(){this.svg=null;this.annotations=[];this.callbacks=null;this.filter="all";this.selectedId=null}init(e){this.callbacks=e,this.createSVG()}createSVG(){let e=document.getElementById("feedspace-overlay");e||(e=document.createElementNS("http://www.w3.org/2000/svg","svg"),e.id="feedspace-overlay",document.body.appendChild(e)),this.svg=e}setAnnotations(e){this.annotations=e,this.renderAll()}setFilter(e){this.filter=e,this.renderAll()}setSelected(e){this.selectedId=e,this.renderAll()}getFiltered(){return this.filter==="all"?this.annotations:this.annotations.filter(e=>e.status===this.filter)}renderAll(){if(!this.svg)return;for(;this.svg.firstChild;)this.svg.removeChild(this.svg.firstChild);let e=document.createElementNS("http://www.w3.org/2000/svg","defs"),t=document.createElementNS("http://www.w3.org/2000/svg","marker");t.setAttribute("id","feedspace-arrowhead"),t.setAttribute("markerWidth","10"),t.setAttribute("markerHeight","7"),t.setAttribute("refX","10"),t.setAttribute("refY","3.5"),t.setAttribute("orient","auto");let i=document.createElementNS("http://www.w3.org/2000/svg","polygon");i.setAttribute("points","0 0, 10 3.5, 0 7"),i.setAttribute("fill","#6366f1"),t.appendChild(i),e.appendChild(t),this.svg.appendChild(e);let o=this.getFiltered(),r=window.scrollX,n=window.scrollY;this.svg.setAttribute("style",`position:absolute;top:0;left:0;width:${document.documentElement.scrollWidth}px;height:${document.documentElement.scrollHeight}px;pointer-events:none;z-index:99998;`);for(let a=0;a<o.length;a++)this.renderOne(o[a],a,r,n)}renderOne(e,t,i,o){let r=e.elementDna?x(e.elementDna):null;if(!r)return;let n=L(r,e.anchorXPct,e.anchorYPct),a=this.createBadge(t+1,e.id,e.status);switch(e.type){case"pin":this.renderPin(n.x,n.y,a);break;case"rect":this.renderRect(e,r,n,a);break;case"arrow":this.renderArrow(e,r,n,a);break;case"draw":this.renderDraw(e,r,n,a);break}}renderPin(e,t,i){let o=document.createElementNS("http://www.w3.org/2000/svg","g");o.appendChild(i),o.setAttribute("transform",`translate(${e}, ${t})`),o.style.pointerEvents="auto",this.svg.appendChild(o)}renderRect(e,t,i,o){let r=t.getBoundingClientRect(),n=e.widthPct?r.width*e.widthPct/100:80,a=e.heightPct?r.height*e.heightPct/100:60,s=document.createElementNS("http://www.w3.org/2000/svg","g"),d=document.createElementNS("http://www.w3.org/2000/svg","rect");d.setAttribute("x",String(i.x)),d.setAttribute("y",String(i.y)),d.setAttribute("width",String(n)),d.setAttribute("height",String(a)),d.setAttribute("fill","rgba(99, 102, 241, 0.08)"),d.setAttribute("stroke","#6366f1"),d.setAttribute("stroke-width","2"),d.setAttribute("stroke-dasharray","6,3"),d.setAttribute("rx","4"),s.appendChild(d),o.setAttribute("transform",`translate(${i.x-8}, ${i.y-8})`),s.appendChild(o),s.style.pointerEvents="auto",this.svg.appendChild(s)}renderArrow(e,t,i,o){let r=i.x+100,n=i.y+100;if(e.endElementDna){let d=x(e.endElementDna);if(d&&e.endAnchorXPct!=null&&e.endAnchorYPct!=null){let c=L(d,e.endAnchorXPct,e.endAnchorYPct);r=c.x,n=c.y}}let a=document.createElementNS("http://www.w3.org/2000/svg","g"),s=document.createElementNS("http://www.w3.org/2000/svg","line");s.setAttribute("x1",String(i.x)),s.setAttribute("y1",String(i.y)),s.setAttribute("x2",String(r)),s.setAttribute("y2",String(n)),s.setAttribute("stroke","#6366f1"),s.setAttribute("stroke-width","2"),s.setAttribute("marker-end","url(#feedspace-arrowhead)"),a.appendChild(s),o.setAttribute("transform",`translate(${i.x-8}, ${i.y-8})`),a.appendChild(o),a.style.pointerEvents="auto",this.svg.appendChild(a)}renderDraw(e,t,i,o){var n,a;let r=document.createElementNS("http://www.w3.org/2000/svg","g");if((n=e.drawData)!=null&&n.pathD){let s=document.createElementNS("http://www.w3.org/2000/svg","path");s.setAttribute("d",e.drawData.pathD),s.setAttribute("fill","none"),s.setAttribute("stroke","#6366f1"),s.setAttribute("stroke-width","2"),s.setAttribute("stroke-linecap","round"),s.setAttribute("stroke-linejoin","round"),r.appendChild(s)}if((a=e.drawData)!=null&&a.points&&e.drawData.points.length>1){let s=e.drawData.points,d=t.getBoundingClientRect(),c=document.createElementNS("http://www.w3.org/2000/svg","polyline"),p=s.map(h=>{let f=d.left+window.scrollX+d.width*h.x/100,u=d.top+window.scrollY+d.height*h.y/100;return`${f},${u}`}).join(" ");c.setAttribute("points",p),c.setAttribute("fill","none"),c.setAttribute("stroke","#6366f1"),c.setAttribute("stroke-width","2"),c.setAttribute("stroke-linecap","round"),c.setAttribute("stroke-linejoin","round"),r.appendChild(c)}o.setAttribute("transform",`translate(${i.x-8}, ${i.y-8})`),r.appendChild(o),r.style.pointerEvents="auto",this.svg.appendChild(r)}createBadge(e,t,i){let o=document.createElementNS("http://www.w3.org/2000/svg","g");o.setAttribute("data-annotation-id",t),o.classList.add("feedspace-annotation-pin"),o.style.cursor="pointer";let r="#6366f1";(i==="resolved"||i==="closed")&&(r="#10b981"),i==="in_progress"&&(r="#f59e0b");let n=document.createElementNS("http://www.w3.org/2000/svg","circle");n.setAttribute("cx","10"),n.setAttribute("cy","10"),n.setAttribute("r","10"),n.setAttribute("fill",r),n.setAttribute("stroke","#fff"),n.setAttribute("stroke-width","2");let a=document.createElementNS("http://www.w3.org/2000/svg","text");if(a.setAttribute("x","10"),a.setAttribute("y","10"),a.setAttribute("text-anchor","middle"),a.setAttribute("dominant-baseline","central"),a.setAttribute("fill","#fff"),a.setAttribute("font-size","11"),a.setAttribute("font-weight","600"),a.textContent=String(e),this.selectedId===t){let s=document.createElementNS("http://www.w3.org/2000/svg","circle");s.setAttribute("cx","10"),s.setAttribute("cy","10"),s.setAttribute("r","10"),s.setAttribute("fill","none"),s.setAttribute("stroke",r),s.setAttribute("stroke-width","2");let d=document.createElementNS("http://www.w3.org/2000/svg","animate");d.setAttribute("attributeName","r"),d.setAttribute("values","10;20;10"),d.setAttribute("dur","1.5s"),d.setAttribute("repeatCount","indefinite"),s.appendChild(d);let c=document.createElementNS("http://www.w3.org/2000/svg","animate");c.setAttribute("attributeName","opacity"),c.setAttribute("values","1;0;1"),c.setAttribute("dur","1.5s"),c.setAttribute("repeatCount","indefinite"),s.appendChild(c),o.appendChild(s)}return o.appendChild(n),o.appendChild(a),o.addEventListener("click",s=>{var d;s.stopPropagation(),(d=this.callbacks)==null||d.onAnnotationClick(t)}),o}destroy(){this.svg&&this.svg.parentNode&&this.svg.parentNode.removeChild(this.svg),this.svg=null,this.annotations=[]}};var E=class{constructor(){this.root=null;this.overlay=null;this.callbacks=null;this.annotation=null;this.files=[];this.inputEl=null;this.onClose=null}open(e,t,i){this.annotation=e,this.callbacks=t,this.onClose=i,this.files=[],this.render()}close(){this.overlay&&this.overlay.parentNode&&this.overlay.parentNode.removeChild(this.overlay),this.root&&this.root.parentNode&&this.root.parentNode.removeChild(this.root),this.overlay=null,this.root=null}render(){this.close(),this.overlay=document.createElement("div"),this.overlay.className="feedspace-panel-overlay",this.overlay.addEventListener("click",()=>this.close()),document.body.appendChild(this.overlay),this.root=document.createElement("div"),this.root.className="feedspace-panel";let e=!this.annotation,t=e?"Add Feedback":"Feedback Details",i=document.createElement("div");i.className="feedspace-panel-header",i.innerHTML=`
      <span class="feedspace-panel-title">${t}</span>
      <button class="feedspace-panel-close" id="feedspace-panel-close">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `,this.root.appendChild(i),i.querySelector("#feedspace-panel-close").addEventListener("click",()=>this.close());let o=document.createElement("div");if(o.className="feedspace-panel-body",!e&&this.annotation){let f=document.createElement("div");if(f.className="feedspace-feedback-item",f.style.cursor="default",f.innerHTML=`
        <div class="feedspace-feedback-item-header">
          <span class="feedspace-feedback-type">${this.annotation.type}</span>
          <span class="feedspace-feedback-status ${this.annotation.status}">${this.annotation.status.replace("_"," ")}</span>
        </div>
        <div class="feedspace-feedback-content">${k(this.annotation.content)}</div>
        <div class="feedspace-feedback-meta">${k(this.annotation.createdBy)} \xB7 ${new Date(this.annotation.createdAt).toLocaleString()}</div>
      `,o.appendChild(f),this.annotation.replies&&this.annotation.replies.length>0){let u=document.createElement("div");u.style.cssText="font-size:13px;font-weight:600;color:#374151;margin:12px 0 8px;",u.textContent="Replies",o.appendChild(u);for(let b of this.annotation.replies){let g=document.createElement("div");g.className="feedspace-reply",g.innerHTML=`
            <div class="feedspace-reply-text">${k(b.content)}</div>
            <div class="feedspace-reply-meta">${k(b.createdBy)} \xB7 ${new Date(b.createdAt).toLocaleString()}</div>
          `,o.appendChild(g)}}}let r=document.createElement("div");r.style.cssText="font-size:13px;font-weight:600;color:#374151;margin-top:16px;margin-bottom:8px;",r.textContent=e?"Add Comment":"Reply",o.appendChild(r);let n=document.createElement("textarea");n.className="feedspace-comment-input",n.placeholder="Type your feedback here...",n.rows=3,n.style.width="100%",o.appendChild(n),this.inputEl=n;let a=document.createElement("div");a.style.cssText="display:flex;gap:8px;margin-top:12px;",a.innerHTML=`
      <button class="feedspace-icon-btn" id="feedspace-attach-btn" title="Attach file">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
      </button>
      <button class="feedspace-icon-btn" id="feedspace-record-btn" title="Record voice">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
      </button>
    `,o.appendChild(a);let s=document.createElement("input");s.type="file",s.multiple=!0,s.style.display="none",s.accept="image/*,video/*,audio/*,.pdf,.doc,.docx",o.appendChild(s);let d=document.createElement("div");d.id="feedspace-file-previews",o.appendChild(d);let c=document.createElement("div");c.id="feedspace-recording-indicator",c.style.display="none",c.className="feedspace-recording-indicator",c.innerHTML=`
      <span class="feedspace-recording-dot"></span>
      <span class="feedspace-recording-time">0:00</span>
      <button class="feedspace-icon-btn" id="feedspace-stop-recording" style="margin-left:auto;color:#ef4444;border-color:#ef4444;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
      </button>
    `,o.appendChild(c),this.root.appendChild(o);let p=document.createElement("div");p.className="feedspace-panel-footer";let h=document.createElement("button");h.className="feedspace-submit-btn",h.style.width="100%",h.style.justifyContent="center",h.innerHTML=`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      ${e?"Submit Feedback":"Send Reply"}
    `,h.addEventListener("click",()=>this.handleSubmit()),p.appendChild(h),this.root.appendChild(p),document.body.appendChild(this.root),a.querySelector("#feedspace-attach-btn").addEventListener("click",()=>s.click()),a.querySelector("#feedspace-record-btn").addEventListener("click",()=>{var f,u,b;(f=this.callbacks)!=null&&f.isRecording?(u=this.callbacks)==null||u.onStopRecording():(b=this.callbacks)==null||b.onStartRecording()}),s.addEventListener("change",()=>{let f=Array.from(s.files||[]);this.files=[...this.files,...f],this.updateFilePreviews(d,s),s.value=""}),setTimeout(()=>n.focus(),100)}updateFilePreviews(e,t){e.innerHTML="";for(let i=0;i<this.files.length;i++){let o=this.files[i],r=document.createElement("div");r.className="feedspace-file-preview",r.innerHTML=`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        <span>${k(o.name)} (${(o.size/1024).toFixed(0)} KB)</span>
        <span class="remove" data-idx="${i}">&times;</span>
      `,r.querySelector(".remove").addEventListener("click",()=>{this.files.splice(i,1),this.updateFilePreviews(e,t)}),e.appendChild(r)}}handleSubmit(){var t,i;let e=((t=this.inputEl)==null?void 0:t.value.trim())||"";!e&&this.files.length===0||((i=this.callbacks)==null||i.onSubmit(e,this.files),this.inputEl&&(this.inputEl.value=""),this.files=[])}};function k(l){let e=document.createElement("div");return e.textContent=l,e.innerHTML}var S=class{constructor(){this.root=null;this.overlay=null;this.callbacks=null;this.annotations=[];this.currentFilter="all";this.onClose=null}open(e,t,i){this.annotations=e,this.callbacks=t,this.onClose=i,this.render()}close(){this.overlay&&this.overlay.parentNode&&this.overlay.parentNode.removeChild(this.overlay),this.root&&this.root.parentNode&&this.root.parentNode.removeChild(this.root),this.overlay=null,this.root=null}updateAnnotations(e){this.annotations=e,this.root&&this.renderList()}render(){this.close(),this.overlay=document.createElement("div"),this.overlay.className="feedspace-panel-overlay",this.overlay.addEventListener("click",()=>this.close()),document.body.appendChild(this.overlay),this.root=document.createElement("div"),this.root.className="feedspace-panel";let e=document.createElement("div");e.className="feedspace-panel-header",e.innerHTML=`
      <span class="feedspace-panel-title">Feedback List</span>
      <button class="feedspace-panel-close" id="feedback-list-close">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `,this.root.appendChild(e),e.querySelector("#feedback-list-close").addEventListener("click",()=>this.close());let t=document.createElement("div");t.className="feedspace-filter-tabs";let i=[{value:"all",label:"All"},{value:"open",label:"Open"},{value:"in_progress",label:"In Progress"},{value:"resolved",label:"Resolved"}];for(let r of i){let n=document.createElement("button");n.className=`feedspace-filter-tab${this.currentFilter===r.value?" active":""}`,n.textContent=r.label,n.dataset.filter=r.value,n.addEventListener("click",()=>{var a;this.currentFilter=r.value,t.querySelectorAll(".feedspace-filter-tab").forEach(s=>s.classList.remove("active")),n.classList.add("active"),(a=this.callbacks)==null||a.onFilterChange(r.value)}),t.appendChild(n)}this.root.appendChild(t);let o=document.createElement("div");o.className="feedspace-panel-body",o.id="feedback-list-body",this.root.appendChild(o),document.body.appendChild(this.root),this.renderList()}renderList(){var i;let e=(i=this.root)==null?void 0:i.querySelector("#feedback-list-body");if(!e)return;e.innerHTML="";let t=this.currentFilter==="all"?this.annotations:this.annotations.filter(o=>o.status===this.currentFilter);if(t.length===0){e.innerHTML=`
        <div class="feedspace-empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          <p>No feedback items yet</p>
        </div>
      `;return}for(let o of t){let r=document.createElement("div");r.className="feedspace-feedback-item",r.dataset.annotationId=o.id,r.innerHTML=`
        <div class="feedspace-feedback-item-header">
          <span class="feedspace-feedback-type">${o.type}</span>
          <span class="feedspace-feedback-status ${o.status}">${o.status.replace("_"," ")}</span>
        </div>
        <div class="feedspace-feedback-content">${j(o.content)}</div>
        <div class="feedspace-feedback-meta">${j(o.createdBy)} \xB7 ${new Date(o.createdAt).toLocaleString()}</div>
      `,r.addEventListener("click",()=>{var n;e.querySelectorAll(".feedspace-feedback-item").forEach(a=>a.classList.remove("highlight")),r.classList.add("highlight"),(n=this.callbacks)==null||n.onSelectAnnotation(o.id)}),e.appendChild(r)}}};function j(l){let e=document.createElement("div");return e.textContent=l,e.innerHTML}async function $(l,e,t,i){let o=new FormData;o.append("file",t),i&&o.append("project_id",i);let r=l.replace(/\/+$/,""),n=await fetch(`${r}/wp-json/feedspace/v1/media`,{method:"POST",headers:{"X-Feedspace-Key":e},body:o});if(!n.ok)throw new Error(`WordPress upload failed: ${n.status}`);return n.json()}function v(l,e){let t=window.__feedspaceDebug;t&&Array.isArray(t)&&t.push({msg:l,data:e,time:Date.now()}),console.log("[Feedspace]",l,e||"")}var m={select:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3l14 8-7 2-3 7z"/></svg>',pin:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>',rect:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>',arrow:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="19" x2="19" y2="5"/><polyline points="12 5 19 5 19 12"/></svg>',draw:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',desktop:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',tablet:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',mobile:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',submit:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'},C=class{constructor(e,t){this.annotations=[];this.currentTool="select";this.deviceMode="desktop";this.filterMode="all";this.clientName="";this.isDrawing=!1;this.drawStart=null;this.drawPoints=[];this.tempSvgEl=null;this.isRecording=!1;this.mediaRecorder=null;this.audioChunks=[];this.recordingStartTime=0;this.recordingTimer=null;this.toolbarRoot=null;this.nameModal=null;this.hoverHighlightEl=null;this.config=e,this.api=t,this.renderer=new A,this.commentPanel=new E,this.feedbackList=new S}async init(){if(v("AnnotationEngine.init() called"),this.clientName=localStorage.getItem("feedspace_client_name")||"",v("clientName from localStorage:",this.clientName||"(empty)"),!this.clientName){v("No client name \u2014 showing name modal"),this.showNameModal();return}v("Client name found \u2014 booting directly"),this.boot()}showNameModal(){if(v("showNameModal() called"),this.nameModal){v("nameModal already exists \u2014 skipping");return}let e=document.createElement("div");e.className="feedspace-name-modal",e.innerHTML=`
      <div class="feedspace-name-modal-card">
        <h3>What is your name?</h3>
        <p>This will be shown with your feedback.</p>
        <input type="text" id="feedspace-name-input" placeholder="Your name..." maxlength="50" autocomplete="off">
        <div class="actions">
          <button class="cancel" id="feedspace-name-skip">Skip</button>
          <button class="confirm" id="feedspace-name-continue">Continue</button>
        </div>
      </div>
    `,document.body.appendChild(e),this.nameModal=e,v("Name modal appended to body");let t=e.querySelector("#feedspace-name-input");t.focus(),e.querySelector("#feedspace-name-skip").addEventListener("click",()=>{this.clientName="Anonymous",localStorage.setItem("feedspace_client_name",this.clientName),this.destroyNameModal(),this.boot()}),e.querySelector("#feedspace-name-continue").addEventListener("click",()=>{this.clientName=t.value.trim()||"Anonymous",localStorage.setItem("feedspace_client_name",this.clientName),this.destroyNameModal(),this.boot()}),t.addEventListener("keydown",i=>{var o;i.key==="Enter"&&((o=e.querySelector("#feedspace-name-continue"))==null||o.click())})}destroyNameModal(){this.nameModal&&this.nameModal.parentNode&&this.nameModal.parentNode.removeChild(this.nameModal),this.nameModal=null}boot(){v("boot() called \u2014 initializing renderer, toolbar, drawing, annotations"),this.renderer.init({onAnnotationClick:e=>this.onAnnotationClick(e)}),this.buildToolbar(),this.attachDrawingListeners(),this.loadAnnotations(),v("boot() complete")}buildToolbar(){var e,t;this.toolbarRoot=document.createElement("div"),this.toolbarRoot.id="feedspace-widget-root",this.toolbarRoot.innerHTML=`
      <div class="feedspace-toolbar">
        <div class="feedspace-toolbar-group">
          <div class="feedspace-toolbar-label">Tools</div>
          <button class="feedspace-tool-btn active" data-tool="select" title="Select">${m.select}</button>
          <button class="feedspace-tool-btn" data-tool="pin" title="Add Pin">${m.pin}</button>
          <button class="feedspace-tool-btn" data-tool="rect" title="Add Rectangle">${m.rect}</button>
          <button class="feedspace-tool-btn" data-tool="arrow" title="Add Arrow">${m.arrow}</button>
          <button class="feedspace-tool-btn" data-tool="draw" title="Freehand Draw">${m.draw}</button>
        </div>
        <div class="feedspace-toolbar-divider"></div>
        <div class="feedspace-toolbar-group">
          <div class="feedspace-toolbar-label">View</div>
          <button class="feedspace-device-btn active" data-device="desktop" title="Desktop">${m.desktop}</button>
          <button class="feedspace-device-btn" data-device="tablet" title="Tablet">${m.tablet}</button>
          <button class="feedspace-device-btn" data-device="mobile" title="Mobile">${m.mobile}</button>
        </div>
        <div class="feedspace-toolbar-divider"></div>
        <div class="feedspace-toolbar-group">
          <button class="feedspace-tool-btn" data-action="list" title="Feedback List" id="feedspace-list-btn">
            ${m.list}
            <span class="badge" id="feedspace-list-count" style="display:none">0</span>
          </button>
        </div>
        <div class="feedspace-toolbar-divider"></div>
        <button class="feedspace-submit-btn" data-action="submit" title="Finish reviewing">
          ${m.submit}
          Finish Review
        </button>
      </div>
    `,document.body.appendChild(this.toolbarRoot),this.toolbarRoot.querySelectorAll("[data-tool]").forEach(i=>{i.addEventListener("click",()=>this.setTool(i.getAttribute("data-tool")))}),this.toolbarRoot.querySelectorAll("[data-device]").forEach(i=>{i.addEventListener("click",()=>this.setDevice(i.getAttribute("data-device")))}),(e=this.toolbarRoot.querySelector('[data-action="list"]'))==null||e.addEventListener("click",()=>{this.feedbackList.open(this.annotations,{onSelectAnnotation:i=>this.focusAnnotation(i),onFilterChange:i=>{this.filterMode=i,this.renderer.setFilter(i)}},()=>{})}),(t=this.toolbarRoot.querySelector('[data-action="submit"]'))==null||t.addEventListener("click",()=>{this.showToast("Feedback saved! Thanks for your input.")})}setTool(e){var i;this.currentTool=this.currentTool===e?"select":e,(i=this.toolbarRoot)==null||i.querySelectorAll("[data-tool]").forEach(o=>{o.classList.toggle("active",o.getAttribute("data-tool")===this.currentTool)}),document.body.setAttribute("data-feedspace-tool",this.currentTool),this.currentTool==="select"&&this.clearHoverHighlight();let t=document.getElementById("feedspace-overlay");t&&t.classList.toggle("feedspace-active",this.currentTool==="select"),this.cleanupDrawState()}setDevice(e){var o,r;this.deviceMode=e,(o=this.toolbarRoot)==null||o.querySelectorAll("[data-device]").forEach(n=>{n.classList.toggle("active",n.getAttribute("data-device")===e)});let t=document.body,i=document.getElementById("feedspace-viewport-wrapper");if(i&&((r=i.parentNode)==null||r.removeChild(i)),e==="desktop")t.style.maxWidth="",t.style.margin="",t.style.boxShadow="";else{let n=e==="tablet"?"768px":"375px";t.style.maxWidth=n,t.style.margin="0 auto",t.style.boxShadow="0 0 0 1px rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.1)"}document.documentElement.style.background=e!=="desktop"?"#e5e7eb":"",this.renderer.renderAll()}attachDrawingListeners(){document.addEventListener("mousedown",e=>this.onMouseDown(e)),document.addEventListener("mousemove",e=>this.onMouseMove(e)),document.addEventListener("mouseup",e=>this.onMouseUp(e)),document.addEventListener("mouseleave",()=>this.clearHoverHighlight())}updateHoverHighlight(e){if(this.currentTool==="select"){this.clearHoverHighlight();return}let t=R(e.target);t!==this.hoverHighlightEl&&(this.clearHoverHighlight(),t&&t!==document.body&&(t.classList.add("feedspace-hover-highlight"),this.hoverHighlightEl=t))}clearHoverHighlight(){this.hoverHighlightEl&&(this.hoverHighlightEl.classList.remove("feedspace-hover-highlight"),this.hoverHighlightEl=null)}onMouseDown(e){var r;if(this.currentTool==="select"||e.button!==0||(r=e.target)!=null&&r.closest("#feedspace-widget-root, #feedspace-overlay, .feedspace-panel, .feedspace-panel-overlay, .feedspace-name-modal"))return;e.preventDefault(),this.isDrawing=!0;let t=R(e.target),i=N(t),o=y(t,e.pageX,e.pageY);this.drawStart={x:e.pageX,y:e.pageY,el:t,dna:i},this.drawPoints=[{x:o.x,y:o.y}],this.currentTool==="pin"&&this.finishDrawing(t,i,[{x:o.x,y:o.y}])}onMouseMove(e){if(!this.isDrawing||!this.drawStart){this.updateHoverHighlight(e);return}let t=document.getElementById("feedspace-overlay");if(!t)return;this.removeTempPreview(t);let i=this.drawStart.el,o=this.drawStart.dna,r=y(i,e.pageX,e.pageY);if(this.currentTool==="rect"){let n=i.getBoundingClientRect(),a=this.drawStart.x-window.scrollX,s=this.drawStart.y-window.scrollY,d=e.pageX-window.scrollX,c=e.pageY-window.scrollY,p=document.createElementNS("http://www.w3.org/2000/svg","rect");p.setAttribute("x",String(Math.min(a,d))),p.setAttribute("y",String(Math.min(s,c))),p.setAttribute("width",String(Math.abs(d-a))),p.setAttribute("height",String(Math.abs(c-s))),p.setAttribute("fill","rgba(99, 102, 241, 0.1)"),p.setAttribute("stroke","#6366f1"),p.setAttribute("stroke-width","2"),p.setAttribute("stroke-dasharray","6,3"),p.setAttribute("rx","4"),t.appendChild(p),this.tempSvgEl=p}if(this.currentTool==="arrow"){let n=document.createElementNS("http://www.w3.org/2000/svg","line");n.setAttribute("x1",String(this.drawStart.x)),n.setAttribute("y1",String(this.drawStart.y)),n.setAttribute("x2",String(e.pageX)),n.setAttribute("y2",String(e.pageY)),n.setAttribute("stroke","#6366f1"),n.setAttribute("stroke-width","2"),n.setAttribute("stroke-dasharray","5,3"),n.setAttribute("marker-end","url(#feedspace-arrowhead)"),t.appendChild(n),this.tempSvgEl=n}if(this.currentTool==="draw"){let n=y(i,e.pageX,e.pageY);this.drawPoints.push({x:n.x,y:n.y});let a=i.getBoundingClientRect(),s=document.createElementNS("http://www.w3.org/2000/svg","polyline"),d=this.drawPoints.map(c=>{let p=a.left+window.scrollX+a.width*c.x/100,h=a.top+window.scrollY+a.height*c.y/100;return`${p},${h}`}).join(" ");s.setAttribute("points",d),s.setAttribute("fill","none"),s.setAttribute("stroke","#6366f1"),s.setAttribute("stroke-width","2"),s.setAttribute("stroke-linecap","round"),s.setAttribute("stroke-linejoin","round"),t.appendChild(s),this.tempSvgEl=s}}onMouseUp(e){if(!this.isDrawing||!this.drawStart)return;if(this.currentTool==="pin"){this.isDrawing=!1;return}this.isDrawing=!1;let t=document.getElementById("feedspace-overlay");t&&this.removeTempPreview(t);let{el:i,dna:o}=this.drawStart;this.finishDrawing(i,o,this.drawPoints.length>1?this.drawPoints:[{x:50,y:50}])}removeTempPreview(e){this.tempSvgEl&&e.contains(this.tempSvgEl)&&e.removeChild(this.tempSvgEl),this.tempSvgEl=null}finishDrawing(e,t,i){let o=i[0],r=y(e,this.drawStart.x,this.drawStart.y);this.commentPanel.open(null,{onSubmit:(n,a)=>this.saveAnnotation(n,a,e,t,o,i),onStartRecording:()=>this.startRecording(),onStopRecording:()=>this.stopRecording(),onDeleteRecording:()=>this.deleteRecording(),isRecording:this.isRecording},()=>{}),this.cleanupDrawState()}cleanupDrawState(){this.isDrawing=!1,this.drawStart=null,this.drawPoints=[],this.tempSvgEl=null}async saveAnnotation(e,t,i,o,r,n){var u,b;let a=i.getBoundingClientRect(),s=n[n.length-1],d=this.currentTool==="arrow"?N(document.elementFromPoint(((u=this.drawStart)==null?void 0:u.x)||0,((b=this.drawStart)==null?void 0:b.y)||0)||i):null,c=null;this.currentTool==="draw"&&n.length>1&&(c=JSON.stringify({pathD:"",points:n.map(g=>({x:g.x,y:g.y}))}));let p={device:this.deviceMode,elementTag:o.tag,elementText:o.text},h=this.currentTool==="select"?"pin":this.currentTool,f={projectId:this.config.projectId,previewToken:this.config.token,type:h,content:e,pageUrl:this.config.pageUrl,selector:o.selector,elementDna:o,coordinatesX:r.x,coordinatesY:r.y,coordinatesXEnd:d&&s?s.x:null,coordinatesYEnd:d&&s?s.y:null,width:this.currentTool==="rect"?Math.abs(s.x-r.x):null,height:this.currentTool==="rect"?Math.abs(s.y-r.y):null,drawData:c,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight,device:this.deviceMode,createdBy:this.clientName,metaData:p};try{let g=[];if(t.length>0)for(let z of t)try{let T=await $(this.config.wpApiUrl,this.config.wpApiKey,z,this.config.projectId);g.push(T.url)}catch(T){console.error("Upload failed",T)}let I=await this.api.createAnnotation(f);this.annotations.push(I),this.renderer.setAnnotations(this.annotations),this.updateBadge(),this.commentPanel.close(),this.showToast("Feedback saved!")}catch(g){console.error("Failed to save annotation",g),this.showToast("Failed to save feedback. Please try again.")}}async loadAnnotations(){try{this.annotations=await this.api.getAnnotations(this.config.pageUrl,this.config.projectId),this.renderer.setAnnotations(this.annotations),this.updateBadge()}catch(e){console.error("Failed to load annotations",e)}}onAnnotationClick(e){let t=this.annotations.find(i=>i.id===e);t&&(this.renderer.setSelected(e),this.commentPanel.open(t,{onSubmit:async(i,o)=>{try{let r=[];for(let a of o)try{let s=await $(this.config.wpApiUrl,this.config.wpApiKey,a,this.config.projectId);r.push(s.url)}catch{}let n=await this.api.updateAnnotation(e,{...t,replies:[...t.replies||[],{id:"",content:i,createdBy:this.clientName,createdAt:new Date().toISOString()}]});await this.loadAnnotations(),this.renderer.setSelected(null),this.commentPanel.close()}catch(r){console.error("Failed to add reply",r)}},onStartRecording:()=>this.startRecording(),onStopRecording:()=>this.stopRecording(),onDeleteRecording:()=>this.deleteRecording(),isRecording:this.isRecording},()=>{this.renderer.setSelected(null)}))}focusAnnotation(e){this.renderer.setSelected(e);let t=this.annotations.find(i=>i.id===e);if(t!=null&&t.elementDna){let i=x(t.elementDna);i&&i.scrollIntoView({behavior:"smooth",block:"center"})}}updateBadge(){let e=document.getElementById("feedspace-list-count");if(!e)return;let t=this.annotations.length;e.textContent=String(t),e.style.display=t>0?"":"none"}startRecording(){var e;(e=navigator.mediaDevices)!=null&&e.getUserMedia&&navigator.mediaDevices.getUserMedia({audio:!0}).then(t=>{this.mediaRecorder=new MediaRecorder(t),this.audioChunks=[],this.isRecording=!0,this.recordingStartTime=Date.now(),this.mediaRecorder.ondataavailable=i=>{i.data.size>0&&this.audioChunks.push(i.data)},this.mediaRecorder.onstop=()=>{t.getTracks().forEach(i=>i.stop())},this.mediaRecorder.start(),this.recordingTimer&&clearInterval(this.recordingTimer),this.recordingTimer=window.setInterval(()=>{let i=Math.floor((Date.now()-this.recordingStartTime)/1e3),o=Math.floor(i/60),r=i%60,n=document.getElementById("feedspace-recording-indicator");if(n){n.style.display="flex";let a=n.querySelector(".feedspace-recording-time");a&&(a.textContent=`${o}:${String(r).padStart(2,"0")}`)}},1e3)}).catch(()=>{this.showToast("Microphone access denied")})}stopRecording(){this.mediaRecorder&&this.mediaRecorder.state!=="inactive"&&this.mediaRecorder.stop(),this.isRecording=!1,this.recordingTimer&&(clearInterval(this.recordingTimer),this.recordingTimer=null);let e=document.getElementById("feedspace-recording-indicator");e&&(e.style.display="none");let t=new Blob(this.audioChunks,{type:"audio/webm"}),i=new File([t],`recording-${Date.now()}.webm`,{type:"audio/webm"}),o=document.getElementById("feedspace-file-previews");if(o){let r=document.createElement("div");r.className="feedspace-file-preview",r.innerHTML=`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg>
        <span>Voice recording (${(i.size/1024).toFixed(0)} KB)</span>
      `,o.appendChild(r)}}deleteRecording(){this.isRecording=!1,this.mediaRecorder&&this.mediaRecorder.state!=="inactive"&&this.mediaRecorder.stop(),this.recordingTimer&&(clearInterval(this.recordingTimer),this.recordingTimer=null),this.audioChunks=[];let e=document.getElementById("feedspace-recording-indicator");e&&(e.style.display="none")}showToast(e){let t=document.getElementById("feedspace-toast");t&&t.remove();let i=document.createElement("div");i.id="feedspace-toast",i.style.cssText=`
      position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
      background:#1f2937;color:#fff;padding:10px 20px;border-radius:8px;
      font-size:13px;font-family:'Poppins',sans-serif;z-index:100001;
      box-shadow:0 4px 16px rgba(0,0,0,0.2);animation:feedspace-fade-in 0.15s;
    `,i.textContent=e,document.body.appendChild(i),setTimeout(()=>{i.parentNode&&i.parentNode.removeChild(i)},3e3)}destroy(){var t;this.clearHoverHighlight(),this.renderer.destroy(),this.commentPanel.close(),this.feedbackList.close(),this.destroyNameModal(),this.toolbarRoot&&this.toolbarRoot.parentNode&&this.toolbarRoot.parentNode.removeChild(this.toolbarRoot),this.recordingTimer&&clearInterval(this.recordingTimer),document.body.removeAttribute("data-feedspace-tool");let e=document.getElementById("feedspace-viewport-wrapper");e&&((t=e.parentNode)==null||t.removeChild(e)),document.body.style.maxWidth="",document.body.style.margin="",document.body.style.boxShadow="",document.documentElement.style.background=""}};function X(l){function e(o,r){let n=window.__feedspaceDebug;n&&Array.isArray(n)&&n.push({msg:o,data:r,time:Date.now()}),console.log("[Feedspace]",o,r||"")}e("initWidget() called with config",{apiUrl:l.apiUrl,projectId:l.projectId,pageUrl:l.pageUrl}),P(),e("Styles injected");let t=F(l.apiUrl,l.token,l.wpApiUrl,l.wpApiKey);e("API client created");let i=new C(l,t);return e("AnnotationEngine instance created"),i.init().catch(o=>{console.error("Feedspace widget init error:",o),e("init() threw error",String(o))}),i}var w=null;window.FeedspaceWidget={init(l){w&&w.destroy(),w=X(l)},destroy(){w&&(w.destroy(),w=null)}};})();
