# UI 迁移清单

本文档用于回答两个问题：

1. 当前哪些 UI 组件已经迁到 Vue 3
2. 这些组件在界面中的位置分别在哪里

说明：
- `已迁移` 表示组件主渲染逻辑已经切到 Vue，通常仍保留原有 d3 接口/命令式 API
- `部分迁移` 表示 Vue 负责壳层或容器，内部仍复用部分 d3 内容
- `未迁移` 表示仍由原 d3 逻辑实现


## 总览

| 状态 | 数量 | 说明 |
|------|------|------|
| 已迁移/部分迁移 | 83 | 已切到 Vue 或由 Vue 承载主要 UI 壳层 |
| 未迁移 | 6 | 主要集中在左侧编辑器深层逻辑、modal 基础设施、地图内嵌和照片查看器 |


## 地图右侧 / 覆盖层

| 组件 | 页面位置 | 状态 | Vue 文件 | 说明 |
|------|----------|------|----------|------|
| `uiZoom` | 右侧缩放按钮 | 已迁移 | `modules/ui/vue/ZoomControls.vue` | `+ / -` 缩放按钮 |
| `uiGeolocate` | 右侧定位按钮 | 已迁移 | `modules/ui/vue/GeolocateButton.vue` | 浏览器定位 |
| `uiZoomToSelection` | 右侧“缩放到选中对象”按钮 | 已迁移 | `modules/ui/vue/ZoomToSelectionButton.vue` | 依赖当前 mode |
| `uiNotice` | 地图上方提示条 | 已迁移 | `modules/ui/vue/NoticeBanner.vue` | 提示缩放到可编辑级别 |
| `uiAttribution` | 右下角归属信息 | 已迁移 | `modules/ui/vue/AttributionPanel.vue` | 底图/叠加层版权信息 |
| `uiInfo` | 右侧信息面板容器 | 部分迁移 | `modules/ui/vue/InfoPanels.vue` | Vue 管理壳层，panel 内容仍由 d3 渲染 |
| `uiEditMenu` | 选中要素后的弹出操作菜单 | 部分迁移 | `modules/ui/vue/EditMenuShell.vue` | Vue 管理菜单壳，定位/高亮/辅助几何仍在 JS 中 |
| `uiMapInMap` | 地图内小地图 | 未迁移 | - | d3 + zoom + tile 渲染，复杂度高 |
| `uiPhotoviewer` | 地图右侧照片查看区 | 未迁移 | - | 交互较复杂 |


## 底部栏 / 页脚

| 组件 | 页面位置 | 状态 | Vue 文件 | 说明 |
|------|----------|------|----------|------|
| `uiScale` | 左下角比例尺 | 已迁移 | `modules/ui/vue/ScaleBar.vue` | 公制/英制切换 |
| `uiStatus` | 底部 API 状态 | 已迁移 | `modules/ui/vue/StatusBar.vue` | 限流/只读/离线/重试 |
| `uiFlash` | 底部临时消息条 | 已迁移 | `modules/ui/vue/FlashMessage.vue` | 保留 imperative API |
| `uiContributors` | 底部贡献者列表 | 已迁移 | `modules/ui/vue/ContributorsList.vue` | 附近贡献者 |
| `uiSourceSwitch` | 底部 live/dev 切换 | 已迁移 | `modules/ui/vue/SourceSwitchChip.vue` | 数据源切换 |
| `uiIssuesInfo` | 底部问题统计 chip | 已迁移 | `modules/ui/vue/IssuesInfoChips.vue` | 校验问题统计 |
| `uiFeatureInfo` | 底部隐藏要素提示 chip | 已迁移 | `modules/ui/vue/FeatureInfoChip.vue` | 隐藏要素统计 |
| `uiVersion` | 底部版本号 | 已迁移 | `modules/ui/vue/VersionBadge.vue` | 版本号与新版本提示 |
| `uiAccount` | 底部登录/用户 | 已迁移 | `modules/ui/vue/AccountLinks.vue` | 含测试兼容回退逻辑 |


## 弹窗 / 模态层

