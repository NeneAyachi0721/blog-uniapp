import type { SeedDatabase } from "./shared";
import { day, json, now, run } from "./shared";

type RichTextBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "bulletList"; items: string[] }
  | { type: "orderedList"; items: string[] }
  | { type: "blockquote"; text: string }
  | { type: "codeBlock"; text: string; language?: string }
  | { type: "image"; src: string; alt?: string; width?: number };

type SeedPost = {
  uuid: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  coverImage: string;
  pinned?: boolean;
  publishedAt: number;
  viewCount: number;
  contentBlocks: RichTextBlock[];
};

const textNode = (text: string) => ({ type: "text", text });

const postCover = (uuid: string) => `/api/uploads/posts/${uuid}/cover.webp`;

const postImage = (uuid: string, title: string): RichTextBlock => ({
  type: "image",
  src: postCover(uuid),
  alt: `${title}封面图`,
  width: 640,
});

const paragraphNode = (text: string) => ({
  type: "paragraph",
  content: [textNode(text)],
});

const headingNode = (level: 2 | 3, text: string) => ({
  type: "heading",
  attrs: { level },
  content: [textNode(text)],
});

function listNode(type: "bulletList" | "orderedList", items: string[]) {
  return {
    type,
    content: items.map((item) => ({
      type: "listItem",
      content: [paragraphNode(item)],
    })),
  };
}

function blockquoteNode(text: string) {
  return {
    type: "blockquote",
    content: [paragraphNode(text)],
  };
}

function codeBlockNode(text: string, language = "typescript") {
  return {
    type: "codeBlock",
    attrs: { language },
    content: [textNode(text)],
  };
}

function imageNode(src: string, alt = "", width?: number) {
  return {
    type: "paragraph",
    content: [
      {
        type: "image",
        attrs: {
          src,
          alt,
          title: null,
          width: width ?? null,
        },
      },
    ],
  };
}

function buildContent(blocks: RichTextBlock[]) {
  return {
    type: "doc",
    content: blocks.map((block) => {
      switch (block.type) {
        case "heading":
          return headingNode(block.level, block.text);
        case "paragraph":
          return paragraphNode(block.text);
        case "bulletList":
          return listNode("bulletList", block.items);
        case "orderedList":
          return listNode("orderedList", block.items);
        case "blockquote":
          return blockquoteNode(block.text);
        case "codeBlock":
          return codeBlockNode(block.text, block.language);
        case "image":
          return imageNode(block.src, block.alt, block.width);
      }
    }),
  };
}

function contentText(blocks: RichTextBlock[]) {
  return blocks
    .flatMap((block) => {
      if ("text" in block) return [block.text];
      if ("items" in block) return block.items;
      if (block.type === "image") return [block.alt ?? ""];
      return [];
    })
    .join("\n");
}

function withCoverImage(post: SeedPost): SeedPost {
  return {
    ...post,
    coverImage: post.coverImage || postCover(post.uuid),
  };
}

function upsertPost(db: SeedDatabase, rawPost: SeedPost) {
  const post = withCoverImage(rawPost);

  run(
    db,
    `
    INSERT INTO post
      (uuid, title, content, content_text, cover_image, status, tags, slug, excerpt, view_count, pinned_at, published_at, deleted_at, created_at, updated_at)
    VALUES
      (?, ?, ?, ?, ?, 'published', ?, ?, ?, ?, ?, ?, NULL, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      content = excluded.content,
      content_text = excluded.content_text,
      cover_image = excluded.cover_image,
      status = excluded.status,
      tags = excluded.tags,
      excerpt = excluded.excerpt,
      view_count = excluded.view_count,
      pinned_at = excluded.pinned_at,
      published_at = excluded.published_at,
      deleted_at = NULL,
      updated_at = excluded.updated_at
    `,
    [
      post.uuid,
      post.title,
      json(buildContent(post.contentBlocks)),
      contentText(post.contentBlocks),
      post.coverImage,
      json(post.tags),
      post.slug,
      post.excerpt,
      post.viewCount,
      post.pinned ? now : null,
      post.publishedAt,
      post.publishedAt,
      now,
    ],
  );
}

