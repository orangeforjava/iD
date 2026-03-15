# Vue 3 + Element Plus 迁移指南

本文档描述如何将 iD 编辑器的 UI 组件从 d3 渲染逐步迁移到 Vue 3 单文件组件（SFC）+ Element Plus。

## 架构概述

### 共存策略

iD 的 UI 是一棵由 d3 管理的 DOM 树。迁移采用**逐组件、自底向上**的方式。

核心架构：**全局只有一个 Vue app 实例**，通过 `<Teleport>` 将各个 Vue 组件分发到 d3 创建的 DOM 节点中渲染。

```
┌─ Vue App（单实例，挂载在隐藏的 #vue-root 上） ───────────────┐
│  VueRoot.vue                                                  │
│    ├─ <Teleport to=".zoombuttons">                            │
│    │    └─ <ZoomControls />                                   │
│    ├─ <Teleport to=".version-li">                             │
│    │    └─ <VersionDisplay />                                 │
│    └─ ...（更多通过 Teleport 分发的组件）                     │
└───────────────────────────────────────────────────────────────┘
```

每个已迁移的组件：

1. **保留原有的 d3 call 接口**（`function(selection)`），父级代码（`init.js`）无需改动。
2. 通过 `mountVueComponent()` 将组件**注册**到全局 Vue app 中，由 `<Teleport>` 渲染到对应的 d3 DOM 节点。
3. 共享同一个 Vue app 的 **provide/inject** 上下文，所有组件都能访问 iD 的 `context`。

这种架构的优势：
- **单一 Vue 运行时实例**：共享插件、指令、provide/inject，避免每个组件一个 app 的资源浪费
- **组件间可通信**：所有 Vue 组件在同一棵组件树中，可使用 Vue 原生的父子通信机制
- **统一生命周期管理**：`ui.restart()` 时一次 `app.unmount()` 即可清理全部 Vue 组件
- **UI 层解耦**：核心逻辑（context、history、graph）与 UI 实现方案分离，未来可灵活替换为 React、Svelte 等任何框架

### 关键文件

| 文件 | 用途 |
|------|------|
| `modules/ui/vue/app.js` | 单例 Vue app 管理：`initVueApp()` / `destroyVueApp()` / `registerComponent()` / `unregisterComponent()` |
| `modules/ui/vue/VueRoot.vue` | 根组件：通过 `<Teleport>` 渲染所有注册的 Vue 组件 |
| `modules/ui/vue/bridge.js` | d3/Vue 桥接：`mountVueComponent()` + `contextKey` |
| `modules/ui/vue/useContext.js` | Vue composable，用于访问 iD context |
| `modules/ui/vue/*.vue` | Vue 单文件组件：`ZoomControls.vue`, `ScaleBar.vue`, `VersionBadge.vue`, `GeolocateButton.vue`, `ZoomToSelectionButton.vue`, `AttributionPanel.vue`, `StatusBar.vue`, `NoticeBanner.vue`, `SpinnerIndicator.vue`, `FeatureInfoChip.vue`, `IssuesInfoChips.vue`, `ContributorsList.vue`, `SourceSwitchChip.vue`, `AccountLinks.vue`, `RestoreModal.vue`, `FullScreenBinding.vue`, `ViewOnOSMLink.vue`, `ViewOnKeepRightLink.vue`, `ViewOnOsmoseLink.vue`, `DataHeader.vue`, `KeepRightHeader.vue`, `NoteHeader.vue`, `FlashMessage.vue`, `LoadingModal.vue`, `SplashModal.vue`, `InfoPanels.vue`, `EditMenuShell.vue`, `OsmoseHeader.vue`, `NoteReportLink.vue`, `LengthIndicator.vue`, `ConfirmDialog.vue`, `ShortcutsDialog.vue`, `KeepRightDetails.vue`, `OsmoseDetails.vue`, `FieldHelpPanel.vue`, `DataEditorPanel.vue`, `OsmoseEditorPanel.vue`, `KeepRightEditorPanel.vue`, `NoteEditorPanel.vue`, `TopToolbarShell.vue`, `SuccessPanel.vue`, `FeatureListPanel.vue`, `InspectorShell.vue`, `EntityEditorShell.vue`, `SidebarShell.vue`, `TagReferenceBody.vue`, `FeatureTypeSection.vue`, `PresetListShell.vue`, `FormFieldsShell.vue`, `PresetFieldsSection.vue`, `FieldShell.vue`, `SelectionListSection.vue`, `EntityIssuesSection.vue`, `CheckFieldInput.vue`, `NoteCommentsList.vue`, `TextareaFieldInput.vue`, `InputFieldShell.vue`, `ComboFieldShell.vue`, `LocalizedFieldShell.vue`, `LanesFieldShell.vue`, `AddressFieldShell.vue`, `RestrictionsFieldShell.vue`, `AccessFieldShell.vue`, `WikipediaFieldShell.vue`, `WikidataFieldShell.vue`, `RoadspeedFieldInput.vue`, `RoadheightFieldInput.vue`, `PresetIconShell.vue`, `RawTagEditorShell.vue`, `MemberEditorShell.vue`, `MembershipEditorShell.vue`, `PrivacySection.vue`, `MapFeaturesSection.vue`, `MapStyleOptionsSection.vue`, `ValidationStatusSection.vue`, `ChangesSection.vue`, `BackgroundDisplayOptionsSection.vue`, `BackgroundOffsetSection.vue`, `ValidationOptionsSection.vue`, `ValidationRulesSection.vue`, `ValidationIssuesSection.vue`, `BackgroundListSection.vue`, `OverlayListSection.vue`, `CustomBackgroundDialog.vue` |
| `modules/ui/*.js` | 包装文件，导出 d3 兼容函数 |
| `postcss.config.js` | PostCSS 配置（将 node_modules 排除在 `.ideditor` 前缀之外） |
| `modules/id.js` | 初始化 Vue app + Element Plus 组件 CSS 引入 |

