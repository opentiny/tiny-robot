/**
 * Shadow DOM 调试工具
 * 在浏览器控制台中执行此脚本来检查组件状态
 */

// 添加到全局对象方便使用
window.ShadowDOMDebugger = {
  
  /**
   * 检查 Shadow DOM 环境
   */
  checkShadowDOM() {
    console.log('🔍 检查 Shadow DOM 环境...\n');
    
    const senderShadow = document.querySelector('sender-shadow');
    if (!senderShadow) {
      console.error('❌ 未找到 sender-shadow 元素');
      return;
    }
    
    const shadowRoot = senderShadow.shadowRoot;
    if (!shadowRoot) {
      console.error('❌ 未找到 Shadow Root');
      return;
    }
    
    console.log('✅ Shadow DOM 元素存在');
    console.log('Shadow Root:', shadowRoot);
    
    return shadowRoot;
  },
  
  /**
   * 检查样式注入
   */
  checkStyleInjection() {
    console.log('\n🎨 检查样式注入...\n');
    
    const shadowRoot = this.checkShadowDOM();
    if (!shadowRoot) return;
    
    // 检查样式元素
    const injectedStyles = [
      '#template-field-styles',
      '#tr-sender-shadow-styles'
    ];
    
    injectedStyles.forEach(styleId => {
      const styleElement = shadowRoot.querySelector(styleId);
      if (styleElement) {
        console.log(`✅ 样式 ${styleId} 已注入`);
        console.log('样式内容长度:', styleElement.textContent.length);
      } else {
        console.warn(`⚠️ 样式 ${styleId} 未找到`);
      }
    });
  },
  
  /**
   * 检查模板字段
   */
  checkTemplateFields() {
    console.log('\n🏷️ 检查模板字段...\n');
    
    const shadowRoot = this.checkShadowDOM();
    if (!shadowRoot) return;
    
    const templateFields = shadowRoot.querySelectorAll('.template-field');
    console.log(`模板字段数量: ${templateFields.length}`);
    
    templateFields.forEach((field, index) => {
      const info = {
        index: index + 1,
        text: field.textContent,
        placeholder: field.getAttribute('data-placeholder'),
        hasBackground: !!field.style.backgroundColor,
        backgroundColor: field.style.backgroundColor,
        hasInlineStyles: field.style.cssText.length > 0,
        classNames: field.className,
        boundingRect: field.getBoundingClientRect()
      };
      
      console.log(`字段 ${index + 1}:`, info);
      
      // 检查样式应用
      const computedStyle = window.getComputedStyle(field);
      console.log(`字段 ${index + 1} 计算样式:`, {
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        padding: computedStyle.padding,
        margin: computedStyle.margin,
        borderRadius: computedStyle.borderRadius
      });
    });
    
    return templateFields;
  },
  
  /**
   * 检查环境识别
   */
  checkEnvironmentDetection() {
    console.log('\n🔧 检查环境识别...\n');
    
    const shadowRoot = this.checkShadowDOM();
    if (!shadowRoot) return;
    
    // 模拟环境检测逻辑
    const templateEditor = shadowRoot.querySelector('.template-editor');
    if (templateEditor) {
      console.log('✅ 找到模板编辑器');
      
      // 检查是否在 Shadow DOM 中
      let node = templateEditor;
      let foundShadowRoot = false;
      
      while (node) {
        if (node instanceof ShadowRoot) {
          foundShadowRoot = true;
          break;
        }
        node = node.parentNode || node.host;
      }
      
      console.log(`环境检测结果: ${foundShadowRoot ? 'Shadow DOM' : '普通 DOM'}`);
    } else {
      console.warn('⚠️ 未找到模板编辑器');
    }
  },
  
  /**
   * 对比两个组件
   */
  compareComponents() {
    console.log('\n⚖️ 对比组件...\n');
    
    // 检查正常组件
    const normalComponent = document.querySelector('.test-section:first-child .template-field');
    console.log('正常组件模板字段:', normalComponent ? '存在' : '不存在');
    
    if (normalComponent) {
      const normalStyle = window.getComputedStyle(normalComponent);
      console.log('正常组件样式:', {
        backgroundColor: normalStyle.backgroundColor,
        color: normalStyle.color,
        padding: normalStyle.padding
      });
    }
    
    // 检查 Shadow DOM 组件
    const shadowFields = this.checkTemplateFields();
    if (shadowFields.length > 0) {
      console.log('\n样式对比:');
      console.log('- 检查两个组件的模板字段是否具有相同的视觉效果');
      console.log('- 背景颜色应为: rgba(20, 118, 255, 0.1)');
      console.log('- 文字颜色应为: #1476FF');
    }
  },
  
  /**
   * 运行完整检查
   */
  runFullCheck() {
    console.clear();
    console.log('🚀 开始 Shadow DOM 完整检查...');
    console.log('='.repeat(50));
    
    this.checkShadowDOM();
    this.checkStyleInjection();
    this.checkTemplateFields();
    this.checkEnvironmentDetection();
    this.compareComponents();
    
    console.log('\n' + '='.repeat(50));
    console.log('✨ 检查完成！');
    console.log('\n💡 提示: 使用 ShadowDOMDebugger.方法名() 单独运行特定检查');
  },
  
  /**
   * 实时监控模板字段变化
   */
  watchTemplateFields() {
    const shadowRoot = this.checkShadowDOM();
    if (!shadowRoot) return;
    
    console.log('👀 开始监控模板字段变化...');
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          const target = mutation.target;
          if (target.classList && target.classList.contains('template-field')) {
            console.log('🔄 模板字段发生变化:', {
              type: mutation.type,
              target: target,
              textContent: target.textContent,
              style: target.style.cssText
            });
          }
        }
      });
    });
    
    observer.observe(shadowRoot, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'data-placeholder']
    });
    
    console.log('监控已启动，在控制台中执行 observer.disconnect() 停止监控');
    return observer;
  }
};

// 自动运行初始检查
console.log('🔧 Shadow DOM 调试工具已加载');
console.log('💡 使用 ShadowDOMDebugger.runFullCheck() 运行完整检查');
console.log('💡 使用 ShadowDOMDebugger.watchTemplateFields() 监控字段变化'); 