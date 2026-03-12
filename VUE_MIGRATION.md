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
| `modules/ui/vue/*.vue` | Vue 单文件组件 |
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
| 高 | `uiVersion` | 极低 | 中（链接、徽章） | 极简，适合练手 |
| 高 | `uiAccount` | 中 | 高（头像、按钮） | 登录状态、用户菜单 |
| 中 | `uiFlash` | 中 | 极高（el-message） | 被多个组件依赖 |
| 中 | `uiGeolocate` | 低 | 高（按钮、tooltip） | 类似 zoom |
| 中 | `uiScale` | 低 | 低（自定义 SVG） | Element Plus 收益有限 |
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
