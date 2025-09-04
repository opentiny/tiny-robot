import{d,a4 as p,p as h,b4 as f,c as u,o as x,j as r,G as a,w as _,k as e}from"./framework.BqbEox01.js";import{a as v,I as m,w}from"./theme.BCteXstO.js";import c from"./schema-card.ce.DMSbjT-d.js";const C={style:{display:"flex","flex-direction":"column",gap:"16px"}},N=d({__name:"schema-render",setup(g){const n=p(w,{style:{fontSize:"32px"}}),i=new v({mdConfig:{html:!0},dompurifyConfig:{ADD_TAGS:["schema-card"],ADD_ATTR:["schema"]}}),s=h(JSON.stringify({state:{},methods:{},componentName:"Page",props:{},children:[{componentName:"Text",props:{text:"运行时渲染器文本"}},{componentName:"Button",props:{text:"运行时渲染器按钮"}}]}));if(!customElements.get("schema-card")){const o=f(c);customElements.define("schema-card",o)}const l=`# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

<schema-card schema='${s.value}'></schema-card>
`;return(o,t)=>(x(),u("div",C,[t[0]||(t[0]=r("label",null,"使用插槽渲染运行时渲染",-1)),a(e(m),{avatar:e(n)},{default:_(()=>[a(c,{schema:s.value},null,8,["schema"])]),_:1},8,["avatar"]),t[1]||(t[1]=r("label",null,"使用markdown渲染运行时渲染（webcomponent）",-1)),a(e(m),{avatar:e(n),content:l,"content-renderer":e(i)},null,8,["avatar","content-renderer"])]))}});export{N as default};
