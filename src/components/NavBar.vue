<template>
  <nav class="navbar navbar-expand-lg navbar-light custom-navbar">
    <div class="container-fluid">
      <!-- Logo 和标题 -->
      <router-link class="navbar-brand custom-brand" :to="{ name: 'home' }">
        舆情指标演化可视化平台
      </router-link>

      <!-- 折叠按钮 -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarText"
        aria-controls="navbarText"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      
    </div>
  </nav>
</template>
    
<script>
    
export default {
    name: "NavBar",
    setup() {

    }
}
</script>
    
<style scoped>
/* 导航栏整体样式 */
.custom-navbar {
  background: linear-gradient(45deg, #4a90e2, #9013fe); /* 渐变背景色 */
  padding: 10px 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 添加阴影 */
}

/* 导航标题样式 */
.custom-brand {
  font-size: 1.5rem; /* 标题大小 */
  font-weight: bold; /* 加粗 */
  color: white; /* 标题颜色 */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3); /* 添加文字阴影 */
  text-decoration: none; /* 去掉下划线 */
}

/* 折叠按钮样式 */
.navbar-toggler {
  border-color: white; /* 边框颜色 */
}

.navbar-toggler-icon {
  background-image: url("data:image/svg+xml;charset=UTF8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%288, 8, 8, 0.6%29' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
}

/* 导航链接样式 */
.custom-link {
  font-size: 1rem;
  font-weight: 500;
  color: white;
  margin: 0 10px; /* 添加左右间距 */
  transition: color 0.3s ease; /* 平滑过渡效果 */
}

.custom-link:hover {
  color: #ffe600; /* 悬停时变为金黄色 */
  text-decoration: underline; /* 悬停时添加下划线 */
}

/* 响应式调整 */
@media (max-width: 768px) {
  .custom-brand {
    font-size: 1.25rem; /* 小屏标题缩小 */
  }

  .custom-link {
    font-size: 0.9rem; /* 小屏链接字体缩小 */
  }
}
</style>