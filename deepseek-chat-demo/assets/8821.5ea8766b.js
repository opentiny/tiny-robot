"use strict";(self.rspackChunkdeepseek_chat_demo_vue_chat=self.rspackChunkdeepseek_chat_demo_vue_chat||[]).push([[8821],{2606(e,t,a){function i(e,t){e.accDescr&&t.setAccDescription?.(e.accDescr),e.accTitle&&t.setAccTitle?.(e.accTitle),e.title&&t.setDiagramTitle?.(e.title)}a.d(t,{S:()=>i}),(0,a(8755).K2)(i,"populateCommonDb")},5428(e,t,a){a.d(t,{diagram:()=>k});var i=a(2606),l=a(3218),r=a(5876),s=a(8755),o=a(9342),c=a(2631),n=a(1733),p=s.UI.pie,d={sections:new Map,showData:!1,config:p},u=d.sections,g=d.showData,h=structuredClone(p),f=(0,s.K2)(()=>structuredClone(h),"getConfig"),m=(0,s.K2)(()=>{u=new Map,g=d.showData,(0,s.IU)()},"clear"),x=(0,s.K2)(({label:e,value:t})=>{if(t<0)throw Error(`"${e}" has invalid value: ${t}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);u.has(e)||(u.set(e,t),s.Rm.debug(`added new section: ${e}, with value: ${t}`))},"addSection"),S=(0,s.K2)(()=>u,"getSections"),w=(0,s.K2)(e=>{g=e},"setShowData"),$=(0,s.K2)(()=>g,"getShowData"),D={getConfig:f,clear:m,setDiagramTitle:s.ke,getDiagramTitle:s.ab,setAccTitle:s.SV,getAccTitle:s.iN,setAccDescription:s.EI,getAccDescription:s.m7,addSection:x,getSections:S,setShowData:w,getShowData:$},T=(0,s.K2)((e,t)=>{(0,i.S)(e,t),t.setShowData(e.showData),e.sections.map(t.addSection)},"populateDb"),v={parse:(0,s.K2)(async e=>{let t=await (0,o.qg)("pie",e);s.Rm.debug(t),T(t,D)},"parse")},y=(0,s.K2)(e=>`
  .pieCircle{
    stroke: ${e.pieStrokeColor};
    stroke-width : ${e.pieStrokeWidth};
    opacity : ${e.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${e.pieOuterStrokeColor};
    stroke-width: ${e.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${e.pieTitleTextSize};
    fill: ${e.pieTitleTextColor};
    font-family: ${e.fontFamily};
  }
  .slice {
    font-family: ${e.fontFamily};
    fill: ${e.pieSectionTextColor};
    font-size:${e.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${e.pieLegendTextColor};
    font-family: ${e.fontFamily};
    font-size: ${e.pieLegendTextSize};
  }
`,"getStyles"),C=(0,s.K2)(e=>{let t=[...e.values()].reduce((e,t)=>e+t,0),a=[...e.entries()].map(([e,t])=>({label:e,value:t})).filter(e=>e.value/t*100>=1).sort((e,t)=>t.value-e.value);return(0,c.rL)().value(e=>e.value)(a)},"createPieArcs"),k={parser:v,db:D,renderer:{draw:(0,s.K2)((e,t,a,i)=>{s.Rm.debug("rendering pie chart\n"+e);let o=i.db,p=(0,s.D7)(),d=(0,l.$t)(o.getConfig(),p.pie),u=(0,r.D)(t),g=u.append("g");g.attr("transform","translate(225,225)");let{themeVariables:h}=p,[f]=(0,l.I5)(h.pieOuterStrokeWidth);f??=2;let m=d.textPosition,x=(0,c.JL)().innerRadius(0).outerRadius(185),S=(0,c.JL)().innerRadius(185*m).outerRadius(185*m);g.append("circle").attr("cx",0).attr("cy",0).attr("r",185+f/2).attr("class","pieOuterCircle");let w=o.getSections(),$=C(w),D=[h.pie1,h.pie2,h.pie3,h.pie4,h.pie5,h.pie6,h.pie7,h.pie8,h.pie9,h.pie10,h.pie11,h.pie12],T=0;w.forEach(e=>{T+=e});let v=$.filter(e=>"0"!==(e.data.value/T*100).toFixed(0)),y=(0,n.UM)(D);g.selectAll("mySlices").data(v).enter().append("path").attr("d",x).attr("fill",e=>y(e.data.label)).attr("class","pieCircle"),g.selectAll("mySlices").data(v).enter().append("text").text(e=>(e.data.value/T*100).toFixed(0)+"%").attr("transform",e=>"translate("+S.centroid(e)+")").style("text-anchor","middle").attr("class","slice"),g.append("text").text(o.getDiagramTitle()).attr("x",0).attr("y",-200).attr("class","pieTitleText");let k=[...w.entries()].map(([e,t])=>({label:e,value:t})),b=g.selectAll(".legend").data(k).enter().append("g").attr("class","legend").attr("transform",(e,t)=>"translate(216,"+(22*t-22*k.length/2)+")");b.append("rect").attr("width",18).attr("height",18).style("fill",e=>y(e.label)).style("stroke",e=>y(e.label)),b.append("text").attr("x",22).attr("y",14).text(e=>o.getShowData()?`${e.label} [${e.value}]`:e.label);let A=512+Math.max(...b.selectAll("text").nodes().map(e=>e?.getBoundingClientRect().width??0));u.attr("viewBox",`0 0 ${A} 450`),(0,s.a$)(u,450,A,d.useMaxWidth)},"draw")},styles:y}}}]);