import{f as e}from"./index.kLDz7Rjo.js";/* empty css              */import{N as t,aL as a,v as o,J as r,bk as i,bR as c}from"./framework.a6p0je84.js";import"./theme.DuYk-bxq.js";import"./index.DuudyaIy.js";const d={class:"message-anchor-demo"},l=t({__name:"message-anchor",setup(u){const n={layout:{leftAside:!1,rightAside:!1},anchor:{}},s=[{id:"user-1",role:"user",content:"上线前需要准备哪些材料？"},{id:"assistant-1",role:"assistant",content:`建议提前准备以下材料：

1. **发布说明**：列出本次新增功能、修复的问题及影响范围，方便使用者了解变化。
2. **验证记录**：整理主要使用流程的验证结果，并记录尚未解决的问题。
3. **操作手册**：说明发布步骤、负责人和预计完成时间，确保参与人员了解各自分工。
4. **回退方案**：明确异常时的判断条件、恢复步骤及需要保留的数据。`},{id:"user-2",role:"user",content:"如何安排上线当天的人员分工？"},{id:"assistant-2",role:"assistant",content:`可以按职责分配，并在发布前确认联系方式：

- **发布负责人**：统一确认发布条件，决定开始、暂停或回退。
- **执行人员**：按操作手册完成部署，记录每一步的结果与时间。
- **验证人员**：发布后检查登录、核心业务和数据展示，及时反馈异常。
- **支持人员**：关注用户反馈，整理问题并同步给负责人。

发布期间保持沟通渠道畅通，避免多个角色同时修改同一项配置。`},{id:"user-3",role:"user",content:"发布后应该关注哪些指标？"},{id:"assistant-3",role:"assistant",content:`建议同时观察系统运行和实际使用情况：

1. **可用性**：页面能否打开，登录和核心操作是否正常。
2. **响应时间**：对比发布前后的页面加载和主要操作耗时。
3. **错误情况**：关注异常数量、失败比例及重复出现的问题。
4. **业务结果**：检查关键记录是否正确保存，统计结果是否符合预期。

提前约定观察周期和异常阈值，发现明显变化时及时核对，必要时暂停扩大使用范围。`},{id:"user-4",role:"user",content:"请整理一份发布结束后的检查清单。"},{id:"assistant-4",role:"assistant",content:`发布结束后，可逐项确认：

- [ ] 核心业务流程已经验证，结果符合预期。
- [ ] 监控指标保持正常，没有持续增加的异常。
- [ ] 发布记录已补全，包含版本、时间和执行结果。
- [ ] 使用说明已更新，并同步给相关人员。
- [ ] 遗留问题已明确负责人和处理时间。
- [ ] 已约定下一次复查时间，并保留必要的回退材料。

完成检查后，再向相关人员同步发布结果和后续安排。`}];return(m,_)=>(a(),o("div",d,[r(i(e),{ui:n,data:{conversation:{activeId:"release",title:"项目上线讨论"},bubble:{messages:s}}},null,8,["data"])]))}}),v=c(l,[["__scopeId","data-v-37dfd1bd"]]);export{v as default};
