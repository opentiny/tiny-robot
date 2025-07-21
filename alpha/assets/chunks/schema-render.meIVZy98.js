import{d as c,af as l,p as d,aP as f,c as u,o as h,j as r,G as a,w as x,k as e}from"./framework.CktAfHHO.js";import{J as n}from"./index.BrbdVymC.js";import{E as _}from"./tiny-robot-svgs.sQeJBbmg.js";import{_ as i}from"./schema-card.vue_vue_type_style_index_0_lang.CAjIQYEU.js";import"./utils.D1YSndqS.js";import"./plugin-vue_export-helper.lGy7RumW.js";import"./index3.BuO2fLLa.js";import"./index.BcjC4P4Z.js";import"./index.Dq54-SrG.js";import"./index.CdF1aB2E.js";import"./index.CEUWEMqJ.js";import"./index.BWBUjzBa.js";import"./loading-shadow.C19uh6T4.js";import"./help-circle.DrXRl-Rd.js";import"./index.BpTThMEa.js";import"./index.BzaD4zws.js";import"./index.7WDqESk6.js";import"./index.DiIMaJLW.js";const v={style:{display:"flex","flex-direction":"column",gap:"16px"}},G=c({__name:"schema-render",setup(E){const o=l(_,{style:{fontSize:"32px"}}),m=d(JSON.stringify({state:{},methods:{},componentName:"Page",props:{},children:[{componentName:"Text",props:{text:"运行时渲染器文本"}},{componentName:"Button",props:{text:"运行时渲染器按钮"}}]}));if(!customElements.get("schema-card")){const s=f(i);customElements.define("schema-card",s)}const p=`# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

<schema-card schema='${m.value}'></schema-card>
`;return(s,t)=>(h(),u("div",v,[t[0]||(t[0]=r("label",null,"使用插槽渲染运行时渲染",-1)),a(e(n),{avatar:e(o)},{default:x(()=>[a(i,{schema:m.value},null,8,["schema"])]),_:1},8,["avatar"]),t[1]||(t[1]=r("label",null,"使用markdown渲染运行时渲染（webcomponent）",-1)),a(e(n),{avatar:e(o),type:"markdown",content:p,mdConfig:{html:!0}},null,8,["avatar"])]))}});export{G as default};
