import{d as l,af as d,p as f,aV as h,c as u,o as x,j as n,G as a,w as _,k as e}from"./framework.WjEkGhiu.js";import{R as v,I as s}from"./index.DECttPsh.js";import{w}from"./tiny-robot-svgs.B2XD9sQ_.js";import i from"./schema-card.ce.ly9LeMHP.js";import"./loading.CaA-rOal.js";import"./utils.ayD70Qgn.js";import"./index3.BnOquABP.js";import"./tiny-robot-svgs.Dnkbi6us.js";import"./plugin-vue_export-helper.lGy7RumW.js";import"./index.DTUTkZ-1.js";import"./index._qXAc0y7.js";import"./index.DBHWuiHd.js";import"./index.BbG16oIm.js";import"./index.BwkskP7b.js";import"./loading-shadow.BvaKwsHe.js";import"./help-circle.COxGQeRS.js";import"./index.C0UKAWBB.js";import"./index.L57c4HSE.js";import"./index.Dw8QpHwa.js";import"./index.DK6Ln6-y.js";const C={style:{display:"flex","flex-direction":"column",gap:"16px"}},$=l({__name:"schema-render",setup(g){const o=d(w,{style:{fontSize:"32px"}}),p=new v({mdConfig:{html:!0},dompurifyConfig:{ADD_TAGS:["schema-card"],ADD_ATTR:["schema"]}}),r=f(JSON.stringify({state:{},methods:{},componentName:"Page",props:{},children:[{componentName:"Text",props:{text:"运行时渲染器文本"}},{componentName:"Button",props:{text:"运行时渲染器按钮"}}]}));if(!customElements.get("schema-card")){const m=h(i);customElements.define("schema-card",m)}const c=`# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

<schema-card schema='${r.value}'></schema-card>
`;return(m,t)=>(x(),u("div",C,[t[0]||(t[0]=n("label",null,"使用插槽渲染运行时渲染",-1)),a(e(s),{avatar:e(o)},{default:_(()=>[a(i,{schema:r.value},null,8,["schema"])]),_:1},8,["avatar"]),t[1]||(t[1]=n("label",null,"使用markdown渲染运行时渲染（webcomponent）",-1)),a(e(s),{avatar:e(o),content:c,"content-renderer":e(p)},null,8,["avatar","content-renderer"])]))}});export{$ as default};
