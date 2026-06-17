<template>
  <div class="skill-inspector">
    <section class="panel storage-panel">
      <div class="panel-heading">
        <div>
          <h3>Storage 管理</h3>
          <p>演示 add、get、list、delete，以及从本地目录导入后写入 storage。</p>
        </div>
        <button type="button" class="primary-action" @click="resetExampleSkills">重置示例</button>
      </div>

      <div class="action-row">
        <label class="directory-picker">
          <input type="file" webkitdirectory directory multiple @change="importDirectory" />
          <span>导入本地 skill 目录</span>
        </label>
        <button type="button" class="danger-action" :disabled="!inspectedSkill" @click="deleteInspectedSkill">
          删除当前
        </button>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <div class="skill-list">
        <div
          v-for="skill in skills"
          :key="skill.name"
          class="skill-item"
          :class="{ active: inspectedSkillName === skill.name }"
          role="button"
          tabindex="0"
          @click="inspectSkill(skill.name)"
          @keydown.enter.prevent="inspectSkill(skill.name)"
          @keydown.space.prevent="inspectSkill(skill.name)"
        >
          <span>
            <strong>{{ skill.name }}</strong>
            <small>{{ skill.description }}</small>
          </span>
          <em>{{ skill.resources?.length ?? 0 }} files</em>
        </div>
      </div>
    </section>

    <section class="panel detail-panel">
      <div class="storage-viewer">
        <section class="file-tree">
          <h4>目录结构</h4>
          <div class="file-node-list">
            <button
              v-for="node in fileNodes"
              :key="node.path"
              type="button"
              class="file-node"
              :class="{ active: selectedFilePath === node.path, folder: node.kind === 'folder' }"
              :style="{ paddingLeft: `${10 + node.depth * 14}px` }"
              @click="node.kind !== 'folder' && selectFile(node.path)"
            >
              <span>{{ node.label }}</span>
              <em>{{ node.kind }}</em>
            </button>
          </div>
        </section>

        <section class="resource-text">
          <h4>{{ selectedFilePath || '资源内容' }}</h4>
          <pre>{{ selectedFileText }}</pre>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import './SkillInspector.css'
import { useSkillInspector } from './useSkillInspector'

const {
  deleteInspectedSkill,
  errorMessage,
  fileNodes,
  importDirectory,
  inspectSkill,
  inspectedSkill,
  inspectedSkillName,
  resetExampleSkills,
  selectFile,
  selectedFilePath,
  selectedFileText,
  skills,
} = useSkillInspector()
</script>