export const posts: SeedPost[] = [
  {
    uuid: "seed-post-about-vue-notes-blog",
    title: "关于博客",
    slug: "about-vue-notes-blog",
    excerpt:
      "本博客将 Vue 3 课程内容整理为适合移动端阅读的章节笔记，并汇总项目技术栈相关的官方资料入口。",
    tags: ["置顶", "关于博客", "Vue 3", "笔记"],
    coverImage: "",
    pinned: true,
    publishedAt: now - day,
    viewCount: 520,
    contentBlocks: [
      {
        type: "heading",
        level: 2,
        text: "这个小站用来做什么",
      },
      {
        type: "paragraph",
        text: "这里不再放零散演示文章，而是专门整理 Vue 3 课程笔记。每篇文章对应一个章节，保留原笔记的知识顺序，同时把内容改写成更适合手机端阅读、复习和检索的笔记。",
      },
      {
        type: "bulletList",
        items: [
          "首页用于快速看到置顶说明和最新章节笔记。",
          "归档页按发布时间整理所有章节，适合考试前或项目复盘时快速回看。",
          "友链页改成项目技术栈的官方入口，不再使用虚构站点。",
          "文章详情页保留清透浅蓝视觉，降低阅读负担。",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "当前内容结构",
      },
      {
        type: "orderedList",
        items: [
          "Vue 3 简介：前端框架、MVC/MVVM、环境准备与安装方式。",
          "Hello World 与基础特性：插值、生命周期、数据绑定和案例。",
          "Vue 3 基本指令：条件渲染、列表渲染、属性绑定与表单。",
          "Vue 3 组件：组件注册、复用、通信、插槽、动态与异步组件。",
          "样式绑定：class、style、数组/对象语法和列表样式。",
          "组件复用：渲染函数、JSX、函数式组件、混入与插件。",
          "Vue Router：路由基础、动态路由、导航守卫、元信息与懒加载。",
          "服务端通信：请求封装、接口调用、状态处理与小程序端通信思路。",
          "Vue CLI 项目部署：脚手架、webpack、构建产物与发布检查。",
          "Vuex：集中式状态管理、getter、mutation、action 与模块化。",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "项目技术栈",
      },
      {
        type: "paragraph",
        text: "本博客项目本身使用 uni-app 做微信小程序前台，Vue 3 管理后台，Bun + Elysia 提供后端接口，Drizzle ORM 管理 SQLite 数据库。友链页已经改成这些工具的官方链接，方便学习时直接跳转到一手资料。",
      },
      {
        type: "blockquote",
        text: "学习笔记最重要的不是堆内容，而是把“看过的笔记”变成“下次还能快速看懂的知识地图”。",
      },
    ],
  },
  {
    uuid: "seed-post-vue3-introduction-notes",
    title: "第 1 章：Vue 3 简介",
    slug: "vue3-introduction-notes",
    excerpt:
      "从前端框架的发展讲起，理解 MVC、MVP、MVVM 的演变，再进入 Vue 3 的定位、优势、安装方式与调试工具。",
    tags: ["Vue 3", "前端框架", "学习笔记"],
    coverImage: "",
    publishedAt: now - 2 * day,
    viewCount: 388,
    contentBlocks: [
      { type: "heading", level: 2, text: "本章定位" },
      {
        type: "paragraph",
        text: "第 1 章的重点是建立 Vue 3 的整体认知：为什么会出现前端框架，MVC 到 MVVM 解决了什么问题，Vue 3 为什么适合渐进式开发，以及开始学习前需要准备哪些工具。",
      },
      { type: "heading", level: 2, text: "前端框架为什么出现" },
      {
        type: "paragraph",
        text: "早期 Web 开发主要面对浏览器兼容性问题，因此 jQuery 等兼容框架非常流行。随着 HTML5 和复杂交互出现，页面从 Web Site 进化为 Web App，单页面应用开始需要更清晰的状态管理、视图更新和组件组织方式。",
      },
      {
        type: "bulletList",
        items: [
          "MVC 将程序拆成 Model、View、Controller，降低耦合并提高复用。",
          "MVP 进一步把展示逻辑抽到 Presenter 中。",
          "MVVM 把 View 的状态和行为抽象出来，使视图 UI 与业务逻辑分离。",
        ],
      },
      { type: "heading", level: 2, text: "Vue 3 是什么" },
      {
        type: "paragraph",
        text: "Vue 3 是一个用于构建用户界面的渐进式 JavaScript 框架。简单页面可以只使用声明式渲染，复杂项目可以继续接入组件系统、Vue Router、状态管理和构建工具。",
      },
      {
        type: "bulletList",
        items: [
          "性能提升，编译体积更小。",
          "Composition API 更适合组织复杂逻辑。",
          "支持多根节点、更灵活的组件渲染与自定义渲染 API。",
          "对 TypeScript 的支持更好，更适合中大型项目。",
        ],
      },
      { type: "heading", level: 2, text: "环境准备" },
      {
        type: "orderedList",
        items: [
          "选择 IDE：推荐 VS Code，轻量、跨平台、插件生态丰富。",
          "配置 Node.js：安装后通过 node -v 与 npm -v 检查环境。",
          "安装 Vue 3：可通过独立版本、CDN、npm 或脚手架方式安装。",
          "熟悉 vue-devtools：用于观察组件树、状态和调试过程。",
        ],
      },
      {
        type: "blockquote",
        text: "初学 Vue 3 不需要一次掌握所有生态，先理解“响应式数据如何驱动视图”才是核心。",
      },
    ],
  },
  {
    uuid: "seed-post-vue3-hello-world-basics",
    title: "第 2 章：Hello World 与 Vue 3 基础特性",
    slug: "vue3-hello-world-basics",
    excerpt:
      "从第一个 Hello World 示例入手，整理文本插值、HTML 输出、属性绑定、生命周期和数据绑定的基本用法。",
    tags: ["Vue 3", "基础语法", "生命周期"],
    coverImage: "",
    publishedAt: now - 3 * day,
    viewCount: 344,
    contentBlocks: [
      { type: "heading", level: 2, text: "Hello World 示例" },
      {
        type: "paragraph",
        text: "Vue 3 的第一个示例通常从 data() 返回数据开始。模板中使用双大括号进行文本插值，数据变化后，页面会自动更新。",
      },
      {
        type: "codeBlock",
        language: "html",
        text: `<div id="app">
  <p>{{ message }}</p>
  <p>{{ message.toUpperCase() }}</p>
  <p v-html="spanHTML"></p>
</div>`,
      },
      {
        type: "bulletList",
        items: [
          "{{ message }} 用于普通文本插值。",
          "{{ message.toUpperCase() }} 展示模板表达式能力。",
          "v-html 可以输出原始 HTML，但实际项目中要注意 XSS 风险。",
          "v-bind:href 可以把链接地址绑定到响应式数据。",
        ],
      },
      { type: "heading", level: 2, text: "生命周期" },
      {
        type: "paragraph",
        text: "组件会经历创建实例、初始化数据、编译模板、挂载 DOM、渲染、更新和卸载等过程。理解生命周期可以帮助我们知道什么时候请求数据、什么时候访问 DOM、什么时候清理定时器或监听器。",
      },
      {
        type: "orderedList",
        items: [
          "beforeCreate / created：组件创建前后。",
          "beforeMount / mounted：挂载前后，mounted 之后可以访问真实 DOM。",
          "beforeUpdate / updated：响应式数据触发视图更新前后。",
          "beforeUnmount / unmounted：组件卸载前后，适合做清理工作。",
        ],
      },
      { type: "heading", level: 2, text: "数据绑定" },
      {
        type: "paragraph",
        text: "数据绑定是 Vue 的核心体验。文本插值适合显示字符串，v-bind 适合绑定 HTML 属性，v-html 适合插入 HTML 片段，复杂表达式应当抽到计算属性或方法里，避免模板变得难以维护。",
      },
      {
        type: "blockquote",
        text: "模板可以写表达式，但模板不应该承担复杂业务逻辑。让模板保持清晰，是写好 Vue 组件的第一步。",
      },
    ],
  },
  {
    uuid: "seed-post-vue3-directives-notes",
    title: "第 3 章：Vue 3 基本指令",
    slug: "vue3-directives-notes",
    excerpt:
      "整理 v-if、v-show、v-for、v-bind、v-model 的核心用法，并补充计算属性、方法与监听属性的使用场景。",
    tags: ["Vue 3", "指令", "v-model"],
    coverImage: "",
    publishedAt: now - 4 * day,
    viewCount: 322,
    contentBlocks: [
      { type: "heading", level: 2, text: "条件渲染：v-if 与 v-show" },
      {
        type: "paragraph",
        text: "v-if、v-else-if、v-else 用于根据条件创建或销毁元素；v-show 则始终创建元素，只是通过 display 样式控制显示隐藏。",
      },
      {
        type: "bulletList",
        items: [
          "切换频率低、条件较复杂时，优先考虑 v-if。",
          "切换频率高、只是显示隐藏时，v-show 更合适。",
          "v-else-if 和 v-else 必须紧跟 v-if 或 v-else-if。",
          "需要控制多个元素时，可以在 template 上使用 v-if。",
        ],
      },
      { type: "heading", level: 2, text: "列表渲染：v-for" },
      {
        type: "paragraph",
        text: "v-for 用于遍历数组、对象或数字区间。实际开发中应尽量提供稳定的 key，让 Vue 能更准确地追踪节点，提高渲染效率。",
      },
      {
        type: "codeBlock",
        language: "html",
        text: `<div v-for="item in items" :key="item.id">
  {{ item.message }}
</div>`,
      },
      { type: "heading", level: 2, text: "属性绑定：v-bind" },
      {
        type: "paragraph",
        text: "v-bind 用于动态绑定 HTML 属性或组件 props，常见简写是冒号。比如 :href、:class、:style、:disabled 都是实际项目中非常常用的写法。",
      },
      { type: "heading", level: 2, text: "表单双向绑定：v-model" },
      {
        type: "bulletList",
        items: [
          "文本框与 textarea 会监听输入事件。",
          "单选框、复选框、选择框会根据 value 与选中状态同步数据。",
          "trim 修饰符用于去除首尾空格。",
          "lazy 修饰符将更新时机从 input 改成 change。",
          "number 修饰符会尝试把输入转换成数值。",
        ],
      },
      { type: "heading", level: 2, text: "方法、计算属性与监听属性" },
      {
        type: "paragraph",
        text: "模板中调用方法适合处理事件或简单显示；计算属性适合从已有数据派生新值，并自动缓存；监听属性适合在某个数据变化后执行异步请求、日志记录或复杂副作用。",
      },
      {
        type: "blockquote",
        text: "v-if 管结构，v-show 管显示，v-for 管列表，v-bind 管属性，v-model 管表单。先记住这五个入口，Vue 模板就不难读。",
      },
    ],
  },
  {
    uuid: "seed-post-vue3-components-notes",
    title: "第 4 章：Vue 3 组件",
    slug: "vue3-components-notes",
    excerpt:
      "理解组件是 Vue 应用的核心：组件注册、复用、props、事件通信、插槽、动态组件和异步组件。",
    tags: ["Vue 3", "组件", "通信"],
    coverImage: "",
    publishedAt: now - 5 * day,
    viewCount: 301,
    contentBlocks: [
      { type: "heading", level: 2, text: "组件为什么重要" },
      {
        type: "paragraph",
        text: "组件是 Vue 3 中最核心的功能之一。一个复杂界面可以拆成一棵组件树，每个组件负责自己的结构、样式和逻辑，从而提升复用性、可维护性和扩展性。",
      },
      { type: "heading", level: 2, text: "组件注册与复用" },
      {
        type: "paragraph",
        text: "组件可以全局注册，也可以局部注册。复用组件时，每个组件实例都会维护自己独立的数据，因此组件的 data 选项必须是一个返回对象的函数，而不能直接写成共享对象。",
      },
      {
        type: "bulletList",
        items: [
          "全局注册：注册一次后可在任意组件中使用。",
          "局部注册：只在当前组件内部可用，更利于控制依赖范围。",
          "HTML 模板不区分大小写，因此组件引用常用 kebab-case。",
          "没有内容的组件在单文件组件中可以自闭合，但在原生 HTML 模板中不推荐。",
        ],
      },
      { type: "heading", level: 2, text: "组件通信" },
      {
        type: "orderedList",
        items: [
          "父传子：通过 props 把数据传入子组件。",
          "子传父：通过 emit 触发自定义事件。",
          "跨层级：可使用依赖注入、状态管理或事件总线思路。",
          "内容分发：通过 slot 把父组件中的内容放到子组件指定位置。",
        ],
      },
      { type: "heading", level: 2, text: "动态组件与异步组件" },
      {
        type: "paragraph",
        text: "动态组件通过 component 的 is 属性切换不同组件，配合 keep-alive 可以缓存组件状态。异步组件适合大型应用的代码分割，只有需要渲染时才加载对应模块。",
      },
      {
        type: "blockquote",
        text: "组件化不是为了把文件拆得越碎越好，而是让每个组件都有清晰职责。",
      },
    ],
  },
  {
    uuid: "seed-post-vue3-style-binding-notes",
    title: "第 5 章：样式绑定",
    slug: "vue3-style-binding-notes",
    excerpt:
      "整理 class 与 style 的动态绑定方式，包括对象语法、数组语法、计算属性和列表奇偶行样式。",
    tags: ["Vue 3", "样式绑定", "CSS"],
    coverImage: "",
    publishedAt: now - 6 * day,
    viewCount: 276,
    contentBlocks: [
      { type: "heading", level: 2, text: "class 对象语法" },
      {
        type: "paragraph",
        text: "v-bind:class 可以接收对象，通过布尔值控制 class 是否生效。这种写法适合处理 active、error、disabled 等状态样式。",
      },
      {
        type: "codeBlock",
        language: "html",
        text: `<div :class="{ active: isActive, 'text-danger': hasError }"></div>`,
      },
      { type: "heading", level: 2, text: "class 数组语法" },
      {
        type: "paragraph",
        text: "当一个元素需要组合多个 class 时，可以使用数组语法。数组里可以放字符串、变量、三元表达式，也可以继续嵌套对象语法。",
      },
      {
        type: "bulletList",
        items: [
          "[activeClass, errorClass]：直接组合多个类名。",
          "[isActive ? activeClass : '', errorClass]：按条件切换类名。",
          "[{ active: isActive }, errorClass]：数组与对象语法结合。",
        ],
      },
      { type: "heading", level: 2, text: "style 绑定" },
      {
        type: "paragraph",
        text: "v-bind:style 接收一个 JavaScript 对象，属性名可以用 camelCase，也可以使用带引号的 kebab-case。对于较复杂的样式，建议把样式对象放到 data 或 computed 中。",
      },
      {
        type: "codeBlock",
        language: "html",
        text: `<div :style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>`,
      },
      { type: "heading", level: 2, text: "实践提醒" },
      {
        type: "bulletList",
        items: [
          "状态类名适合用 class 绑定，动态数值适合用 style 绑定。",
          "复杂逻辑不要写满模板，抽到 computed 中更清晰。",
          "列表奇偶行样式可以结合 index 和取模判断实现。",
        ],
      },
      {
        type: "blockquote",
        text: "样式绑定的重点不是写法多，而是把 UI 状态和数据状态对应起来。",
      },
    ],
  },
  {
    uuid: "seed-post-vue3-component-reuse-notes",
    title: "第 6 章：组件复用",
    slug: "vue3-component-reuse-notes",
    excerpt:
      "从 DOM、渲染函数、JSX、函数式组件、混入对象和插件角度理解组件复用的不同层次。",
    tags: ["Vue 3", "组件复用", "渲染函数"],
    coverImage: "",
    publishedAt: now - 7 * day,
    viewCount: 249,
    contentBlocks: [
      { type: "heading", level: 2, text: "DOM 与渲染函数" },
      {
        type: "paragraph",
        text: "DOM 是 HTML 和 XML 文档的编程接口。普通开发中我们主要写模板，但在需要高度动态渲染时，可以使用渲染函数直接描述虚拟节点结构。",
      },
      {
        type: "bulletList",
        items: [
          "document.createElement 可以创建 DOM 节点。",
          "querySelector / querySelectorAll 可以选择页面元素。",
          "style 属性可以直接修改元素样式。",
          "Vue 渲染函数适合模板表达能力不足的高级场景。",
        ],
      },
      { type: "heading", level: 2, text: "JSX 与函数式组件" },
      {
        type: "paragraph",
        text: "JSX 让开发者用接近 HTML 的语法书写渲染函数，适合复杂条件和动态结构。函数式组件没有自己的状态，更像接收 props 并返回视图的纯函数。",
      },
      { type: "heading", level: 2, text: "混入与插件" },
      {
        type: "paragraph",
        text: "混入对象可以把多个组件共享的选项合并到组件本身，但在大型项目中容易带来来源不清的问题。插件更适合封装全局能力，例如全局方法、指令、组件库或第三方工具初始化。",
      },
      {
        type: "orderedList",
        items: [
          "简单视图复用：优先使用普通组件。",
          "复杂渲染逻辑：考虑渲染函数或 JSX。",
          "跨组件逻辑复用：Vue 3 中更推荐组合式函数。",
          "全局能力复用：用插件封装并在应用入口安装。",
        ],
      },
      {
        type: "blockquote",
        text: "复用不是复制粘贴的替代品，而是把稳定的规律沉淀成清晰的接口。",
      },
    ],
  },
  {
    uuid: "seed-post-vue-router-notes",
    title: "第 7 章：Vue Router 路由",
    slug: "vue-router-notes",
    excerpt:
      "整理路由基础、动态路由、嵌套路由、命名路由、导航守卫、路由元信息、懒加载、滚动行为与 History 模式。",
    tags: ["Vue Router", "路由", "SPA"],
    coverImage: "",
    publishedAt: now - 8 * day,
    viewCount: 235,
    contentBlocks: [
      { type: "heading", level: 2, text: "路由基础" },
      {
        type: "paragraph",
        text: "前端路由让单页面应用可以根据 URL 显示不同组件，而不必每次都从服务器重新加载完整页面。常见方案包括 hash、history、memory 和 static。",
      },
      {
        type: "bulletList",
        items: [
          "router-link 负责创建导航链接。",
          "router-view 是当前路由匹配组件的显示出口。",
          "JavaScript 中可以通过 router.push、router.replace、router.go 进行编程式导航。",
          "通过 this.$route 或组合式 API 可以读取当前路由参数。",
        ],
      },
      { type: "heading", level: 2, text: "动态路由与嵌套路由" },
      {
        type: "paragraph",
        text: "动态路由使用冒号标记路径参数，例如 /user/:id。多个路径可以映射到同一个组件，并通过 route.params 获取不同参数。嵌套路由则用 children 表达组件之间的嵌套显示关系。",
      },
      {
        type: "codeBlock",
        language: "typescript",
        text: `const routes = [
  { path: '/user/:id', component: User }
];`,
      },
      { type: "heading", level: 2, text: "路由进阶" },
      {
        type: "orderedList",
        items: [
          "命名路由：用 name 标识路由，跳转时更稳定。",
          "重定向与别名：处理旧地址、短链接或多入口访问。",
          "路由组件参数传递：通过 props 解耦组件与 $route。",
          "导航守卫：在进入、更新、离开路由时执行校验或重定向。",
          "路由元信息：在 meta 中保存标题、权限等附加信息。",
          "懒加载：把页面组件拆成异步 chunk，提升首屏加载速度。",
          "滚动行为：控制页面切换后的滚动位置。",
        ],
      },
      {
        type: "blockquote",
        text: "路由不是简单的页面跳转表，而是 SPA 的信息结构和访问路径设计。",
      },
    ],
  },
  {
    uuid: "seed-post-vue3-server-communication-notes",
    title: "第 8 章：Vue 3 服务端通信",
    slug: "vue3-server-communication-notes",
    excerpt:
      "围绕前后端通信整理请求封装、接口调用、加载状态、错误处理、跨域与小程序 request 合法域名等实践要点。",
    tags: ["Vue 3", "服务端通信", "API"],
    coverImage: "",
    publishedAt: now - 9 * day,
    viewCount: 218,
    contentBlocks: [
      { type: "heading", level: 2, text: "服务端通信解决什么问题" },
      {
        type: "paragraph",
        text: "前端页面通常只负责展示和交互，真实数据来自服务端接口。服务端通信就是把页面状态、用户操作和后端数据连接起来。",
      },
      { type: "heading", level: 2, text: "请求封装" },
      {
        type: "paragraph",
        text: "实际项目中不建议在每个页面直接写重复的请求逻辑，而是封装统一 request 层，集中处理 baseURL、请求头、超时、登录态、错误提示和响应解包。",
      },
      {
        type: "bulletList",
        items: [
          "Web 项目可使用 fetch 或 axios。",
          "uni-app 小程序端通常使用 uni.request。",
          "请求前设置 loading，请求结束后关闭 loading。",
          "失败时要给出明确提示，并避免页面一直停留在加载态。",
          "列表接口要考虑分页、空状态和下拉刷新。",
        ],
      },
      { type: "heading", level: 2, text: "接口调用流程" },
      {
        type: "orderedList",
        items: [
          "页面进入时，在生命周期中触发数据请求。",
          "调用 services 层函数，而不是在页面里拼接口地址。",
          "把响应数据写入响应式状态。",
          "根据 loading、error、empty 三种状态渲染不同界面。",
          "用户重试或切换筛选条件时重新请求。",
        ],
      },
      { type: "heading", level: 2, text: "小程序环境注意点" },
      {
        type: "bulletList",
        items: [
          "正式版必须使用 HTTPS 接口。",
          "微信公众平台需要配置 request 合法域名。",
          "本地开发时可以使用开发者工具的调试配置，但上线前要按正式环境检查。",
          "文章详情、归档、友链等公开接口要尽量保持响应体轻量。",
        ],
      },
      {
        type: "blockquote",
        text: "一个好用的 request 封装，能让页面代码只关心业务数据，而不是反复处理网络细节。",
      },
    ],
  },
  {
    uuid: "seed-post-vue-cli-deploy-notes",
    title: "第 9 章：Vue CLI 项目部署",
    slug: "vue-cli-deploy-notes",
    excerpt:
      "整理 Vue CLI 的安装、项目创建、目录结构、webpack 配置以及构建部署流程。",
    tags: ["Vue CLI", "部署", "webpack"],
    coverImage: "",
    publishedAt: now - 10 * day,
    viewCount: 194,
    contentBlocks: [
      { type: "heading", level: 2, text: "Vue CLI 的作用" },
      {
        type: "paragraph",
        text: "Vue CLI 是 Vue 生态中的脚手架工具，可以帮助开发者快速创建项目、运行开发服务器、构建生产产物，并提供 webpack 相关配置能力。",
      },
      {
        type: "codeBlock",
        language: "bash",
        text: `npm install -g @vue/cli
vue --version
vue create hello-world`,
      },
      { type: "heading", level: 2, text: "项目结构" },
      {
        type: "bulletList",
        items: [
          "node_modules：项目依赖。",
          "public：基础模板与公开资源，例如 index.html、favicon。",
          "src：项目主体代码，包括入口文件、组件和静态资源。",
          "package.json、babel.config.js、vue.config.js 等文件用于配置项目。",
        ],
      },
      { type: "heading", level: 2, text: "webpack 配置" },
      {
        type: "paragraph",
        text: "Vue CLI 底层使用 webpack。简单场景可以通过 configureWebpack 传入对象；需要根据环境动态修改时，可以传入函数；更精细的 loader 配置可以使用链式写法。",
      },
      { type: "heading", level: 2, text: "部署检查" },
      {
        type: "orderedList",
        items: [
          "执行生产构建命令，生成 dist 目录。",
          "确认静态资源路径和 publicPath 是否正确。",
          "把 dist 目录部署到静态服务器或后端 public 目录。",
          "配置接口反向代理，避免生产环境跨域问题。",
          "上线前检查刷新页面、路由 History 模式和 404 回退配置。",
        ],
      },
      {
        type: "blockquote",
        text: "部署不是最后一步才考虑的事情，路由模式、资源路径和接口代理都应该在开发期提前规划。",
      },
    ],
  },
  {
    uuid: "seed-post-vuex-state-management-notes",
    title: "第 10 章：Vuex 状态管理",
    slug: "vuex-state-management-notes",
    excerpt:
      "整理 Vuex 的核心概念：store、state、getters、mutations、actions、辅助函数和模块化管理。",
    tags: ["Vuex", "状态管理", "Vue 3"],
    coverImage: "",
    publishedAt: now - 11 * day,
    viewCount: 181,
    contentBlocks: [
      { type: "heading", level: 2, text: "Vuex 是什么" },
      {
        type: "paragraph",
        text: "Vuex 是为 Vue 应用设计的集中式状态管理模式。它把多个组件共享的状态放入统一 store，并通过明确规则保证状态变化可预测、可追踪。",
      },
      { type: "heading", level: 2, text: "安装与 store" },
      {
        type: "codeBlock",
        language: "bash",
        text: `npm install vuex@next --save
# 或
yarn add vuex@next --save`,
      },
      {
        type: "paragraph",
        text: "store 可以看作一个容器，包含应用中大部分共享状态。Vuex 状态是响应式的，组件读取 store 中的数据后，状态变化会自动触发视图更新。",
      },
      { type: "heading", level: 2, text: "核心概念" },
      {
        type: "orderedList",
        items: [
          "state：保存共享状态。",
          "getters：从 state 派生计算结果，类似 store 级计算属性。",
          "mutations：同步修改 state，是更改状态的唯一正式入口。",
          "actions：处理异步逻辑，再提交 mutation。",
          "modules：按业务模块拆分状态，避免单个 store 过大。",
        ],
      },
      { type: "heading", level: 2, text: "辅助函数" },
      {
        type: "bulletList",
        items: [
          "mapState：把 state 映射为组件计算属性。",
          "mapGetters：把 getters 映射为组件计算属性。",
          "mapMutations：把 mutations 映射为组件方法。",
          "mapActions：把 actions 映射为组件方法。",
        ],
      },
      {
        type: "blockquote",
        text: "Vuex 的关键是可预测。不要在任意组件里随手改共享状态，而要让状态变化有统一入口。",
      },
    ],
  },
];

export function seedPosts(db: SeedDatabase) {
  // 按你的需求：清空现有文章，再插入「置顶介绍 + 章节笔记」。
  run(db, "DELETE FROM post");
  for (const post of posts) upsertPost(db, post);
  return posts.length;
}
