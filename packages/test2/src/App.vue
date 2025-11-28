<script setup lang="ts"></script>

<template>
  <div>
    <header>
      <nav>
        <router-link to="/bubble">Bubble</router-link>
        <router-link to="/list">List</router-link>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
header {
  padding: 16px;
  border-bottom: 1px solid #ddd;
}

nav {
  display: flex;
  gap: 16px;
}

nav a {
  text-decoration: none;
  color: #333;
  padding: 4px 8px;
}

nav a.router-link-active {
  color: #42b983;
  font-weight: bold;
}

main {
  padding: 16px;
}
</style>
