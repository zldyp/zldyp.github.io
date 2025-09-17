// 主题检测与应用函数
function applyTheme() {
  const tocContainer = document.querySelector('.toc-container');
  const tocToggle = document.querySelector('.toc-toggle');
  const htmlElement = document.documentElement;
  const themeClasses = ['latte', 'light', 'rust', 'coal', 'navy', 'ayu'];
  // 检测当前主题（通过 html 元素的 class 判断）
  const themeClass = Array.from(htmlElement.classList).find(cls =>
    themeClasses.includes(cls)
  );

  if (!themeClass) return;

  // 移除之前的主题类，添加新的主题类
  themeClasses.forEach(cls => {
    tocContainer.classList.remove(`${cls}-theme`);
    tocToggle.classList.remove(`${cls}-theme`);
  });
  tocContainer.classList.add(`${themeClass}-theme`);
  tocToggle.classList.add(`${themeClass}-theme`);
}

// 创建大纲容器
function createTocContainer() {
  // 创建大纲容器
  const tocContainer = document.createElement('div');
  tocContainer.className = 'toc-container';
  tocContainer.innerHTML = '<h3>章节目录</h3><ul class="toc-list"></ul>';

  // 创建移动端切换按钮
  const tocToggle = document.createElement('button');
  tocToggle.className = 'toc-toggle';
  tocToggle.innerHTML = '≡';
  tocToggle.addEventListener('click', () => {
    tocContainer.classList.toggle('active');
  });

  // 插入到页面
  const content = document.querySelector('.content');
  content.parentNode.insertBefore(tocContainer, content);
  document.body.appendChild(tocToggle);

  // 初始应用主题
  applyTheme();

  return { tocContainer, tocToggle };
}

// 初始化折叠按钮功能（控制大纲显示/隐藏）
function initTocToggle() {
  const tocToggle = document.querySelector('.toc-toggle'); // 折叠按钮
  const tocContainer = document.querySelector('.toc-container'); // 大纲容器
  if (!tocToggle || !tocContainer) return;

  // 点击按钮切换大纲显示状态
  tocToggle.addEventListener('click', () => {
    tocContainer.classList.toggle('hidden');
    // 切换按钮图标（可选：展开→收起，收起→展开）
    tocToggle.textContent = tocContainer.classList.contains('hidden') ? '≡' : '×';
  });
}

// 生成大纲内容
function generateToc(tocContainer) {
  const content = document.querySelector('.content');
  const headings = content.querySelectorAll('h2, h3, h4, h5, h6');
  const tocList = tocContainer.querySelector('.toc-list');

  headings.forEach(heading => {
    if (!heading.id) return;
    // 从标签名（如 "H3"）中提取数字 3
    const level = parseInt(heading.tagName.replace('H', ''), 10);
    // 根据级别设置缩进（例如每级缩进 20px）
    const item = document.createElement('li');
    item.innerHTML = `<a href="#${heading.id}" class="level-${level}">${heading.textContent}</a>`;
    tocList.appendChild(item);
  });
}

// 滚动监听与当前位置高亮
function setupScrollListener() {
  const tocLinks = document.querySelectorAll('.toc-list a');
  const headings = document.querySelectorAll('.content h2, .content h3, .content h4, .content h5, .content h6');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY; // 当前滚动距离
    const viewportHeight = window.innerHeight; // 视口高度
    let currentId = '';

    headings.forEach(heading => {
      const headingTop = heading.offsetTop; // 标题顶部距离页面顶部的距离
      const headingBottom = headingTop + heading.offsetHeight; // 标题底部距离
      // 判定条件：标题顶部进入视口，或标题底部在视口内
      if (
        (headingTop <= scrollY + viewportHeight - 100) && // 标题顶部在视口下方100px内（提前高亮）
        headingBottom > scrollY // 标题底部在滚动位置上方
      ) {
        currentId = heading.id;
      }
    });

    tocLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });
}

function initTocHighlight() {
  const tocLinks = document.querySelectorAll('.toc-list a, .toc-sub-list a'); // 所有大纲链接
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6'); // 所有页面标题
  if (!tocLinks.length || !headings.length) return;

  /**
   * 4.1 核心高亮函数
   */
  function highlightCurrentSection() {
    let currentHeadingId = ''; // 当前需要高亮的标题ID

    // 逻辑1：优先检测带::before激活样式的标题（如»标志）
    const targetHeading = getHeadingWithBeforeStyle();
    if (targetHeading) {
      currentHeadingId = targetHeading.id;
    }
    // 逻辑2：未检测到激活标题，回退到滚动位置匹配
    else {
      currentHeadingId = getHeadingByScrollPosition();
    }

    // 执行高亮：移除所有链接的active类，给匹配的链接添加
    tocLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentHeadingId}` && currentHeadingId) {
        link.classList.add('active');
      }
    });
  }

  /**
   * 4.2 辅助函数：检测带目标::before样式的标题
   * @returns {HTMLElement|null} 匹配的标题元素
   */
  function getHeadingWithBeforeStyle() {
    for (const heading of headings) {
      const beforeStyle = window.getComputedStyle(heading, '::before');
      // 匹配::before核心特征（需与实际CSS一致，示例：content为»，边距-30px）
      if (
        beforeStyle.content === '"»"' &&
        isElementInViewport(heading)
      ) {
        return heading;
      }
    }
    return null;
  }

  // 检测元素是否在视窗内
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * 4.3 辅助函数：根据滚动位置匹配当前可视标题
   * @returns {string} 匹配标题的ID
   */
  function getHeadingByScrollPosition() {
    const scrollY = window.scrollY; // 当前滚动距离
    const viewportHeight = window.innerHeight; // 视口高度
    let currentId = '';

    // 从下往上遍历，确保匹配最顶部的可视标题
    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i];
      const headingTop = heading.offsetTop; // 标题顶部距离页面顶部的距离
      const headingBottom = headingTop + heading.offsetHeight; // 标题底部距离

      // 判定条件：标题顶部进入视口，或标题底部在视口内
      if (
        (headingTop <= scrollY + viewportHeight - 100) && // 标题顶部在视口下方100px内（提前高亮）
        headingBottom > scrollY // 标题底部在滚动位置上方
      ) {
        currentId = heading.id;
        break; // 找到最底部的匹配标题，跳出循环
      }
    }

    return currentId;
  }

  // 4.4 绑定事件：初始化+滚动+哈希变化+点击
  highlightCurrentSection(); // 页面加载时初始化高亮
  window.addEventListener('scroll', highlightCurrentSection); // 滚动时更新
  window.addEventListener('hashchange', highlightCurrentSection); // URL锚点变化时更新
  tocLinks.forEach(link => {
    link.addEventListener('click', highlightCurrentSection); // 点击大纲链接时更新
  });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  const { tocContainer } = createTocContainer();
  generateToc(tocContainer);
  initTocHighlight();
  initTocToggle();

  // 监听主题切换事件（通过观察 html 元素的 class 变化）
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        applyTheme();
      }
    }
  });
  const htmlElement = document.querySelector('html');
  observer.observe(htmlElement, { attributes: true });
});


