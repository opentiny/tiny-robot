import logoUrl from '../logo.svg'
import './presentation.css'

const chapters = import.meta.glob('./chapters/*.html', {
  eager: true,
  import: 'default',
  query: '?raw',
})
const chapterMarkup = Object.entries(chapters)
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([, markup]) => markup)
  .join('\n\n')

document.querySelector('#content').innerHTML = chapterMarkup
document.querySelector('[data-presentation-logo]').src = logoUrl
window.CHAT_CASES = [
  { name: 'TinyRobot', path: '/', source: 'packages/chat-cases/src/cases/tiny-robot' },
  { name: 'DeepSeek', path: '/deepseek', source: 'packages/chat-cases/src/cases/deepseek' },
  { name: '豆包', path: '/doubao', source: 'packages/chat-cases/src/cases/doubao' },
  { name: 'Gemini', path: '/gemini', source: 'packages/chat-cases/src/cases/gemini' },
  { name: 'WorkHelper', path: '/worker-helper', source: 'packages/chat-cases/src/cases/worker-helper' },
]

function setupNavigation() {
      var topButton = document.querySelector("#back-to-top");
      var sections = Array.from(document.querySelectorAll(".section, .hero"));
      var toc = document.querySelector("#toc-nav");
      var stageIds = ["problem", "roadmap", "summary"];

      topButton.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

      sections.forEach(function (section) {
        if (stageIds.includes(section.id)) section.classList.add("section--stage");
        section.classList.add("reveal");
        var link = document.createElement("a");
        link.href = "#" + section.id;
        link.textContent = section.dataset.title;
        link.title = section.dataset.title;
        link.setAttribute("aria-label", section.dataset.title);
        link.dataset.target = section.id;
        toc.appendChild(link);
      });

      var links = Array.from(toc.querySelectorAll("a"));
      if (!("IntersectionObserver" in window)) {
        sections.forEach(function (section) { section.classList.add("is-visible"); });
        if (links[0]) links[0].classList.add("is-active");
      } else {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            links.forEach(function (link) { link.classList.toggle("is-active", link.dataset.target === entry.target.id); });
          });
        }, { rootMargin: "-18% 0px -72% 0px" });
        sections.forEach(function (section) { observer.observe(section); });
      }

      window.addEventListener("scroll", function () {
        topButton.classList.toggle("is-visible", window.scrollY > 500);
      }, { passive: true });
    }

    function writeClipboard(text) {
      if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
      var input = document.createElement("textarea");
      input.value = text;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      return Promise.resolve();
    }

    function setupCopyButtons() {
      document.querySelectorAll(".copy-button").forEach(function (button) {
        button.addEventListener("click", function () {
          var source = document.getElementById(button.dataset.copyTarget);
          writeClipboard(source.innerText).then(function () {
            var original = button.textContent;
            button.textContent = "已复制";
            window.setTimeout(function () { button.textContent = original; }, 1400);
          });
        });
      });
    }

    function setupTabs() {
      document.querySelectorAll(".tabs").forEach(function (tabs) {
        var tabButtons = Array.from(tabs.querySelectorAll(".tabs__button"));
        var tabPanels = Array.from(tabs.querySelectorAll(".tabs__panel"));
        tabButtons.forEach(function (button) {
          button.addEventListener("click", function () {
            var target = button.dataset.tab;
            tabButtons.forEach(function (item) {
              var active = item === button;
              item.classList.toggle("is-active", active);
              item.setAttribute("aria-selected", String(active));
            });
            tabPanels.forEach(function (panel) { panel.classList.toggle("is-active", panel.dataset.panel === target); });
          });
        });
      });
    }

    function setupCaseDemo() {
      var frame = document.querySelector("#case-demo-frame");
      var open = document.querySelector("#case-demo-open");
      var title = document.querySelector("#case-demo-title");
      var status = document.querySelector("#case-demo-status");
      var caseDemo = document.querySelector(".case-demo");
      var fullscreenButton = document.querySelector("#case-demo-fullscreen");
      var buttons = Array.from(document.querySelectorAll(".case-demo__tab"));
      var cases = window.CHAT_CASES || [];
      var origin = (new URLSearchParams(window.location.search).get("cases") || "http://127.0.0.1:5173").replace(/\/+$/, "");
      var loadTimer;

      buttons.forEach(function (button, index) {
        var item = cases[index];
        if (!item) return;
        button.textContent = item.name;
        button.dataset.caseName = item.name;
        button.dataset.casePath = item.path;
        button.dataset.caseSource = item.source;
      });

      function selectCase(button) {
        var path = button.dataset.casePath || "/";
        var url = origin + (path === "/" ? "/" : path);
        buttons.forEach(function (item) {
          var active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-selected", String(active));
        });
        title.textContent = button.dataset.caseName;
        open.href = url;
        frame.title = button.dataset.caseName + " Chat 案例";
        frame.src = url;
        frame.classList.add("is-changing");
        status.classList.remove("is-error");
        status.textContent = "案例服务：" + origin.replace(/^https?:\/\//, "") + " · 来源：" + button.dataset.caseSource;
        window.clearTimeout(loadTimer);
        loadTimer = window.setTimeout(function () {
          status.classList.add("is-error");
          frame.classList.remove("is-changing");
          status.textContent = "案例服务未连接：" + origin + " · 启动 chat-cases 后刷新此页";
        }, 4200);
      }

      frame.addEventListener("load", function () {
        frame.classList.remove("is-changing");
        window.clearTimeout(loadTimer);
        status.classList.remove("is-error");
        status.textContent = "案例服务已连接：" + origin.replace(/^https?:\/\//, "");
      });
      if (fullscreenButton && caseDemo) {
        fullscreenButton.addEventListener("click", function () {
          var action = document.fullscreenElement === caseDemo
            ? document.exitFullscreen()
            : caseDemo.requestFullscreen();
          action.catch(function () {
            status.classList.add("is-error");
            status.textContent = "当前浏览器不支持全屏演示";
          });
        });
        document.addEventListener("fullscreenchange", function () {
          fullscreenButton.textContent = document.fullscreenElement === caseDemo ? "退出全屏" : "全屏演示";
        });
      }
      buttons.forEach(function (button) { button.addEventListener("click", function () { selectCase(button); }); });
      selectCase(buttons[0]);
    }

    async function enhanceDiagrams() {
      var diagrams = Array.from(document.querySelectorAll(".mermaid"));
      if (!diagrams.length) return;
      try {
        var mermaidModule = await import("https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs");
        var mermaid = mermaidModule.default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: "base",
          themeVariables: {
            primaryColor: "#f1ded7",
            primaryTextColor: "#171717",
            primaryBorderColor: "#b44d35",
            lineColor: "#6b6862",
            secondaryColor: "#e5ebe3",
            tertiaryColor: "#f4e7d1",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          },
        });
        await mermaid.run({ nodes: diagrams });
      } catch (error) {
        diagrams.forEach(function (diagram) {
          diagram.innerHTML = "<p class=\"muted\">在线流程图加载失败，页面正文仍保留完整流程说明。</p>";
        });
      }
    }

    async function enhanceCode() {
      var blocks = Array.from(document.querySelectorAll("pre[data-lang]"));
      if (!blocks.length) return;
      try {
        var shiki = await import("https://esm.sh/shiki@3.20.0");
        var highlighter = await shiki.createHighlighter({
          themes: ["vitesse-light"],
          langs: ["typescript", "vue", "json", "shellscript"],
        });
        blocks.forEach(function (block) {
          var highlighted = document.createElement("div");
          highlighted.innerHTML = highlighter.codeToHtml(block.textContent || "", {
            lang: block.dataset.lang,
            theme: "vitesse-light",
          });
          var result = highlighted.firstElementChild;
          result.id = block.id;
          result.dataset.lang = block.dataset.lang;
          result.classList.add("code__pre");
          block.replaceWith(result);
        });
      } catch (error) {
        blocks.forEach(function (block) { block.closest(".code")?.classList.add("code--fallback"); });
      }
    }

    function initPresentation() {
      setupNavigation();
      setupCopyButtons();
      setupTabs();
      setupCaseDemo();
      enhanceDiagrams();
      enhanceCode();
    }

    initPresentation();