| 组件 | 页面位置 | 状态 | Vue 文件 | 说明 |
|------|----------|------|----------|------|
| `uiRestore` | 首次加载时恢复草稿弹窗 | 已迁移 | `modules/ui/vue/RestoreModal.vue` | 恢复/清空草稿 |
| `uiLoading` | 阻塞式 loading 弹窗 | 已迁移 | `modules/ui/vue/LoadingModal.vue` | 保留 imperative API |
| `uiSplash` | 欢迎/隐私提示弹窗 | 部分迁移 | `modules/ui/vue/SplashModal.vue` | Vue modal，隐私 section 仍复用 d3 |
| `uiModal` | 通用 modal 基础设施 | 未迁移 | - | 多数旧组件仍依赖它 |
| `uiConfirm` | 通用确认弹窗 | 已迁移 | `modules/ui/vue/ConfirmDialog.vue` | 基于 `uiModal`，内容区已切到 Vue |
| `uiShortcuts` | 快捷键帮助弹窗 | 已迁移 | `modules/ui/vue/ShortcutsDialog.vue` | 基于 `uiModal`，内容区已切到 Vue |
| `uiSuccess` | 保存成功页 | 已迁移 | `modules/ui/vue/SuccessPanel.vue` | Vue 驱动成功页内容，社区展开区改为原生 details |


## Header / Inspector 小组件

