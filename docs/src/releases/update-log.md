
# 版本更新日志


## 0.2.5 (25.6.11)

### 组件

1.【问题】【Sender 消息输入框】模板回填在 shadow dom 环境下表现异常

safari 存在的问题：
1. safari 中删除完模板中的字符，模板也不会有 placeholder
2. 不支持模板粘贴

2.【优化】【Sender 消息输入框】问题联想功能的交互调整

3.【优化】【Suggestion Popover 建议弹出框】优化了 popover 内tooltip 延时打开的逻辑

## 0.2.4 (25.6.9)

### 组件

1.【问题】【Sender 消息输入框】修复一些样式问题
2.【问题】【Sender 消息输入框】移除了停止生成的提示语

## 0.2.3 (25.6.9)

### 组件

1.【问题】【Sender 消息输入框】修复一些样式问题  
2.【优化】【SuggestionPopover 建议弹出框】增加列表项文本过长弹出 Tooltip 的功能  
2.【优化】【SuggestionPills 建议按钮组】增加 clickOutside 自动关闭展开的按钮的逻辑

## 0.2.2 (25.6.5)

### 组件

1.【优化】【Sender 消息输入框】输入框失焦后联想弹窗自动关闭  
2.【问题】【Sender 消息输入框】修复联想弹窗选项图标未垂直居中对齐的问题  
3.【问题】【SuggestionPills 建议按钮组】修复按钮组展开全部按钮后，显示全部的按钮可能会因为按钮组容器宽度变化而消失的问题

## 0.2.1 (25.6.4)

1. 【问题】【SuggestionPills】修复 SuggestionPills 中弹出框元素无法显示的问题  

## 0.2.0 (25.6.4)

1.更新版本号为0.2.0正式版本(版本代码与0.2.0-alpha.9一致)  

## 0.2.0-alpha.9（25.6.3）

### 组件

1.【优化】【Sender 消息输入框】更新模板编辑器相关颜色变量  
2.【问题】【Sender 消息输入框】修复模板编辑块空内容时无法在右侧定位的问题  
3.【问题】使用了 `Teleport to="body"` 的弹出框的组件，在 shadow dom 中会导致弹出框不显示

## 0.2.0-alpha.8（25.6.3）

### 组件

1.【优化】使用 css 变量统一全局的 z-index 叠层等级。全局 css 变量可在 `packages/components/src/styles/variables.css` 查看  
2.【问题】【SuggestionPills 建议按钮组】修复按钮组数据长度变更，无法更新 UI 的问题

### Kit

1.【优化】【kit】AIModelConfig 新增 providerImplementation 可选属性，用于扩展 provider

## 0.2.0-alpha.7（25.5.29）

1.【问题】【Sender 消息输入框】修复 输入联想，修改输入框内容后，联想弹窗不展示的问题  
2.【问题】【Sender 消息输入框】修复了删除当前模板后，选择使用同一模板时输入框无反应的问题  
3.【变更】【Sender 消息输入框】使用 setTemplate() 函数统一模板设置，替代之前使用 template 和 templateInitialValues 配置  
4.【优化】【Sender 消息输入框】模板删除逻辑优化；编辑块删除交互优化；模板复制粘贴效果优化  
5.【优化】【SuggestionPills 建议按钮组】支持显示更多功能；文档与示例优化

## 0.2.0-alpha.6（25.5.28）

### 组件
1.【问题】修复在 Vue3.4 及更低版本下报错无法使用组件的问题  

## 0.2.0-alpha.5（25.5.28）

### 组件
1.【特性】【Sender 消息输入框】增强模板编辑功能  
2.【特性】【Sender 消息输入框】支持输入联想功能  
3.【优化】【Sender 消息输入框】替换组件按钮图标、调整按钮样式；自定义按钮 及 布局与插槽 案例中 - 深度思考 按钮样式修复；样式与设计稿对齐  
4.【特性】新增 SuggestionPills 建议按钮组 与 SuggestionPopover 建议弹出框 组件  
5.【特性】新增 DropdownMenu 下拉菜单 组件  
6.【变更】Suggestion 快捷指令 与 Question 快捷问题 改为弃用状态，建议使用 SuggestionPills 建议按钮组 与 SuggestionPopover 建议弹出框 组件  

## 0.2.0-alpha.4（25.5.21）

### 组件
1.【特性】【Sender 消息输入框】优化单行模式与多行模式的切换逻辑：初始单行状态下支持快捷键切换多行及输入时自动切换多行  
2.【特性】【Sender 消息输入框】增加多行模式下具体的操作插槽(footer-left,footer-right)，更新自定义按钮使用示例 (深度思考按钮)  
3.【问题】【Sender 消息输入框】解决输入后行高跳跃的问题  
4.【特性】【Sender 消息输入框】语音输入支持配置输入模式为追加模式或替换模式，支持配置语音识别结果及时返回(中间结果返回，可能会被后续更新修正)或最终结果返回(停止说话后返回)  
5.【特性】【Sender 消息输入框】增加 decorativeContent 插槽，存在该插槽时，自动禁用输入和发送功能。可用于 服务状态提示、功能引导等场景  
6.【问题】【Sender 消息输入框】修复文字垂直不居中的问题  
7.【特性】【Sender 消息输入框】调整文字字数限制功能：默认位置调整到右下角，超出限制，真实字数标红，输入内容不截断，无法发送  
8.【问题】【Question 快捷问题】优化布局样式对齐设计稿：文本宽度自适应、未展开状态下平铺一行，超出范围的渐变隐藏、hover时展示展开收起按钮、展开状态下，自适应宽度排列开  
9.【文档】【Suggestion 快捷指令】修正 Suggestion 快捷指令组件 文档函数名category-select拼写错误问题，更新示例参数调用错误问题  



## 0.2.0-alpha.3（25.5.17）

### 组件
- 重构History历史组件，调整data属性数据格式，支持分组与非分组场景
- Bubble气泡组件增加卡片渲染Demo

### 其他
- 更新vitepress-demo-plugin解决文档构建报错问题
- 解决未指定版本安装报错问题
- 优化构建脚本
- 优化文档

## 0.2.0-alpha.2（25.4.30）
- 增强ActionGroup的Tooltip提示支持,并重构IconButton组件的使用
- 修复气泡列表组件自动滚动不起作用
- 气泡组件添加插槽，移除内置的底部操作，改成使用feedback组件来给气泡底部添加操作
- 重构Sender组件模板输入编辑功能

## 0.2.0-alpha.1 （25.4.29）
- 添加Feedback/Suggestion/History组件
- 添加useConversations工具
- 修复若干问题，优化代码

## 0.2.0-alpha.0 （25.4.24）
- 支持Bubble/Container/Sender/Conversations/Prompts/Question/Welcome 7个基础组件
- 支持AiClient、useMessage工具
- 官网添加综合示例
