import{E as k,k as E}from"./index.CsNWoLl9.js";/* empty css              */import{N as x,aL as l,v as p,w as t,F as R,aX as A,bb as v,u as f,r as w,b7 as _,bR as y,J as h,bJ as g,bk as b}from"./framework.U4597d8b.js";import{m as C}from"./modelProviders.CQEIWUPr.js";import"./theme.FnYQa60I.js";import"./index.DnDfvJyJ.js";const S=`<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      .preview-page {
        box-sizing: border-box;
        max-width: 720px;
        margin: 0 auto;
        padding: 20px;
      }

      .preview-header {
        padding: 8px 0 20px;
        border-bottom: 1px solid #dce3eb;
      }

      .preview-eyebrow {
        margin: 0 0 8px;
        color: #53708f;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .preview-title {
        margin: 0;
        color: #16283f;
        font-size: 30px;
        line-height: 1.2;
      }

      .preview-summary {
        margin: 12px 0 0;
        color: #64758a;
        font-size: 14px;
        line-height: 1.6;
      }

      .preview-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        margin-top: 16px;
        color: #64758a;
        font-size: 13px;
      }

      .preview-status {
        color: #087443;
        font-weight: 700;
      }

      .preview-section {
        padding: 20px 0;
        border-bottom: 1px solid #dce3eb;
      }

      .preview-section__title {
        margin: 0 0 14px;
        color: #263d57;
        font-size: 16px;
      }

      .preview-source__title {
        color: #1f3854;
        font-size: 15px;
      }

      .preview-source__meta,
      .preview-source__summary {
        margin: 8px 0 0;
        color: #64758a;
        font-size: 13px;
        line-height: 1.5;
      }

      .preview-list {
        display: grid;
        gap: 10px;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .preview-list > li {
        position: relative;
        padding-left: 22px;
        color: #4e6075;
        font-size: 14px;
        line-height: 1.5;
      }

      .preview-list > li::before {
        position: absolute;
        left: 0;
        color: #087443;
        content: '✓';
        font-weight: 700;
      }

      .preview-list--changes > li::before {
        color: #537da5;
        content: '•';
        font-size: 20px;
        line-height: 18px;
      }

      @media (max-width: 560px) {
        .preview-page {
          padding: 16px;
        }

        .preview-title {
          font-size: 26px;
        }
      }
    </style>
  </head>
  <body class="preview-body">
    <main class="preview-page">
      <header class="preview-header">
        <p class="preview-eyebrow">发布方案</p>
        <h1 class="preview-title">春季营销活动</h1>
        <p class="preview-summary">发布前检查已完成，当前版本等待进入计划窗口。</p>
        <div class="preview-meta">
          <span class="preview-status">待发布</span><span>发布时间：2026-04-18 20:00</span>
        </div>
      </header>
      <section class="preview-section preview-source">
        <h2 class="preview-section__title">当前引用</h2>
        <strong class="preview-source__title">__SOURCE_TITLE__</strong>
        <p class="preview-source__meta">__SOURCE_META__</p>
        <p class="preview-source__summary">__SOURCE_SUMMARY__</p>
      </section>
      <section class="preview-section">
        <h2 class="preview-section__title">检查清单</h2>
        <ul class="preview-list">
          <li>接口联调完成</li>
          <li>灰度开关已配置</li>
          <li>回归报告已归档</li>
        </ul>
      </section>
      <section class="preview-section">
        <h2 class="preview-section__title">变更摘要</h2>
        <ul class="preview-list preview-list--changes">
          <li>新增活动首页和权益说明</li>
          <li>优化发布前校验流程</li>
          <li>补充失败回滚提示</li>
        </ul>
      </section>
    </main>
  </body>
</html>
`,z={key:0,class:"business-panel business-panel--preview"},U=["srcdoc"],I={key:1,class:"business-panel business-panel--sources"},O={class:"source-list"},M=["onClick"],P={class:"source-list__title"},T={class:"source-list__meta"},$=x({__name:"BusinessRightAside",props:{panelId:{}},emits:["open-panel"],setup(u,{emit:m}){const r=m,i=_("requirements"),a=[{id:"requirements",title:"需求文档",meta:"PRD-2026-04",summary:"需求范围和验收口径已完成确认。"},{id:"api",title:"接口说明",meta:"API-RELEASE-07",summary:"接口契约稳定，联调结果满足发布前校验要求。"},{id:"regression",title:"回归报告",meta:"QA-2026-04-17",summary:"核心流程和兼容性验证通过，暂无阻塞缺陷。"}],s=w(()=>a.find(e=>e.id===i.value)??a[0]),c=w(()=>S.replace("__SOURCE_TITLE__",s.value.title).replace("__SOURCE_META__",s.value.meta).replace("__SOURCE_SUMMARY__",s.value.summary));function n(e){i.value=e,r("open-panel","preview")}return(e,d)=>u.panelId==="preview"?(l(),p("section",z,[t("iframe",{class:"preview-frame",title:"发布方案网页预览",sandbox:"allow-same-origin",srcdoc:c.value},null,8,U)])):u.panelId==="sources"?(l(),p("section",I,[d[0]||(d[0]=t("p",{class:"sources-intro"},"点击资料返回发布预览，并查看对应引用信息。",-1)),t("div",O,[(l(),p(R,null,A(a,o=>t("button",{key:o.id,class:"source-list__item",type:"button",onClick:V=>n(o.id)},[t("span",P,v(o.title),1),t("span",T,v(o.meta),1)],8,M)),64))])])):f("",!0)}}),B=y($,[["__scopeId","data-v-1dfb1c88"]]),L={class:"chat-workbench"},N={key:0,class:"message-actions"},F=x({__name:"right-aside-panel",setup(u){const m=[{id:"project-knowledge",name:"项目知识库",description:"检索需求、设计和项目约定。",baseUrl:"/tiny-robot/beta/api/mcp/project-knowledge",installed:!0},{id:"release-calendar",name:"发布日历",description:"查询发布窗口和冻结时间。",baseUrl:"/tiny-robot/beta/api/mcp/release-calendar",installed:!0}],r=_(!0),i=_("preview"),a=k({modelProviders:C,mcpServers:m,conversation:{useMessageOptions:{initialMessages:[{role:"assistant",content:"发布方案已整理完成。你可以打开右侧预览，或查看引用资料。"}]}}});a.actions.createConversation({title:"发布方案协作"});function s(c){i.value=c,r.value=!0}return(c,n)=>(l(),p("section",L,[h(b(E),{class:"chat-workbench__chat",runtime:b(a),ui:{layout:{rightAside:{width:344,resizable:!0,minWidth:300,maxWidth:480,panels:[{id:"preview",title:"发布方案预览"},{id:"sources",title:"引用资料"}]}}},"right-aside-open":r.value,"active-right-aside-panel-id":i.value,"onUpdate:rightAsideOpen":n[2]||(n[2]=e=>r.value=e),"onUpdate:activeRightAsidePanelId":n[3]||(n[3]=e=>i.value=e)},{"bubble-content-footer":g(({role:e,messageIndexes:d})=>[e==="assistant"&&d.includes(0)?(l(),p("div",N,[t("button",{class:"message-actions__button",type:"button",onClick:n[0]||(n[0]=o=>s("preview"))},"查看发布方案"),t("button",{class:"message-actions__button",type:"button",onClick:n[1]||(n[1]=o=>s("sources"))},"查看引用资料")])):f("",!0)]),"layout-right-aside-panel":g(({panelId:e})=>[h(B,{"panel-id":e,onOpenPanel:s},null,8,["panel-id"])]),_:1},8,["runtime","right-aside-open","active-right-aside-panel-id"])]))}}),Q=y(F,[["__scopeId","data-v-dbc7ea94"]]);export{Q as default};