| 组件 | 页面位置 | 状态 | Vue 文件 | 说明 |
|------|----------|------|----------|------|
| `uiDataHeader` | 自定义数据图层 header | 已迁移 | `modules/ui/vue/DataHeader.vue` | 保留 `.datum()` |
| `uiNoteHeader` | Note header | 已迁移 | `modules/ui/vue/NoteHeader.vue` | 保留 `.note()` |
| `uiKeepRightHeader` | KeepRight 问题 header | 已迁移 | `modules/ui/vue/KeepRightHeader.vue` | 保留 `.issue()` |
| `uiOsmoseHeader` | Osmose 问题 header | 已迁移 | `modules/ui/vue/OsmoseHeader.vue` | 保留 `.issue()` |
| `uiKeepRightDetails` | KeepRight 问题详情 | 已迁移 | `modules/ui/vue/KeepRightDetails.vue` | 保留 `.issue()`，链接交互改为 Vue + DOM 绑定 |
| `uiOsmoseDetails` | Osmose 问题详情 | 已迁移 | `modules/ui/vue/OsmoseDetails.vue` | 保留 `.issue()`，异步详情加载改为 Vue 驱动 |
| `uiLengthIndicator` | 输入框长度指示器 | 已迁移 | `modules/ui/vue/LengthIndicator.vue` | 保留 `.update()` / `.silent()` |
| `uiFieldHelp` | 字段帮助弹层 | 已迁移 | `modules/ui/vue/FieldHelpPanel.vue` | 保留 `.button()` / `.body()`，按钮仍沿用旧接口 |
| `uiTagReference` | 标签文档引用弹层 | 已迁移 | `modules/ui/vue/TagReferenceBody.vue` | 文档内容已切到 Vue，保留 `.button()` / `.body()` |
| `uiSectionFeatureType` | Inspector 中的类型区块 | 部分迁移 | `modules/ui/vue/FeatureTypeSection.vue` | Vue 管理区块壳层，图标/引用按钮仍复用 d3；已补 section 生命周期清理与 targeted tests |
| `uiSectionPresetFields` | Inspector 中的字段区块 | 部分迁移 | `modules/ui/vue/PresetFieldsSection.vue` | Vue 管理区块壳层，字段本体继续复用 `uiFormFields`/`uiField`；已补 section 生命周期清理与 targeted tests |
| `uiFormFields` | 字段组容器 | 部分迁移 | `modules/ui/vue/FormFieldsShell.vue` | Vue 管理字段挂载位与“更多字段”输入壳层；已补 unmount 级联清理 |
| `uiField` | 单个字段外壳 | 部分迁移 | `modules/ui/vue/FieldShell.vue` | Vue 管理 label/按钮/挂载位，具体字段实现仍复用 `ui/fields/*`；已补 field/help/reference unmount 级联清理 |
| `ui/fields/check.js` | checkbox/oneway 字段实现 | 已迁移 | `modules/ui/vue/CheckFieldInput.vue` | Vue 驱动 checkbox 与 reverser 外壳 |
| `ui/fields/textarea.js` | textarea 字段实现 | 已迁移 | `modules/ui/vue/TextareaFieldInput.vue` | Vue 驱动 textarea 外壳与长度提示挂载位 |
| `ui/fields/input.js` | text/number/url/date 等字段实现 | 部分迁移 | `modules/ui/vue/InputFieldShell.vue` | Vue 管理基础输入壳层，复杂附属控件仍复用 d3 |
| `ui/fields/combo.js` | combo/multiCombo/semiCombo/typeCombo 字段实现 | 部分迁移 | `modules/ui/vue/ComboFieldShell.vue` | Vue 管理输入壳层，combobox/taginfo/chip/拖拽逻辑继续复用 d3 |
| `ui/fields/address.js` | address 地址字段实现 | 部分迁移 | `modules/ui/vue/AddressFieldShell.vue` | Vue 管理 address 外层容器壳层，国家格式和下拉逻辑仍复用 d3 |
| `ui/fields/localized.js` | localized 名称字段实现 | 部分迁移 | `modules/ui/vue/LocalizedFieldShell.vue` | Vue 管理主输入/添加按钮/多语言容器壳层，多语言 entry 仍复用 d3 |
| `ui/fields/lanes.js` | lanes 车道示意字段实现 | 部分迁移 | `modules/ui/vue/LanesFieldShell.vue` | Vue 管理 SVG 挂载壳层，车道图形绘制仍复用 d3 |
| `ui/fields/restrictions.js` | restrictions 转向限制字段实现 | 部分迁移 | `modules/ui/vue/RestrictionsFieldShell.vue` | Vue 管理 viewer/controls 容器壳层，交互逻辑和 SVG 渲染仍复用 d3 |
| `ui/fields/access.js` | access 通行权限字段实现 | 部分迁移 | `modules/ui/vue/AccessFieldShell.vue` | Vue 管理 access 行列表壳层，combobox/placeholder 推导逻辑仍复用 d3 |
| `ui/fields/wikipedia.js` | wikipedia 维基百科字段实现 | 部分迁移 | `modules/ui/vue/WikipediaFieldShell.vue` | Vue 管理语言/标题/外链壳层，标题建议与 wikidata 联动仍复用 d3 |
| `ui/fields/wikidata.js` | wikidata 维基数据字段实现 | 部分迁移 | `modules/ui/vue/WikidataFieldShell.vue` | Vue 管理搜索行、说明/标识展示和复制按钮壳层，搜索与实体回填仍复用 d3 |
| `ui/fields/directional_combo.js` | directional combo 定向组合字段实现 | 部分迁移 | `modules/ui/vue/DirectionalComboFieldShell.vue` | Vue 管理左右向行壳层和 combo 挂载位，定向标签归并与写回逻辑仍复用 d3 |
| `ui/fields/radio.js` | radio / structureRadio 字段实现 | 部分迁移 | `modules/ui/vue/RadioFieldShell.vue` | Vue 管理单选项列表、placeholder 与 structure extras 壳层，选中逻辑和嵌套子字段仍复用 d3 |
| `ui/fields/roadspeed.js` | 道路限速字段实现 | 已迁移 | `modules/ui/vue/RoadspeedFieldInput.vue` | Vue 驱动限速输入壳层与单位输入 |
| `ui/fields/roadheight.js` | 道路限高字段实现 | 已迁移 | `modules/ui/vue/RoadheightFieldInput.vue` | Vue 驱动限高输入壳层与双单位输入 |
| `uiPresetIcon` | 预设图标渲染器 | 部分迁移 | `modules/ui/vue/PresetIconShell.vue` | Vue 承载图标挂载壳层，具体 SVG/图像绘制仍复用原逻辑 |
| `uiSectionSelectionList` | Inspector 中的多选列表区块 | 已迁移 | `modules/ui/vue/SelectionListSection.vue` | Vue 驱动多选实体列表 |
| `uiSectionEntityIssues` | Inspector 中的实体问题区块 | 已迁移 | `modules/ui/vue/EntityIssuesSection.vue` | Vue 驱动问题列表、fix 按钮、reference 展开 |
| `uiSectionRawTagEditor` | Raw Tag Editor 区块 | 部分迁移 | `modules/ui/vue/RawTagEditorShell.vue` | Vue 管理 view/text/list 壳层，行级编辑逻辑仍复用 d3；已补 `section.unmount()` 生命周期清理 |
| `uiSectionRawMemberEditor` | Relation 成员编辑区块 | 部分迁移 | `modules/ui/vue/MemberEditorShell.vue` | Vue 管理成员列表壳层，行级编辑/拖拽仍复用 d3；已补 `section.unmount()` 生命周期清理 |
| `uiSectionRawMembershipEditor` | Relation 归属编辑区块 | 部分迁移 | `modules/ui/vue/MembershipEditorShell.vue` | Vue 管理成员归属列表与 add-row 壳层，行级逻辑仍复用 d3；已补 `section.unmount()` 生命周期清理 |
| `uiSectionPrivacy` | 设置中的隐私区块 | 已迁移 | `modules/ui/vue/PrivacySection.vue` | Vue 驱动第三方图标隐私设置 |
| `uiSectionMapFeatures` | Map Features 区块 | 已迁移 | `modules/ui/vue/MapFeaturesSection.vue` | Vue 驱动 feature toggle 列表；已补 section lifecycle cleanup |
| `uiSectionMapStyleOptions` | Map Style Options 区块 | 已迁移 | `modules/ui/vue/MapStyleOptionsSection.vue` | Vue 驱动面填充/高亮编辑选项 |
| `uiSectionValidationStatus` | Validation 状态区块 | 已迁移 | `modules/ui/vue/ValidationStatusSection.vue` | Vue 驱动“无问题/隐藏问题/重置忽略”状态展示；已补 section lifecycle cleanup |
| `uiSectionChanges` | Changes 区块 | 已迁移 | `modules/ui/vue/ChangesSection.vue` | Vue 驱动 changes 列表与下载链接 |
| `uiSectionBackgroundDisplayOptions` | Background Display Options 区块 | 已迁移 | `modules/ui/vue/BackgroundDisplayOptionsSection.vue` | Vue 驱动亮度/对比度/饱和度/锐化滑块；已补 section lifecycle cleanup |
| `uiSectionBackgroundOffset` | Background Offset 区块 | 已迁移 | `modules/ui/vue/BackgroundOffsetSection.vue` | Vue 驱动偏移输入、nudge 按钮和 reset UI |
| `uiSectionValidationOptions` | Validation Options 区块 | 已迁移 | `modules/ui/vue/ValidationOptionsSection.vue` | Vue 驱动 what/where 过滤选项；已补 section lifecycle cleanup |
| `uiSectionValidationRules` | Validation Rules 区块 | 已迁移 | `modules/ui/vue/ValidationRulesSection.vue` | Vue 驱动规则列表与 unsquare 阈值输入；已补 section lifecycle cleanup |
| `uiSectionValidationIssues` | Validation Issues 区块 | 已迁移 | `modules/ui/vue/ValidationIssuesSection.vue` | Vue 驱动 severity issue 列表 |
## 外链 / 跳转类组件

