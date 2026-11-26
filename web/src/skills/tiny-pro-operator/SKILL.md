# TinyPro 操作指南

## 这是一个 [TinyPro](http://localhost:3031/vue-pro/) 后台管理系统，使用 `navigate_url` 进行路由菜单跳转

## 系统管理功能一览

| 模块       | 路由                                | 可用 WebMCP 工具                 | 描述                     |
| ---------- | ----------------------------------- | -------------------------------- | ------------------------ |
| 菜单管理   | `/vue-pro/menu/allMenu`             | `add-menu`                       | 添加菜单                 |
| 权限管理   | `/vue-pro/permission/allPermission` | `add-permission`                 | 添加权限                 |
| 角色管理   | `/vue-pro/role/allRole`             | `add-role`、`bind-menu-for-role` | 添加角色、为角色绑定菜单 |
| 用户管理   | `/vue-pro/userManager/allInfo`      | `add-user`                       | 添加用户                 |
| 国际化词条 | `/vue-pro/locale`                   | `add-i18n-entry`                 | 添加国际化词条           |

## WebMCP 工具详细说明

### 1. `add-i18n-entry` — 添加国际化词条

**路由**：`/vue-pro/locale`

| 参数      | 类型   | 必填 | 说明                                            |
| --------- | ------ | ---- | ----------------------------------------------- |
| `key`     | string | ✅   | 词条关键字，Agent 自行创建，**不要询问用户**    |
| `content` | string | ✅   | 词条内容                                        |
| `lang`    | 1 \| 2 | ✅   | 语言 ID：`1` = enUS（英文），`2` = zhCN（中文） |

**命名规范**：词条 Key 建议使用 `模块::页面::元素` 格式，如 `test::page::title`。

**示例**：

```
用户需求：添加国际化词条：key 为 test::page::title，内容为「测试页面」，语言为中文
工具调用：add-i18n-entry({ key: "test::page::title", content: "测试页面", lang: 2 })
```

---

### 2. `add-menu` — 添加菜单

**路由**：`/vue-pro/menu/allMenu`

| 参数         | 类型   | 必填 | 说明                                                          |
| ------------ | ------ | ---- | ------------------------------------------------------------- |
| `name`       | string | ✅   | 菜单名称（英文，对应路由 id）                                 |
| `component`  | string | ✅   | 组件路径，**不含** `src/views` 前缀，如 `test-page/index.vue` |
| `path`       | string | ✅   | 路由路径                                                      |
| `locale`     | string | ✅   | 国际化词条 Key（须已存在于 i18n 中）                          |
| `order`      | number | —    | 优先级，默认 `0`，数值越大越靠上                              |
| `parentMenu` | string | —    | 父菜单名称（通过 label 匹配 ID）                              |
| `icon`       | string | —    | 菜单图标                                                      |

**执行流程**：打开添加菜单弹窗 → 填充表单（`menuType` 固定为 `/`）→ 提交创建 → 刷新菜单树与路由。

**示例**：

```
用户需求：添加名称 test-page，组件 test-page/index.vue，路径 /test-page，国际化 test::page::title 的菜单
→ 调用 add-menu({ name: "test-page", component: "test-page/index.vue", path: "/test-page", locale: "test::page::title" })
```

---

### 3. `add-permission` — 添加权限

**路由**：`/vue-pro/permission/allPermission`

| 参数   | 类型   | 必填 | 说明                     |
| ------ | ------ | ---- | ------------------------ |
| `name` | string | ✅   | 权限名称，如 `good::add` |
| `desc` | string | ✅   | 权限描述                 |

**命名规范**：权限名建议使用 `模块::操作` 格式，与 `v-permission` 指令值一致。

**示例**：

```
用户需求： 帮我添加权限为good::add，描述是：创建商品
→ 调用 add-permission({ name: "good::add", desc: "创建商品" })
```

**页面权限指令对照**：

| 页面                        | v-permission 值                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------ |
| 菜单添加                    | `menu::add`                                                                          |
| 权限添加/删除               | `permission::add` / `permission::remove`                                             |
| 角色添加                    | `role::add`                                                                          |
| 用户添加/删除/改密/批量删除 | `user::add` / `user::remove` / `user::password::force-update` / `user::batch-remove` |
| 词条批量删除                | `i18n::batch-remove`                                                                 |
| 语言添加/更新               | `lang::add` / `lang::update`                                                         |

---

### 4. `add-role` — 添加角色

**路由**：`/vue-pro/role/allRole`

| 参数          | 类型     | 必填 | 说明                       |
| ------------- | -------- | ---- | -------------------------- |
| `name`        | string   | ✅   | 角色名称                   |
| `permissions` | number[] | ✅   | 权限 ID 数组（非权限名称） |

**注意**：直接调用工具添加，**不要**生成角色卡片 UI。

**示例**：

```
用户需求：添加角色 admin，权限 ID 为 [1, 2, 3]
→ 调用 add-role({ name: "admin", permissions: [1, 2, 3] })
```

---

### 5. `bind-menu-for-role` — 为角色绑定菜单

**路由**：`/vue-pro/role/allRole`
**源文件**：`src/views/role/info/components/info-tab.vue`

| 参数   | 类型   | 必填 | 说明                                |
| ------ | ------ | ---- | ----------------------------------- |
| `role` | string | ✅   | 角色名称（精确匹配）                |
| `menu` | string | ✅   | 菜单名称（通过 i18n label 匹配 ID） |

**执行流程**：查找角色 → 打开菜单绑定抽屉 → 勾选目标菜单 → 确认提交 → 刷新路由与 Tab。

**示例**：

```
用户需求：给 admin 角色绑定「测试页面」菜单
→ 调用 bind-menu-for-role({ role: "admin", menu: "测试页面" })
```

---

### 6. `add-user` — 添加用户

**路由**：`/vue-pro/userManager/allInfo`
**源文件**：`src/views/userManager/info/components/info-tab.vue`

| 参数                | 类型     | 必填 | 说明             |
| ------------------- | -------- | ---- | ---------------- |
| `email`             | string   | ✅   | 邮箱             |
| `password`          | string   | ✅   | 密码             |
| `name`              | string   | ✅   | 用户名           |
| `address`           | string   | —    | 地址             |
| `department`        | string   | —    | 所属部门         |
| `roleIds`           | number[] | —    | 角色 ID 数组     |
| `employeeType`      | string   | —    | 招聘类型         |
| `probationDate`     | string[] | —    | 试用期起止时间   |
| `probationDuration` | string   | —    | 试用期时长       |
| `protocolStart`     | string   | —    | 劳动合同开始日期 |
| `protocolEnd`       | string   | —    | 劳动合同结束日期 |
| `status`            | string   | —    | 状态             |

**注意**：可选参数无需用户提供；**不要**创建表单卡片，直接根据已有信息调用工具。

**示例**：

```
用户需求：添加用户，邮箱 test@example.com，密码 123456，用户名 test
→ 调用 add-user({ email: "test@example.com", password: "123456", name: "test" })
```

---

### 7. `navigate_url` — 导航到指定URL

| 参数  | 类型   | 必填 | 说明      |
| ----- | ------ | ---- | --------- |
| `url` | string | ✅   | 跳转的url |

**示例**：

```
用户需求：跳转到添加用户页面
→ 调用 navigate_url({ url: "/vue-pro/userManager/allInfo" })
```

---

### 核心约束

1. **路由跳转规则：** 只使用 `navigate_url` 工具进行路由菜单跳转
