import{J as c}from"./index.C9Ye2fTi.js";import{R as m}from"./tiny-robot-svgs.DsFtH99N.js";import{d as u,af as p,p as f,c as h,o as d,G as k,j as o,k as s,F as _}from"./framework.Dgud2iI9.js";import"./utils.D1YSndqS.js";import"./plugin-vue_export-helper.lGy7RumW.js";import"./index2.DHk6GfRG.js";const n=`# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

~~Strikethrough~~
`,B=u({__name:"streaming",setup(v){const r=p(m,{style:{fontSize:"32px"}}),e=f(n),i=async()=>{e.value="";const a=[];for(let t=0;t<n.length;t+=3)a.push(n.slice(t,t+3));for(const t of a)e.value=e.value+t,await new Promise(l=>setTimeout(l,100))};return(a,t)=>(d(),h(_,null,[k(s(c),{content:e.value,avatar:s(r),type:"markdown"},null,8,["content","avatar"]),t[0]||(t[0]=o("hr",null,null,-1)),o("button",{onClick:i},"点击展示流式文本")],64))}});export{B as default};
