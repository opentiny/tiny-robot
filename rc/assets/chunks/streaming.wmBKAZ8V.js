import{b as u,d as m,w as d}from"./theme.kywkY2C5.js";import{d as h,a4 as p,p as f,c as k,o as v,G as _,j as o,k as a,F as w}from"./framework.C4qgKv2O.js";const s=`# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

~~Strikethrough~~
`,T=h({__name:"streaming",setup(x){const r=p(d,{style:{fontSize:"32px"}}),i=new u,t=f(s),c=async()=>{t.value="";const n=[];for(let e=0;e<s.length;e+=3)n.push(s.slice(e,e+3));for(const e of n)t.value=t.value+e,await new Promise(l=>setTimeout(l,100))};return(n,e)=>(v(),k(w,null,[_(a(m),{content:t.value,avatar:a(r),"content-renderer":a(i)},null,8,["content","avatar","content-renderer"]),e[0]||(e[0]=o("hr",null,null,-1)),o("button",{onClick:c},"点击展示流式文本")],64))}});export{T as default};