## 分步迁移指南

### 第一步：选择组件

从 `modules/ui/` 中选择一个组件。适合迁移的组件特征：
- **自包含**（对其他 d3 UI 组件依赖少）
- **叶子节点**（不是其他组件的容器/编排器）
- **有对应的 Element Plus 组件**（按钮、tooltip、下拉菜单等）

评估复杂度时检查：
- 使用了多少 `context` API？
- 是否订阅了 d3-dispatch 事件？
- 是否依赖 `svgIcon`、`uiTooltip` 等 d3 工具函数？

### 第二步：创建 Vue 单文件组件

创建 `modules/ui/vue/YourComponent.vue`：

```vue
<template>
  <div class="vue-your-component">
    <!-- 使用 Element Plus 组件 -->
    <el-tooltip content="提示文本" placement="left">
      <button @click="handleClick">
        <!-- 引用现有的 SVG sprite 图标 -->
        <svg class="icon">
          <use href="#iD-icon-name" />
        </svg>
      </button>
    </el-tooltip>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ElTooltip } from 'element-plus';
import { t, localizer } from '../../core/localizer';
import { useContext } from './useContext';

// 访问 iD context
const { context, map, keybinding } = useContext();

// 响应式状态（替代手动 DOM class 切换）
const isActive = ref(false);

// 计算属性（替代 d3 data-join + update 模式）
const buttonLabel = computed(() => {
  return isActive.value ? t('your.active') : t('your.inactive');
});

// 事件处理（替代 d3 的 .on('click', ...)）
function handleClick() {
  // 直接调用 context API
  map().doSomething();
}

// 生命周期（替代 enter/exit 模式）
onMounted(() => {
  // 订阅 d3-dispatch 事件
  map().on('move.yourComponent', () => {
    isActive.value = map().someState();
  });
});

onUnmounted(() => {
  // 清理事件订阅
  map().on('move.yourComponent', null);
});
</script>

<style scoped>
.vue-your-component {
  display: contents; /* 继承父容器的 flex/grid 布局 */
}
</style>
```

### 第三步：更新包装文件

替换 `modules/ui/your_component.js` 中原有的 d3 实现：

```js
import { mountVueComponent } from './vue/bridge';
import YourComponent from './vue/YourComponent.vue';

export function uiYourComponent(context) {
  return mountVueComponent(YourComponent, context);
}
```

导出名和函数签名保持不变。`init.js` 和 `modules/ui/index.js` **无需任何修改**。

`mountVueComponent()` 内部会将组件注册到全局 Vue app 中，由 `VueRoot.vue` 的
`<Teleport>` 将其渲染到 d3 selection 指定的 DOM 节点。不会创建新的 Vue app 实例。

### 第四步：添加 Element Plus CSS（如使用了新组件）