| 组件 | 页面位置 | 状态 | Vue 文件 | 说明 |
|------|----------|------|----------|------|
| `uiViewOnOSM` | Inspector / Note / QA 区域 | 已迁移 | `modules/ui/vue/ViewOnOSMLink.vue` | 保留 `.what()` |
| `uiViewOnKeepRight` | KeepRight 明细区域 | 已迁移 | `modules/ui/vue/ViewOnKeepRightLink.vue` | 保留 `.what()` |
| `uiViewOnOsmose` | Osmose 明细区域 | 已迁移 | `modules/ui/vue/ViewOnOsmoseLink.vue` | 保留 `.what()` |
| `uiNoteReport` | Note 明细区域 | 已迁移 | `modules/ui/vue/NoteReportLink.vue` | 保留 `.note()` |


## 顶部 / 快捷键 / 基础绑定

| 组件 | 页面位置 | 状态 | Vue 文件 | 说明 |
|------|----------|------|----------|------|
| `uiFullScreen` | 全屏快捷键绑定 | 已迁移 | `modules/ui/vue/FullScreenBinding.vue` | 没有明显可见 UI |
| `uiTopToolbar` | 顶部工具栏整体 | 已迁移 | `modules/ui/vue/TopToolbarShell.vue` | Vue 管理工具栏壳层，工具内部仍复用 d3 render |
| `uiShortcuts` | 全局快捷键帮助 | 已迁移 | `modules/ui/vue/ShortcutsDialog.vue` | 仍复用 `uiModal` 作为壳层 |


## 左侧主编辑区 / 主表单体系

