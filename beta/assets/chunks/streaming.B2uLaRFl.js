import{D as u,b as m,q as h}from"./theme.Be4c-Lda.js";import{N as d,a6 as f,aL as p,v as k,J as v,bk as a,w as o,F as _,aU as x}from"./framework.C4IWSUkS.js";const s=`# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

~~Strikethrough~~
`,b=d({__name:"streaming",setup(g){const r=f(u,{style:{fontSize:"32px"}}),i=new m,t=x(s),c=async()=>{t.value="";const n=[];for(let e=0;e<s.length;e+=3)n.push(s.slice(e,e+3));for(const e of n)t.value=t.value+e,await new Promise(l=>setTimeout(l,100))};return(n,e)=>(p(),k(_,null,[v(a(h),{content:t.value,avatar:a(r),"content-renderer":a(i)},null,8,["content","avatar","content-renderer"]),e[0]||(e[0]=o("hr",null,null,-1)),o("button",{onClick:c},"点击展示流式文本")],64))}});export{b as default};
