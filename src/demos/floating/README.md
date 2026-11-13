# 聊天浮窗

[Demo.vue](Demo.vue) 通过 `ui.layout.surface.mode: 'floating'` 打开浮窗，并设置 `floatingOptions.resizable: true`。

点击“打开聊天浮窗”，拖动顶部把手，或拉伸窗口边缘。`v-model:floating-state` 保存位置和尺寸；关闭后再次打开会沿用该状态和会话。

浮窗挂载到页面 `body`，初始尺寸按当前视口计算。