首次使用某个 Element Plus 组件时，在 `modules/id.js` 中添加其 CSS 引入：

```js
// Element Plus 组件 CSS（按需引入以减小打包体积）
import 'element-plus/theme-chalk/el-tooltip.css';
import 'element-plus/theme-chalk/el-popper.css';
// 在此添加新组件的 CSS：
import 'element-plus/theme-chalk/el-button.css';
```

这些 CSS 通过 Vite 管道处理，但会被 **排除在 PostCSS 的 `.ideditor` 前缀转换之外**（在 `postcss.config.js` 中配置）。

### 第五步：测试验证

```bash
npm run test:once   # 运行全部测试
npm run build       # 验证生产构建
npm run dev         # 在浏览器中测试
```

## 常见迁移模式

### Section shell 的生命周期收敛

对于 `raw_tag_editor`、`raw_member_editor`、`raw_membership_editor` 这类 section，当前更稳妥的做法不是重写内部 d3 行级逻辑，而是先补齐 Vue shell 的生命周期：

- `renderDisclosureContent()` 内继续沿用 `registerComponent(...)` / `unregisterComponent(...)`
- section 对外补 `section.unmount()`，在 editor 或 `ui.restart()` 清理时主动注销对应的 Vue 注册项
- shell 只负责 options/list/text/add-row 等挂载位，typeahead、拖拽、tag diff、relation 变更仍留在原 d3 逻辑里

这类改动属于典型的 shell-first migration：先把容器和清理路径稳定下来，再逐步把更细的 UI 壳层迁入 Vue。

目前这条模式已经用于 `raw_tag_editor`、`raw_member_editor`、`raw_membership_editor`，并且三者都补上了 targeted section tests，用来验证：

- Vue shell 会在 disclosure 展开后稳定挂载
- refs 就绪后会触发一次 re-render，把 d3 内容接到正确的 mount point
- `section.unmount()` 会清理 teleported shell，避免 editor 重建或 `ui.restart()` 后残留注册项

同样的生命周期收敛思路现在也已经扩展到 `feature_type` / `preset_fields` 这类左侧编辑器 section，以及 `uiField` / `uiFormFields` / `uiTagReference` 这类嵌套壳层组件：

- 父 section 在 `unmount()` 时级联清理内部 Vue shell
- `uiFormFields` 会继续向下清理每个已创建 field
- `uiField` 会继续清理内部 field impl、help panel、tag reference shell

另外，一批纯 section-shell 的 Vue 区块也开始补显式 `section.unmount()`，例如 `map_features`、`map_style_options`、`privacy`、`validation_options`、`validation_rules`、`validation_status`、`background_display_options`、`background_list`、`background_offset`、`changes`、`overlay_list`。这类 section 逻辑本身不复杂，但补齐显式清理后，editor 重建和测试环境中的 Teleport 生命周期会更可控。

### 模式一：d3 事件订阅 -> Vue 响应式状态

**迁移前（d3）：**
```js
var isDisabled = false;

context.map().on('move.myComponent', function() {
  isDisabled = !context.map().canDoThing();
  button.classed('disabled', isDisabled);
});
```

**迁移后（Vue）：**
```js
const canDoThing = ref(true);

onMounted(() => {
  map().on('move.myComponent', () => {
    canDoThing.value = map().canDoThing();
  });
});

// 模板中: :class="{ disabled: !canDoThing }"
```

### 模式二：d3 Data Join -> Vue v-for

**迁移前（d3）：**
```js
var items = selection.selectAll('.item')
  .data(dataArray)
  .enter()
  .append('div')
  .attr('class', 'item')
  .text(d => d.label);
```

**迁移后（Vue）：**
```vue
<div v-for="item in dataArray" :key="item.id" class="item">
  {{ item.label }}
</div>
```

### 模式三：svgIcon -> SVG use 元素

**迁移前（d3）：**
```js
selection.call(svgIcon('#iD-icon-plus', 'light'));
// 生成: <svg class="icon light"><use xlink:href="#iD-icon-plus"></use></svg>
```

**迁移后（Vue）：**
```vue
<svg class="icon light">
  <use href="#iD-icon-plus" />
</svg>
```

SVG sprite 符号在启动时由 `svgDefs.js` 加载到 DOM 中，d3 和 Vue 组件均可通过片段标识符（`#id`）引用。

### 模式四：uiTooltip -> ElTooltip

