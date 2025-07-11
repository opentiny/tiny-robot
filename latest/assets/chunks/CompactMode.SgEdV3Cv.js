import{I as s}from"./index.D6XacYRe.js";import{d as p,c as d,o as r,j as t,a as l,G as e,k as n,_ as i}from"./framework.kTfunus-.js";import"./index5.B63c_vYG.js";import"./index4.UhD4dyzc.js";import"./tiny-robot-svgs.BaAiG9Fu.js";import"./plugin-vue_export-helper.lGy7RumW.js";import"./utils.D1YSndqS.js";const m={class:"demo-container"},a={class:"mode-section"},c={class:"example-group"},u={class:"mode-section"},x={class:"example-group compact-container"},g={class:"custom-vars-section"},v={class:"custom-example"},f={class:"comparison-section"},h={class:"comparison-grid"},L={class:"comparison-item"},C={class:"comparison-item"},S=p({__name:"CompactMode",setup(b){return(k,o)=>(r(),d("div",m,[o[14]||(o[14]=t("h3",null,"紧凑模式配置演示",-1)),o[15]||(o[15]=t("p",null,[l("通过添加 "),t("code",null,"tr-sender-compact"),l(" CSS类可以启用紧凑样式，适用于空间受限的场景。")],-1)),t("div",a,[o[2]||(o[2]=t("h4",null,"默认样式（宽松模式）",-1)),o[3]||(o[3]=t("p",null,"适用于独立页面或全屏对话场景，具有较大的字体（16px）、宽松的内边距、大圆角（26px）和大发送图标（36px）。",-1)),t("div",c,[o[0]||(o[0]=t("h5",null,"单行模式",-1)),e(n(s),{mode:"single",placeholder:"默认单行模式...",style:{"margin-bottom":"10px"}}),o[1]||(o[1]=t("h5",null,"多行模式",-1)),e(n(s),{mode:"multiple",placeholder:"默认多行模式...",showWordLimit:!0,maxLength:200})])]),t("div",u,[o[6]||(o[6]=t("h4",null,"紧凑模式",-1)),o[7]||(o[7]=t("p",null,"适用于侧边栏、抽屉或紧凑界面，具有较小的字体（14px）、紧凑的内边距、小圆角（24px）和小发送图标（32px）。",-1)),t("div",x,[o[4]||(o[4]=t("h5",null,"单行模式",-1)),e(n(s),{class:"tr-sender-compact",mode:"single",placeholder:"紧凑单行模式...",style:{"margin-bottom":"10px"}}),o[5]||(o[5]=t("h5",null,"多行模式",-1)),e(n(s),{class:"tr-sender-compact",mode:"multiple",placeholder:"紧凑多行模式...",showWordLimit:!0,maxLength:100})])]),t("div",g,[o[8]||(o[8]=t("h4",null,"自定义变量覆盖",-1)),o[9]||(o[9]=t("p",null,"你可以通过CSS变量来进一步自定义紧凑模式的样式：",-1)),t("div",v,[e(n(s),{class:"tr-sender-compact custom-compact-sender",mode:"multiple",placeholder:"自定义样式的紧凑模式...",showWordLimit:!0,maxLength:50})]),o[10]||(o[10]=t("pre",{class:"code-example"},[t("code",null,`/* 自定义紧凑模式的变量 */
.custom-compact-sender {
  /* 进一步减小字体和行高 */
  --tr-sender-compact-font-size: 12px;
  --tr-sender-compact-line-height: 18px;
  --tr-sender-compact-input-height: 18px;
  
  /* 调整圆角和图标尺寸 */
  --tr-sender-compact-input-radius: 16px;
  --tr-sender-compact-send-icon-size: 28px;
  
  /* 调整内边距配置 */
  --tr-sender-compact-single-content-padding: 6px 4px 6px 8px;
  --tr-sender-compact-multiple-content-padding: 8px 12px 0 12px;
}`)],-1))]),t("div",f,[o[13]||(o[13]=t("h4",null,"样式对比",-1)),t("div",h,[t("div",L,[o[11]||(o[11]=t("h5",null,"默认样式",-1)),e(n(s),{mode:"single",placeholder:"默认样式示例"})]),t("div",C,[o[12]||(o[12]=t("h5",null,"紧凑样式",-1)),e(n(s),{class:"tr-sender-compact",mode:"single",placeholder:"紧凑样式示例"})])])])]))}}),y=i(S,[["__scopeId","data-v-75c4571b"]]);export{y as default};
