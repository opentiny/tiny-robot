import{I as u,M as m,y as d}from"./theme.DkkYkddJ.js";import{d as h,a4 as p,p as f,c as k,o as _,G as v,j as o,k as a,F as x}from"./framework.CSeOnaMy.js";const s=`# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

~~Strikethrough~~
`,y=h({__name:"streaming",setup(g){const r=p(d,{style:{fontSize:"32px"}}),i=new u,t=f(s),c=async()=>{t.value="";const n=[];for(let e=0;e<s.length;e+=3)n.push(s.slice(e,e+3));for(const e of n)t.value=t.value+e,await new Promise(l=>setTimeout(l,100))};return(n,e)=>(_(),k(x,null,[v(a(m),{content:t.value,avatar:a(r),"content-renderer":a(i)},null,8,["content","avatar","content-renderer"]),e[0]||(e[0]=o("hr",null,null,-1)),o("button",{onClick:c},"点击展示流式文本")],64))}});export{y as default};
