class PathParser {
  /**
   * 解析URL路径，提取路径片段和查询参数
   * @param {string} path - 可选，要解析的路径，默认使用当前页面URL
   * @returns {Object} 解析结果
   */
  static parse(path) {
    // 默认使用当前页面的路径
    const currentPath = path || window.location.pathname + window.location.search;
    
    // 分离路径和查询参数
    const [pathname, queryString] = currentPath.split('?');
    
    // 解析路径片段（去除空字符串）
    const segments = pathname.split('/').filter(segment => segment);
    
    // 解析查询参数
    const queryParams = {};
    if (queryString) {
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=');
        if (key) {
          queryParams[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
        }
      });
    }
    
    return {
      pathname,
      segments,
      queryParams,
      fullPath: currentPath
    };
  }
  
  /**
   * 匹配路由规则并提取参数
   * @param {string} route - 路由规则，如 '/user/:id/posts/:postId'
   * @param {string} path - 要匹配的路径，默认使用当前路径
   * @returns {Object|null} 匹配结果，包含params和isExact（是否完全匹配）
   */
  static match(route, path) {
    const parsedPath = this.parse(path);
    const routeSegments = route.split('/').filter(segment => segment);
    const pathSegments = parsedPath.segments;
    
    // 路由段数量不匹配，直接返回null
    if (routeSegments.length !== pathSegments.length) {
      return null;
    }
    
    const params = {};
    
    // 逐个匹配路由段
    for (let i = 0; i < routeSegments.length; i++) {
      const routeSegment = routeSegments[i];
      const pathSegment = pathSegments[i];
      
      // 匹配参数段（如:id）
      if (routeSegment.startsWith(':')) {
        const paramName = routeSegment.slice(1);
        params[paramName] = decodeURIComponent(pathSegment);
      } 
      // 静态段必须完全匹配
      else if (routeSegment !== pathSegment) {
        return null;
      }
    }
    
    return {
      params,
      isExact: parsedPath.pathname === route,
      path: parsedPath.pathname,
      queryParams: parsedPath.queryParams
    };
  }
  
  /**
   * 根据路由规则和参数生成路径
   * @param {string} route - 路由规则，如 '/user/:id'
   * @param {Object} params - 路径参数
   * @param {Object} queryParams - 查询参数
   * @returns {string} 生成的路径
   */
  static generate(route, params = {}, queryParams = {}) {
    let path = route;
    
    // 替换路径参数
    Object.entries(params).forEach(([key, value]) => {
      const placeholder = `:${key}`;
      if (path.includes(placeholder)) {
        path = path.replace(placeholder, encodeURIComponent(value));
      }
    });
    
    // 检查是否有未替换的参数
    if (path.includes(':')) {
      console.warn(`路径生成警告: 存在未替换的参数 ${path}`);
    }
    
    // 添加查询参数
    const queryItems = Object.entries(queryParams)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      
    if (queryItems.length > 0) {
      path += `?${queryItems.join('&')}`;
    }
    
    return path;
  }
  
  /**
   * 监听路径变化
   * @param {Function} callback - 路径变化时的回调函数
   * @returns {Function} 取消监听的函数
   */
  static listen(callback) {
    // 初始触发一次
    const handleChange = () => {
      callback(this.parse());
    };
    
    // 监听popstate事件（前进/后退按钮）
    window.addEventListener('popstate', handleChange);
    
    // 重写pushState和replaceState方法以监听手动导航
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleChange();
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      handleChange();
    };
    
    // 返回取消监听的函数
    return () => {
      window.removeEventListener('popstate', handleChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }
  
  /**
   * 导航到指定路径
   * @param {string} path - 目标路径
   * @param {boolean} replace - 是否替换当前历史记录
   */
  static navigate(path, replace = false) {
    if (replace) {
      history.replaceState(null, '', path);
    } else {
      history.pushState(null, '', path);
    }
    // 手动触发一次popstate事件以通知监听器
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

(function() {
  /**
   * 
   * @param {*} urlOjb 
   */
  function loadMarkdown(urlObj) {
    let markdownUrl = '';
    const pathname = urlObj.pathname;
    if (!pathname || pathname === '/') {
      markdownUrl = 'README.md';
    } else if (pathname.startsWith('/list/')) {
      const result = PathParser.match('/list/:channel')
      if (result) {
        markdownUrl = '/list/' + result.params.channel + '.md';
      }      
    }
    if (!markdownUrl) {
    	return false;
    }
    fetch(markdownUrl)
      .then(response => response.text())  // 获取响应并将其转化为文本
      .then(data => {
        document.getElementById('content').innerHTML = marked.parse(data);  // 使用 marked.js 解析 markdown 内容
      })
      .catch(error => {
        console.error('Error loading the markdown file:', error);
      });
    return true;
  }
  const urlOjb = PathParser.parse();
  loadMarkdown(urlOjb);   

  document.addEventListener('click', (event) => {
    const path = event.target.getAttribute('href')
    if (event.target.tagName === 'A' && path?.startsWith('/list/')) {
      event.preventDefault();
      PathParser.navigate(path);
    }
  });
  // 监听路径变化
  PathParser.listen(parsedPath => {
    console.log('路径变化:', parsedPath);
    loadMarkdown(parsedPath);
  });
})();
