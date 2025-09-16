// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
  // 检查是否已有toc，避免重复生成
  if (document.querySelector('.floating-toc')) return;
  
  // 创建大纲容器
  const tocContainer = document.createElement('div');
  tocContainer.className = 'floating-toc';
  
  // 创建标题和列表容器
  tocContainer.innerHTML = `
    <div class="toc-header">
      <h3>章节导航</h3>
      <button class="toc-toggle">≡</button>
    </div>
    <div class="toc-content">
      <ul class="toc-list"></ul>
    </div>
  `;
  
  // 将大纲添加到页面
  document.body.appendChild(tocContainer);
  
  // 获取内容区域和所有标题
  const content = document.querySelector('.content');
  const headings = content.querySelectorAll('h2, h3, h4, h5, h6');
  const tocList = tocContainer.querySelector('.toc-list');
  
  // 如果没有标题，隐藏大纲
  if (headings.length === 0) {
    tocContainer.style.display = 'none';
    return;
  }
  
  // 生成大纲项
  headings.forEach(heading => {
    // 跳过无ID的标题（mdbook会自动为标题生成ID）
    if (!heading.id) return;
    
    const item = document.createElement('li');
    item.className = `toc-item level-${heading.tagName[1]}`;
    
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    link.title = heading.textContent;
    
    item.appendChild(link);
    tocList.appendChild(item);
    
    // 点击导航项后可以在移动设备上自动收起菜单
    link.addEventListener('click', () => {
      if (window.innerWidth < 768) {
        tocContainer.classList.remove('expanded');
      }
    });
  });
  
  // 处理大纲折叠/展开按钮
  const tocToggle = tocContainer.querySelector('.toc-toggle');
  tocToggle.addEventListener('click', () => {
    tocContainer.classList.toggle('expanded');
  });
  
  // 监听滚动，高亮当前可见的标题
  window.addEventListener('scroll', highlightActiveHeading);
  
  // 初始高亮
  highlightActiveHeading();
  
  // 高亮当前可见的标题函数
  function highlightActiveHeading() {
    let activeHeading = null;
    let minDistance = Infinity;
    
    headings.forEach(heading => {
      const rect = heading.getBoundingClientRect();
      const distance = Math.abs(rect.top);
      
      // 标题顶部在视口上方或内部，且距离最近
      if (rect.top <= 100 && distance < minDistance) {
        minDistance = distance;
        activeHeading = heading;
      }
    });
    
    // 移除所有高亮
    document.querySelectorAll('.toc-item a').forEach(link => {
      link.classList.remove('active');
    });
    
    // 添加当前高亮
    if (activeHeading && activeHeading.id) {
      const activeLink = tocList.querySelector(`a[href="#${activeHeading.id}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
        // 滚动到当前激活的链接，使其在可见区域
        activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }
  
  // 响应式处理
  function handleResize() {
    if (window.innerWidth >= 768) {
      tocContainer.classList.add('expanded');
    } else {
      tocContainer.classList.remove('expanded');
    }
  }
  
  // 初始调整和窗口大小变化时调整
  handleResize();
  window.addEventListener('resize', handleResize);
});
