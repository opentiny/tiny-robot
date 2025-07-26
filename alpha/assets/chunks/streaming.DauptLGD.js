import{R as m,I as u}from"./index.BjlYQdx4.js";import{w as p}from"./tiny-robot-svgs.B2XD9sQ_.js";import{d as f,af as d,p as h,c as k,o as _,G as v,j as r,k as o,F as w}from"./framework.WjEkGhiu.js";import"./loading.CaA-rOal.js";import"./utils.DwCNla4E.js";import"./index3.Wj-l2D0K.js";import"./tiny-robot-svgs.Dnkbi6us.js";import"./plugin-vue_export-helper.lGy7RumW.js";const a=`# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

~~Strikethrough~~
`,E=f({__name:"streaming",setup(x){const s=d(p,{style:{fontSize:"32px"}}),i=new m,e=h(a),c=async()=>{e.value="";const n=[];for(let t=0;t<a.length;t+=3)n.push(a.slice(t,t+3));for(const t of n)e.value=e.value+t,await new Promise(l=>setTimeout(l,100))};return(n,t)=>(_(),k(w,null,[v(o(u),{content:e.value,avatar:o(s),"content-renderer":o(i)},null,8,["content","avatar","content-renderer"]),t[0]||(t[0]=r("hr",null,null,-1)),r("button",{onClick:c},"点击展示流式文本")],64))}});export{E as default};
