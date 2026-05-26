<script setup lang="ts">
const messages = [
  {
    role: 'user',
    content: '帮我总结一下今天的会议纪要。',
  },
  {
    role: 'assistant',
    content: '好的，我可以帮你整理会议重点、待办事项和后续跟进人。',
  },
]
</script>

<template>
  <main class="demo-page">
    <section class="demo-shell" aria-label="普通 Demo 聊天框">
      <div class="demo-header">
        <div>
          <p class="demo-kicker">Demo 阶段</p>
          <h1>普通聊天框</h1>
        </div>
        <span class="demo-badge">能对话</span>
      </div>

      <div class="chat-card">
        <div class="chat-topbar">
          <span class="status-dot"></span>
          <span>AI Assistant</span>
        </div>

        <div class="message-list">
          <article
            v-for="message in messages"
            :key="message.content"
            class="message-row"
            :class="`message-row--${message.role}`"
          >
            <div class="avatar">{{ message.role === 'user' ? 'U' : 'AI' }}</div>
            <p class="message-bubble">{{ message.content }}</p>
          </article>
        </div>

        <form class="composer">
          <input value="继续补充一下行动项" aria-label="输入问题" />
          <button type="button">发送</button>
        </form>
      </div>

      <p class="demo-note">基础消息展示 + 输入发送，适合快速验证想法。</p>
    </section>
  </main>
</template>

<style scoped>
.demo-page {
  position: fixed;
  inset: 0;
  display: grid;
  overflow: auto;
  place-items: center;
  padding: 48px 24px;
  background: linear-gradient(135deg, rgba(236, 241, 247, 0.92), rgba(249, 250, 251, 0.96)), #f6f8fb;
  color: #111827;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

.demo-shell {
  width: min(440px, 100%);
}

.demo-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 20px;
}

.demo-kicker {
  margin: 0 0 8px;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}

.demo-header h1 {
  margin: 0;
  color: #0f172a;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.15;
}

.demo-badge {
  flex: 0 0 auto;
  border: 1px solid #d8dee8;
  border-radius: 999px;
  padding: 7px 12px;
  background: #fff;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
}

.chat-card {
  overflow: hidden;
  border: 1px solid #dce3ec;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 22px 55px rgba(15, 23, 42, 0.12);
}

.chat-topbar {
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #e5eaf1;
  padding: 14px 18px;
  color: #475569;
  font-size: 14px;
  font-weight: 600;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
}

.message-list {
  display: flex;
  min-height: 300px;
  flex-direction: column;
  gap: 18px;
  padding: 22px 18px;
}

.message-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.message-row--user {
  flex-direction: row-reverse;
}

.avatar {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  background: #e2e8f0;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
}

.message-row--assistant .avatar {
  background: #dbeafe;
  color: #1d4ed8;
}

.message-bubble {
  max-width: 72%;
  margin: 0;
  border-radius: 14px;
  padding: 11px 13px;
  background: #f1f5f9;
  color: #1e293b;
  font-size: 14px;
  line-height: 1.6;
}

.message-row--user .message-bubble {
  background: #2563eb;
  color: #fff;
}

.composer {
  display: flex;
  gap: 10px;
  border-top: 1px solid #e5eaf1;
  padding: 14px;
  background: #f8fafc;
}

.composer input {
  min-width: 0;
  flex: 1;
  border: 1px solid #d8dee8;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fff;
  color: #334155;
  outline: none;
}

.composer button {
  border: 0;
  border-radius: 10px;
  padding: 0 16px;
  background: #2563eb;
  color: #fff;
  font-weight: 700;
}

.demo-note {
  margin: 16px 0 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
  text-align: center;
}
</style>
