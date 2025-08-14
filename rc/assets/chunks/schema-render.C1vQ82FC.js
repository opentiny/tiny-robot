import{d as l,af as d,p as f,aW as h,c as u,o as x,j as n,G as a,w as _,k as e}from"./framework.Cue1fywD.js";import{R as v,I as s}from"./index.CHpWTqfh.js";import{w}from"./tiny-robot-svgs.Drx3vgfj.js";import i from"./schema-card.ce.D02b83G_.js";import"./loading.CaA-rOal.js";import"./utils.SoyBvDll.js";import"./index2.ChrULO9t.js";import"./plugin-vue_export-helper.lGy7RumW.js";import"./index.BxNcVGWn.js";import"./index.BIX2KVXq.js";import"./index.C-KxNaZL.js";import"./index.C6NR4zBu.js";import"./index.D4QX1QD9.js";import"./loading-shadow.DnxX4PrV.js";import"./help-circle.QYo-CUpD.js";import"./index.elV00oT7.js";import"./index.COMRtAdr.js";import"./index.43D1Nyxv.js";import"./index.B5nUtDrA.js";import"./index.C11Bs8y-.js";const C={style:{display:"flex","flex-direction":"column",gap:"16px"}},W=l({__name:"schema-render",setup(g){const o=d(w,{style:{fontSize:"32px"}}),p=new v({mdConfig:{html:!0},dompurifyConfig:{ADD_TAGS:["schema-card"],ADD_ATTR:["schema"]}}),r=f(JSON.stringify({state:{},methods:{},componentName:"Page",props:{},children:[{componentName:"Text",props:{text:"运行时渲染器文本"}},{componentName:"Button",props:{text:"运行时渲染器按钮"}}]}));if(!customElements.get("schema-card")){const m=h(i);customElements.define("schema-card",m)}const c=`# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

<schema-card schema='${r.value}'></schema-card>
`;return(m,t)=>(x(),u("div",C,[t[0]||(t[0]=n("label",null,"使用插槽渲染运行时渲染",-1)),a(e(s),{avatar:e(o)},{default:_(()=>[a(i,{schema:r.value},null,8,["schema"])]),_:1},8,["avatar"]),t[1]||(t[1]=n("label",null,"使用markdown渲染运行时渲染（webcomponent）",-1)),a(e(s),{avatar:e(o),content:c,"content-renderer":e(p)},null,8,["avatar","content-renderer"])]))}});export{W as default};
