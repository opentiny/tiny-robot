import{d as l,af as d,p as h,aU as f,c as u,o as x,j as s,G as a,w as _,k as e}from"./framework.Dsng2_7o.js";import{S as v,w as n}from"./index.DrOP9VmC.js";import{c as w}from"./tiny-robot-svgs.Cy3xEaxQ.js";import i from"./schema-card.ce.B3Io01ZP.js";import"./loading.CaA-rOal.js";import"./utils.D1YSndqS.js";import"./tiny-robot-svgs.wPOeRNoc.js";import"./plugin-vue_export-helper.lGy7RumW.js";import"./index3.BDwkJsQh.js";import"./index.CfWQETGS.js";import"./index.OruwSYWr.js";import"./index.D4QLHw-u.js";import"./index.Bk8Sagdh.js";import"./index.DVrRK6sQ.js";import"./loading-shadow.DIQr-lWU.js";import"./help-circle.Da-MwPOe.js";import"./index.BhD4xwdf.js";import"./index.CTGqbFuT.js";import"./index.DeN5mRSL.js";import"./index.CoENTUsD.js";const T={style:{display:"flex","flex-direction":"column",gap:"16px"}},$=l({__name:"schema-render",setup(C){const o=d(w,{style:{fontSize:"32px"}}),c=new v({html:!0},{ADD_TAGS:["schema-card"],ADD_ATTR:["schema"]}),r=h(JSON.stringify({state:{},methods:{},componentName:"Page",props:{},children:[{componentName:"Text",props:{text:"运行时渲染器文本"}},{componentName:"Button",props:{text:"运行时渲染器按钮"}}]}));if(!customElements.get("schema-card")){const m=f(i);customElements.define("schema-card",m)}const p=`# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

<schema-card schema='${r.value}'></schema-card>
`;return(m,t)=>(x(),u("div",T,[t[0]||(t[0]=s("label",null,"使用插槽渲染运行时渲染",-1)),a(e(n),{avatar:e(o)},{default:_(()=>[a(i,{schema:r.value},null,8,["schema"])]),_:1},8,["avatar"]),t[1]||(t[1]=s("label",null,"使用markdown渲染运行时渲染（webcomponent）",-1)),a(e(n),{avatar:e(o),content:p,"content-renderer":e(c)},null,8,["avatar","content-renderer"])]))}});export{$ as default};