**迁移前（d3）：**
```js
button.call(uiTooltip()
  .title(t.append('zoom.in'))
  .keys(['+'])
  .placement('left')
);
```

**迁移后（Vue）：**
```vue
<el-tooltip :content="`${t('zoom.in')} [+]`" placement="left">
  <button>...</button>
</el-tooltip>
```

### 模式五：键盘绑定注册

**迁移前（d3）：**
```js
context.keybinding().on(['+'], zoomIn);
// 无清理（快捷键是全局持久的）
```

**迁移后（Vue）：**
```js
onMounted(() => {
  keybinding().on(['+'], zoomIn);
});

onUnmounted(() => {
  keybinding().on(['+'], null);  // 清理
});
```

### 模式六：国际化（t 函数）

`t()` 函数在 Vue 组件中用法完全相同：

```js
import { t, localizer } from '../../core/localizer';

// 获取翻译字符串
const label = t('zoom.in');

// 检查文本方向
const isRtl = localizer.textDirection() === 'rtl';
```

注意：`t.append()` 是 d3 专用的辅助函数，返回一个用于 `selection.call()` 的函数。在 Vue 模板中直接使用 `t()` 获取字符串。

### 模式七：CSS display:contents

当 Vue 组件挂载在 d3 的 flex/grid 容器内部时，中间的 `<div class="vue-mount">` 包装层可能破坏布局。在 Vue 根元素上使用 `display: contents` 使其对 CSS 布局透明：

```css
.vue-your-component {
  display: contents;
}
```

这使组件的子元素直接参与父容器的 flex/grid 布局，就好像包装元素不存在一样。

## useContext() API 参考

`useContext()` composable 提供对 iD 核心系统的访问：

```js
import { useContext } from './useContext';

const {
  context,       // 完整的 iD context 对象
  map,           // () => context.map()
  history,       // () => context.history()
  connection,    // () => context.connection()
  keybinding,    // () => context.keybinding()
  ui,            // () => context.ui()
} = useContext();
```

除 `context` 外，所有返回值都是**函数**，调用后返回当前实例。这与 iD 的模式一致——这些对象可能在 `ui.restart()` 时被重建。

## Element Plus 主题处理

Element Plus 组件的样式独立于 iD 的 CSS。PostCSS 的 `.ideditor` 前缀转换已配置为**跳过 `node_modules/` 中的 CSS 文件**（见 `postcss.config.js`），因此 Element Plus 样式不受前缀影响。

为确保与 iD 设计风格的视觉一致性：
- 在 Vue SFC 中使用 `scoped` 样式进行组件级别的覆盖
- 需要时引用 iD 的 CSS 变量（如 `var(--link-color)`）
- 继续通过 `<use href="#icon-id" />` 使用 iD 的 SVG sprite 图标

## 迁移优先级建议

