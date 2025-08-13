import{d as l,af as d,p as f,aW as h,c as u,o as x,j as n,G as a,w as _,k as e}from"./framework.DZgqWKJp.js";import{R as v,I as s}from"./index.DWx5I85h.js";import{w}from"./tiny-robot-svgs.D-n4sgzD.js";import i from"./schema-card.ce.DV1kAccy.js";import"./loading.CaA-rOal.js";import"./utils.PXvsRCZN.js";import"./index2.DniiL9LH.js";import"./plugin-vue_export-helper.lGy7RumW.js";import"./index.BoV9dZ-y.js";import"./index.CjlkEzI7.js";import"./index.BtIrbYv8.js";import"./index.BE00sSTR.js";import"./index.CfdRQi1p.js";import"./loading-shadow.qpgZbwLE.js";import"./help-circle.DDllw8tj.js";import"./index.C6RnbP2b.js";import"./index.9St3uIJX.js";import"./index.E-Q9EEi7.js";import"./index.05ZY--Re.js";import"./index.2vAGpwaK.js";const C={style:{display:"flex","flex-direction":"column",gap:"16px"}},W=l({__name:"schema-render",setup(g){const o=d(w,{style:{fontSize:"32px"}}),p=new v({mdConfig:{html:!0},dompurifyConfig:{ADD_TAGS:["schema-card"],ADD_ATTR:["schema"]}}),r=f(JSON.stringify({state:{},methods:{},componentName:"Page",props:{},children:[{componentName:"Text",props:{text:"运行时渲染器文本"}},{componentName:"Button",props:{text:"运行时渲染器按钮"}}]}));if(!customElements.get("schema-card")){const m=h(i);customElements.define("schema-card",m)}const c=`# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

<schema-card schema='${r.value}'></schema-card>
`;return(m,t)=>(x(),u("div",C,[t[0]||(t[0]=n("label",null,"使用插槽渲染运行时渲染",-1)),a(e(s),{avatar:e(o)},{default:_(()=>[a(i,{schema:r.value},null,8,["schema"])]),_:1},8,["avatar"]),t[1]||(t[1]=n("label",null,"使用markdown渲染运行时渲染（webcomponent）",-1)),a(e(s),{avatar:e(o),content:c,"content-renderer":e(p)},null,8,["avatar","content-renderer"])]))}});export{W as default};
