<script lang="ts" setup>
import { computed } from 'vue'
import tip1 from '@/assets/images/tip1.png'
import tip2 from '@/assets/images/tip2.png'
import tip3 from '@/assets/images/tip3.png'
import tip4 from '@/assets/images/tip4.png'

const props = defineProps<{ tasks: { status: string, value: number }[] }>()

const statusMeta: Record<string, { class: string, text: string, img: string }> = {
  A: { class: 'plan-pass', text: 'userInfo.status.optionA', img: tip1 },
  B: { class: 'plan-overdue', text: 'userInfo.status.optionB', img: tip2 },
  C: { class: 'plan-limit', text: 'userInfo.status.optionC', img: tip3 },
  D: { class: 'plan-fail', text: 'userInfo.status.optionD', img: tip4 },
}

const InfoNum = computed(() =>
  ['A', 'B', 'C', 'D'].map(status => ({
    value: props.tasks.find(item => item.status === status)?.value ?? 0,
    class: statusMeta[status].class,
    text: statusMeta[status].text,
    img: statusMeta[status].img,
  })),
)
</script>

<template>
  <div class="card flex flex-wrap">
    <transition-fade-down-group>
      <div v-for="(item, index) in InfoNum" :key="index" class="col w-[20%] flex max-sm:w-[40%]">
        <img :src="item.img">
        <span>{{ $t(item.text) }}/{{ item.value }}</span>
      </div>
    </transition-fade-down-group>
  </div>
</template>

<style scoped lang="less">
.card {
  justify-content: flex-start;
  padding: 24px 0;
  text-align: center;

  .col {
    align-items: center;
    justify-content: center;
    height: 36px;
    margin-right: 20px;
    border-radius: 18px;

    span {
      overflow: hidden;
      font-size: 14px;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    img {
      width: 14px;
      height: 14px;
      margin-right: 5px;
    }
  }
}

.card div:first-child {
  background: rgba(123, 208, 108, 0.1);
}

.card div:nth-child(2) {
  background: rgba(47, 91, 234, 0.1);
}

.card div:nth-child(3) {
  background: rgba(227, 83, 73, 0.1);
}

.card div:last-child {
  background: rgba(250, 173, 20, 0.1);
}
</style>
