<template>
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
      <div class="container-fluid">
        <router-link class="navbar-brand" :to="{name: 'home'}">舆情指标演化可视化平台</router-link>
        
        <div class="collapse navbar-collapse" id="navbarText">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <!-- <li class="nav-item">
              <router-link class="nav-link" :to="{name: 'overall'}">总览</router-link>
              </li>
              <li class="nav-item">
              <router-link class="nav-link" :to="{name: 'ac'}"><b>按楼号-楼层划分</b>空调机房电表数据</router-link>
              </li>
              <li class="nav-item">
              <router-link class="nav-link" :to="{name: 'fan'}"><b>按楼号-楼层划分</b>送风温度</router-link>
              </li> -->
        </ul>
      </div>
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
    
    <style scoped></style>