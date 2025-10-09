<script setup lang="ts">
// Define props interface for version data
interface Props {
  tinyRobotVersions: string[]
  vueVersions: string[]
}

// Define props with default values
withDefaults(defineProps<Props>(), {
  tinyRobotVersions: () => ['0.3.0-rc.5'],
  vueVersions: () => ['latest'],
})

const tinyRobotVersion = defineModel<string>('tinyRobotVersion', { required: true })
const vueVersion = defineModel<string | null>('vueVersion', { required: true })
</script>

<template>
  <header class="playground-header">
    <div class="header-content">
      <div class="playground-info">
        <img class="playground-logo" src="/logo.svg" />
        <div class="playground-title">TinyRobot Playground</div>
      </div>
      <div class="version-selectors">
        <div class="version-selector">
          <label for="tiny-robot-version" class="version-label">TinyRobot Version:</label>
          <select id="tiny-robot-version" v-model="tinyRobotVersion" class="version-select">
            <option v-for="version in tinyRobotVersions" :key="version" :value="version">
              {{ version }}
            </option>
          </select>
        </div>
        <div class="version-selector">
          <label for="vue-version" class="version-label">Vue Version:</label>
          <select id="vue-version" v-model="vueVersion" class="version-select">
            <option v-for="version in vueVersions" :key="version" :value="version">
              {{ version }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.playground-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 0.75rem 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.playground-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.playground-logo {
  height: 32px;
  width: 32px;
}

.playground-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.version-selectors {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.version-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.version-label {
  font-weight: 500;
  color: #495057;
  font-size: 0.875rem;
}

.version-select {
  padding: 0.375rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  background-color: white;
  font-size: 0.875rem;
  color: #495057;
  cursor: pointer;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.version-select:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.version-select:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}
</style>