| 优先级 | 组件 | 复杂度 | Element Plus 适配度 | 备注 |
|--------|------|--------|---------------------|------|
| 已完成 | `uiZoom` | 低 | 高（按钮、tooltip） | 参考实现 |
| 已完成 | `uiScale` | 低 | 低（SVG 自定义渲染） | 比例尺组件 |
| 已完成 | `uiVersion` | 极低 | 中（链接、徽章） | 极简，显示版本号 |
| 已完成 | `uiGeolocate` | 低 | 高（按钮、tooltip） | 定位按钮 |
| 已完成 | `uiZoomToSelection` | 低 | 高（按钮、tooltip） | 缩放到选中对象 |
| 已完成 | `uiAttribution` | 低 | 低（信息展示） | 底图/叠加层归属信息 |
| 已完成 | `uiStatus` | 低 | 低（状态信息） | API 状态与重试入口 |
| 已完成 | `uiNotice` | 低 | 低（提示入口） | 可编辑缩放提示 |
| 已完成 | `uiSpinner` | 极低 | 低（加载反馈） | OSM 加载状态指示 |
| 已完成 | `uiFeatureInfo` | 低 | 中（chip + tooltip） | 隐藏要素提示 |
| 已完成 | `uiIssuesInfo` | 低 | 中（chip + tooltip） | 问题统计提示 |
| 已完成 | `uiContributors` | 低 | 低（信息展示） | 附近贡献者列表 |
| 已完成 | `uiSourceSwitch` | 低 | 低（单个 chip） | live/dev 数据源切换 |
| 已完成 | `uiAccount` | 中 | 中（账户入口） | 含测试兼容回退逻辑 |
| 已完成 | `uiRestore` | 中 | 低（阻塞弹窗） | 恢复草稿弹窗 |
| 已完成 | `uiFullScreen` | 极低 | 低（仅快捷键绑定） | 无可见 UI |
| 已完成 | `uiViewOnOSM` | 中 | 低（外链展示） | 保留 `.what()` 接口 |
| 已完成 | `uiViewOnKeepRight` | 低 | 低（外链展示） | 保留 `.what()` 接口 |
| 已完成 | `uiViewOnOsmose` | 低 | 低（外链展示） | 保留 `.what()` 接口 |
| 已完成 | `uiDataHeader` | 低 | 低（标题展示） | 保留 `.datum()` 接口 |
| 已完成 | `uiKeepRightHeader` | 低 | 低（标题展示） | 保留 `.issue()` 接口 |
| 已完成 | `uiNoteHeader` | 低 | 低（标题展示） | 保留 `.note()` 接口 |
| 已完成 | `uiFlash` | 中 | 中（命令式提示） | Vue 承载内容，保留 imperative API |
| 已完成 | `uiLoading` | 中 | 低（阻塞弹窗） | Vue 承载 loading modal |
| 已完成 | `uiSplash` | 中 | 低（欢迎弹窗） | Vue modal + d3 隐私 section 混合 |
| 已完成 | `uiInfo` | 高 | 中（面板容器） | Vue 管理面板壳，d3 渲染各 panel 内容 |
| 已完成 | `uiEditMenu` | 高 | 高（弹出菜单） | Vue 管理菜单壳，保留定位/高亮/辅助几何逻辑 |
| 已完成 | `uiOsmoseHeader` | 低 | 低（标题展示） | 保留 `.issue()` 接口 |
| 已完成 | `uiNoteReport` | 低 | 低（外链展示） | 保留 `.note()` 接口 |
| 已完成 | `uiLengthIndicator` | 中 | 中（提示 + 指示器） | 保留 `.update()` / `.silent()` imperative API |
| 已完成 | `uiConfirm` | 中 | 低（确认弹窗） | 基于 `uiModal`，内容区切到 Vue |
| 已完成 | `uiShortcuts` | 中 | 中（快捷键弹窗） | 基于 `uiModal`，内容区切到 Vue |
| 已完成 | `uiKeepRightDetails` | 中 | 低（详情展示） | Vue 驱动详情内容与链接交互 |
| 已完成 | `uiOsmoseDetails` | 中 | 低（详情展示） | Vue 驱动详情内容与异步数据加载 |
| 已完成 | `uiFieldHelp` | 中 | 低（帮助弹层） | Vue 驱动内容区，保留 `.button()` / `.body()` API |
| 已完成 | `uiDataEditor` | 中 | 低（编辑器壳层） | Vue 壳层 + 复用 d3 raw tag editor |
| 已完成 | `uiOsmoseEditor` | 中 | 低（编辑器壳层） | Vue 壳层 + 复用已迁 header/details/link |
| 已完成 | `uiKeepRightEditor` | 中 | 低（编辑器壳层） | Vue 壳层 + 复用已迁 header/details/link |
| 已完成 | `uiNoteEditor` | 中 | 低（编辑器壳层） | Vue 壳层 + 复用已迁 header/comments/footer 组件 |
| 已完成 | `uiTopToolbar` | 中 | 中（工具栏容器） | Vue 管理工具栏壳层，工具内部继续复用 d3 |
| 已完成 | `uiSuccess` | 高 | 中（成功页） | Vue 驱动成功页内容，社区展开区改为原生 details |
| 已完成 | `uiFeatureList` | 中 | 中（列表/搜索） | Vue 驱动搜索框与结果列表，保留 geocoder/选择逻辑 |
| 已完成 | `uiInspector` | 高 | 中（双 pane 容器） | Vue 管理 preset/editor 双 pane 壳层，内部继续复用 d3 子编辑器 |
| 已完成 | `uiEntityEditor` | 高 | 中（编辑器容器） | Vue 管理 header/body 壳层，section 继续复用 d3 |
| 已完成 | `uiSidebar` | 高 | 中（左侧总容器） | Vue 管理 sidebar 壳层，内部继续复用已迁子组件与拖拽逻辑 |
| 已完成 | `uiTagReference` | 中 | 低（文档弹层） | 文档内容切到 Vue，按钮/显隐 API 保持不变 |
| 部分迁移 | `uiPresetList` | 高 | 中（preset 列表） | Vue 管理 header/search/list 壳层，item/category 已走 Vue；本轮补充 item 缓存与重绘复用，稳定 current/disabled 等状态更新 |
| 部分迁移 | `uiSectionFeatureType` | 中 | 低（Inspector 区块） | Vue 管理区块壳层，图标/引用按钮仍复用 d3 |
| 部分迁移 | `uiFormFields` | 高 | 中（字段组容器） | Vue 管理字段挂载位与“更多字段”输入壳层 |
| 部分迁移 | `uiSectionPresetFields` | 高 | 中（字段区块） | Vue 管理区块壳层，字段本体继续复用 `uiField` |
| 部分迁移 | `uiField` | 高 | 中（字段外壳） | Vue 管理 label/按钮/挂载位，具体字段实现继续复用 `ui/fields/*` |
| 已完成 | `uiSectionSelectionList` | 中 | 低（多选列表） | Vue 驱动多选实体列表 |
| 已完成 | `uiSectionEntityIssues` | 中 | 中（问题列表） | Vue 驱动问题列表、fix 按钮、reference 展开 |
| 已完成 | `ui/fields/check.js` | 中 | 中（字段实现） | Vue 驱动 checkbox 与 reverser 外壳 |
| 已完成 | `uiNoteComments` | 中 | 低（评论列表） | Vue 驱动评论列表与头像替换 |
| 已完成 | `ui/fields/textarea.js` | 中 | 中（字段实现） | Vue 驱动 textarea 外壳与长度提示挂载位 |
| 部分迁移 | `ui/fields/input.js` | 高 | 中（字段实现） | Vue 管理基础输入壳层，复杂附属控件仍复用 d3 |
| 部分迁移 | `ui/fields/combo.js` | 高 | 中（字段实现） | Vue 管理 combo/multiCombo/semiCombo 输入壳层，taginfo/chip/拖拽逻辑继续复用 d3 |
| 部分迁移 | `ui/fields/address.js` | 高 | 中（字段实现） | Vue 管理 address 容器壳层，国家格式、行布局和 dropdown 逻辑继续复用 d3 |
| 部分迁移 | `ui/fields/localized.js` | 高 | 中（字段实现） | Vue 管理主输入/添加按钮/多语言容器壳层，多语言 entry 与 combobox 逻辑继续复用 d3 |
| 部分迁移 | `ui/fields/lanes.js` | 中 | 低（字段实现） | Vue 管理 lanes SVG 挂载壳层，车道图形绘制继续复用 d3 |
| 部分迁移 | `ui/fields/restrictions.js` | 极高 | 低（字段实现） | Vue 管理 viewer/controls 容器壳层，交互状态机、turn logic、SVG 图层渲染继续复用 d3 |
| 部分迁移 | `ui/fields/access.js` | 中 | 中（字段实现） | Vue 管理 access 行列表壳层，combobox、placeholder 推导和 change 分发继续复用 d3 |
| 部分迁移 | `ui/fields/wikipedia.js` | 高 | 中（字段实现） | Vue 管理语言输入、标题输入和外链按钮壳层，建议与 wikidata 联动逻辑继续复用 d3 |
| 部分迁移 | `ui/fields/wikidata.js` | 高 | 中（字段实现） | Vue 管理搜索行、说明/标识只读区和复制按钮壳层，搜索与 wikipedia 同步逻辑继续复用 d3 |
| 部分迁移 | `ui/fields/directional_combo.js` | 中 | 中（字段实现） | Vue 管理左右向行壳层与 combo 挂载位，方向合并/回写逻辑继续复用 d3 |
| 部分迁移 | `ui/fields/radio.js` | 高 | 中（字段实现） | Vue 管理 radio 选项列表、placeholder 和 structure extras 壳层，选中态与嵌套子字段继续复用 d3 |
| 已完成 | `ui/fields/roadspeed.js` | 中 | 中（字段实现） | Vue 驱动限速输入壳层与单位输入 |
| 已完成 | `ui/fields/roadheight.js` | 中 | 中（字段实现） | Vue 驱动限高输入壳层与双单位输入 |
| 部分迁移 | `uiPresetIcon` | 中 | 低（图标渲染） | Vue 承载图标挂载壳层，具体 SVG/图像绘制仍复用原逻辑 |
| 部分迁移 | `uiSectionRawTagEditor` | 高 | 中（raw tag 编辑） | Vue 管理 view/text/list 壳层，行级编辑逻辑仍复用 d3 |
| 部分迁移 | `uiSectionRawMemberEditor` | 高 | 中（relation 成员编辑） | Vue 管理成员列表壳层，行级编辑/拖拽仍复用 d3 |
| 部分迁移 | `uiSectionRawMembershipEditor` | 高 | 中（relation 归属编辑） | Vue 管理列表与 add-row 壳层，行级逻辑仍复用 d3 |
| 已完成 | `uiSectionPrivacy` | 低 | 低（设置区块） | Vue 驱动隐私设置项 |
| 已完成 | `uiSectionMapFeatures` | 中 | 低（图层开关区块） | Vue 驱动 feature toggle 列表 |
| 已完成 | `uiSectionMapStyleOptions` | 中 | 低（样式区块） | Vue 驱动面填充/高亮编辑选项 |
| 已完成 | `uiSectionValidationStatus` | 中 | 低（验证状态区块） | Vue 驱动“无问题/隐藏问题/重置忽略”状态展示 |
| 已完成 | `uiSectionChanges` | 中 | 低（变更列表区块） | Vue 驱动 changes 列表与下载链接 |
| 已完成 | `uiSectionBackgroundDisplayOptions` | 中 | 低（背景显示选项） | Vue 驱动亮度/对比度/饱和度/锐化滑块 |
| 已完成 | `uiSectionBackgroundOffset` | 中 | 低（背景偏移区块） | Vue 驱动偏移输入、nudge 按钮和 reset UI |
| 已完成 | `uiSectionValidationOptions` | 中 | 低（验证过滤区块） | Vue 驱动 what/where 过滤选项 |
| 已完成 | `uiSectionValidationRules` | 中 | 低（规则列表区块） | Vue 驱动规则列表与 unsquare 阈值输入 |
| 已完成 | `uiSectionValidationIssues` | 中 | 中（severity issue 列表） | Vue 驱动 severity issue 列表 |
| 已完成 | `uiSectionBackgroundList` | 中 | 中（底图列表） | Vue 驱动背景图层列表，测试环境保留 fallback |
| 已完成 | `uiSectionOverlayList` | 中 | 低（叠加层列表） | Vue 驱动 overlay 列表 |
| 已完成 | `uiSettingsCustomBackground` | 中 | 中（设置弹窗内容） | Vue 驱动 custom background 对话框内容，保留 fallback |
| 高 | `uiAccount` | 中 | 高（头像、按钮） | 登录状态、用户菜单 |
| 中 | `uiFlash` | 中 | 极高（el-message） | 被多个组件依赖 |
| 低 | `uiTopToolbar` | 高 | 中 | 含 5 个子工具的容器 |
| 低 | `uiSidebar` | 极高 | 中 | 核心编排器 |

