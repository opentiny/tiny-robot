import{d as c,af as l,p as d,aA as f,c as u,o as h,j as r,G as a,w as x,k as e}from"./framework.kTfunus-.js";import{J as n}from"./index.BF_PQeJ7.js";import{R as _}from"./tiny-robot-svgs.Ct4S-7ct.js";import{_ as i}from"./schema-card.vue_vue_type_style_index_0_lang.ru08NnnM.js";import"./utils.D1YSndqS.js";import"./plugin-vue_export-helper.lGy7RumW.js";import"./index2.DXNIapAb.js";import"./index.DoAmEUYk.js";import"./index.DKVCnifJ.js";import"./index.D5z7hk73.js";import"./loading-shadow.lIjb6yma.js";import"./index.BwQVmJhW.js";import"./index.DSizFn09.js";import"./help-circle.DZYgQKry.js";import"./index.BdpCrDlP.js";import"./index.DRKSS0gm.js";const v={style:{display:"flex","flex-direction":"column",gap:"16px"}},$=c({__name:"schema-render",setup(g){const o=l(_,{style:{fontSize:"32px"}}),s=d(JSON.stringify({state:{},methods:{},componentName:"Page",props:{},children:[{componentName:"Text",props:{text:"运行时渲染器文本"}},{componentName:"Button",props:{text:"运行时渲染器按钮"}}]}));if(!customElements.get("schema-card")){const m=f(i);customElements.define("schema-card",m)}const p=`# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

<schema-card schema='${s.value}'></schema-card>
`;return(m,t)=>(h(),u("div",v,[t[0]||(t[0]=r("label",null,"使用插槽渲染运行时渲染",-1)),a(e(n),{avatar:e(o)},{default:x(()=>[a(i,{schema:s.value},null,8,["schema"])]),_:1},8,["avatar"]),t[1]||(t[1]=r("label",null,"使用markdown渲染运行时渲染（webcomponent）",-1)),a(e(n),{avatar:e(o),type:"markdown",content:p,mdConfig:{html:!0}},null,8,["avatar"])]))}});export{$ as default};
