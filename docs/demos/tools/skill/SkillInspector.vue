<template>
  <div class="skill-inspector">
    <section class="panel import-panel">
      <div class="panel-heading">
        <div>
          <h3>导入与管理</h3>
          <p>从示例或本地目录导入 skill，再用 manager 选择本次要编译的 skill。</p>
        </div>
        <button type="button" class="primary-action" @click="loadExampleSkill">导入示例 skill</button>
      </div>

      <label class="directory-picker">
        <input type="file" webkitdirectory directory multiple @change="handleDirectoryChange" />
        <span>选择本地 skill 目录</span>
      </label>

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
          <input
            type="checkbox"
            :checked="selectedSkillNames.includes(skill.name)"
            @click.stop
            @change="toggleSkillFromEvent(skill.name, $event)"
          />
          <span>
            <strong>{{ skill.name }}</strong>
            <small>{{ skill.description }}</small>
          </span>
        </div>
      </div>
    </section>

    <div class="output-stack">
      <section class="panel right-panel">
        <div class="right-tab-header">
          <button type="button" :class="{ active: rightTab === 'skill' }" @click="rightTab = 'skill'">
            当前 Skill
          </button>
          <button type="button" :class="{ active: rightTab === 'compiler' }" @click="rightTab = 'compiler'">
            Compiler 输出
          </button>
        </div>

        <div v-if="rightTab === 'skill'" class="right-tab-content">
          <div class="summary-grid">
            <div>
              <span>Name</span>
              <strong>{{ inspectedSkill?.name || '-' }}</strong>
            </div>
            <div>
              <span>Files</span>
              <strong>{{ inspectedSkill?.files?.length ?? 0 }}</strong>
            </div>
          </div>

          <pre>{{ inspectedDefinitionJson }}</pre>
        </div>

        <div v-else class="right-tab-content">
          <div class="selected-skills">
            <span>Selected skills</span>
            <div>
              <strong v-for="skillName in selectedSkillNames" :key="skillName">{{ skillName }}</strong>
              <em v-if="selectedSkillNames.length === 0">None</em>
            </div>
          </div>

          <div class="tabs">
            <button
              v-for="tab in compilerTabs"
              :key="tab.value"
              type="button"
              :class="{ active: compilerTab === tab.value }"
              @click="compilerTab = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>

          <pre v-if="compilerTab === 'instructions'">{{ compiledInstructionsText }}</pre>
          <pre v-else>{{ compiledToolsJson }}</pre>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import './SkillInspector.css'
import { useSkillInspector } from './useSkillInspector'

const {
  compilerTab,
  compilerTabs,
  compiledInstructionsText,
  compiledToolsJson,
  errorMessage,
  handleDirectoryChange,
  inspectSkill,
  inspectedDefinitionJson,
  inspectedSkill,
  inspectedSkillName,
  loadExampleSkill,
  rightTab,
  selectedSkillNames,
  skills,
  toggleSkillFromEvent,
} = useSkillInspector()
</script>
