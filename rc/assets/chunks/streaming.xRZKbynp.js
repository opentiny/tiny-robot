import{v as u,b as m,h}from"./theme.r1f5w0cM.js";import{d,a4 as p,p as f,c as v,o as k,G as _,j as o,k as a,F as x}from"./framework.C4qgKv2O.js";const s=`# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

~~Strikethrough~~
`,T=d({__name:"streaming",setup(g){const r=p(h,{style:{fontSize:"32px"}}),i=new u,t=f(s),c=async()=>{t.value="";const n=[];for(let e=0;e<s.length;e+=3)n.push(s.slice(e,e+3));for(const e of n)t.value=t.value+e,await new Promise(l=>setTimeout(l,100))};return(n,e)=>(k(),v(x,null,[_(a(m),{content:t.value,avatar:a(r),"content-renderer":a(i)},null,8,["content","avatar","content-renderer"]),e[0]||(e[0]=o("hr",null,null,-1)),o("button",{onClick:c},"点击展示流式文本")],64))}});export{T as default};