这一块目前**大部分还没迁**，仍是后续主战场。

| 组件 | 页面位置 | 状态 | 说明 |
|------|----------|------|------|
| `uiSidebar` | 左侧栏总容器 | 已迁移 | `modules/ui/vue/SidebarShell.vue` | Vue 管理 sidebar 壳层，内部继续复用已迁 feature/inspector/editor 组件 |
| `uiFeatureList` | 左侧要素列表 | 已迁移 | `modules/ui/vue/FeatureListPanel.vue` | Vue 驱动搜索框与结果列表，保留 geocoder/选择逻辑 |
| `uiInspector` | 左侧属性检查器 | 已迁移 | `modules/ui/vue/InspectorShell.vue` | Vue 管理 preset/editor 双 pane 壳层，内部仍复用 d3 子编辑器 |
| `uiEntityEditor` | 实体编辑壳层 | 已迁移 | `modules/ui/vue/EntityEditorShell.vue` | Vue 管理 header/body 壳层，section 仍复用 d3 |
| `uiField` | 表单字段 | 未迁移 | 后续重构重点 |
| `uiFormFields` | 表单字段组 | 未迁移 | 后续重构重点 |
| `uiPresetList` | 预设列表 | 部分迁移 | `modules/ui/vue/PresetListShell.vue`, `modules/ui/vue/PresetListEntry.vue`, `modules/ui/vue/PresetListCategory.vue` | Vue 已接管 shell/entry/category；补充 item 缓存与重绘复用，稳定 current/disabled 等状态更新 |
| `uiDataEditor` | 数据编辑器 | 已迁移 | `modules/ui/vue/DataEditorPanel.vue` | Vue 壳层 + 复用 d3 raw tag editor |
| `uiNoteEditor` | Note 编辑器 | 已迁移 | `modules/ui/vue/NoteEditorPanel.vue` | Vue 壳层 + 复用已迁 header/comments/footer 组件 |
| `uiKeepRightEditor` | KeepRight 编辑器 | 已迁移 | `modules/ui/vue/KeepRightEditorPanel.vue` | Vue 壳层 + 复用已迁 header/details/footer 组件 |
| `uiOsmoseEditor` | Osmose 编辑器 | 已迁移 | `modules/ui/vue/OsmoseEditorPanel.vue` | Vue 壳层 + 复用已迁 header/details/link |
| `uiNoteComments` | Note 评论列表 | 已迁移 | `modules/ui/vue/NoteCommentsList.vue` | Vue 驱动评论列表与头像替换 |


## 迁移优先级建议（下一阶段）

### 第一组：基础设施补齐

| 优先级 | 组件 | 原因 |
|--------|------|------|
| 高 | `uiModal` | 影响 `uiConfirm` / `uiShortcuts` / `uiSuccess` |
| 高 | `uiConfirm` | 依赖 `uiModal`，改完可统一弹窗体系 |
| 高 | `uiShortcuts` | 用户可见度高，适合复用新 modal 体系 |

### 第二组：复杂内容弹层

| 优先级 | 组件 | 原因 |
|--------|------|------|
| 高 | `uiSuccess` | 保存成功页内容多但结构明确 |
| 中 | `uiFieldHelp` | 仍依赖 d3 内容插入，可做混合迁移 |

### 第三组：大块容器

| 优先级 | 组件 | 原因 |
|--------|------|------|
| 高 | `uiTopToolbar` | 顶部区域统一 Vue 化的切入点 |
| 高 | `uiSidebar` | 左侧主编辑区入口 |
| 高 | `uiInspector` | 核心表单编辑区 |


## 对照建议

如果你想快速确认“某个 Vue 文件对应界面哪一块”，建议直接按下面顺序看：

1. `modules/ui/init.js` — 看组件挂载到哪个 DOM 区域
2. `modules/ui/*.js` — 看旧接口名和挂载方式
3. `modules/ui/vue/*.vue` — 看新的 Vue 实现

例如：
- `modules/ui/init.js:196` 挂载 `uiZoom(context)` → 对应 `modules/ui/vue/ZoomControls.vue`
- `modules/ui/init.js:265` 挂载 `uiStatus(context)` → 对应 `modules/ui/vue/StatusBar.vue`
- `modules/ui/init.js:241` 挂载 `uiInfo(context)` → 对应 `modules/ui/vue/InfoPanels.vue`