## 常见问题排查

### "Failed to parse source for import analysis... Install @vitejs/plugin-vue"

`@vitejs/plugin-vue` 插件必须同时配置在 `vite.config.js` **和** `vitest.config.ts` 中。

### 测试中出现 "Unknown file extension .css"

Element Plus CSS 必须在 `modules/id.js` 中引入（不要在 `.vue` 文件内直接引入）。vitest 通过 jsdom 处理 CSS，但 Vue 组件中直接从 `node_modules` 引入 CSS 文件会在测试环境中失败。

### Element Plus 样式选择器异常

检查 `postcss.config.js` 中 `postcss-prefix-selector` 插件的 `transform` 函数是否正确跳过了 `node_modules` 文件。

### 挂载 Vue 组件后布局错乱

Vue 组件通过 `<Teleport>` 渲染到 d3 容器中，Teleport 本身不插入额外 DOM 节点。
如果父级 CSS 使用 `>` 直接子元素选择器（如 `.map-control > button`），确保 Vue
组件的模板中没有多余的包装层。可以利用 Vue 3 的 Fragment（多根节点）特性，
或在根元素上使用 `display: contents`。

### ui.restart() 后 Vue 组件不渲染

`ui.restart()` 会销毁并重建整个 UI。`init.js` 中已处理了 Vue app 的重新初始化
（`destroyVueApp()` + `initVueApp()`）。如果自定义了 restart 逻辑，确保包含这两步。
