<script lang="ts" setup>
import {
  Loading,
  Col as TinyCol,
  Layout as TinyLayout,
  Option as TinyOption,
  Row as TinyRow,
  Select as TinySelect,
} from '@opentiny/vue'
import { onMounted, reactive, ref, watch } from 'vue'
import { getUserChange, getUserPractic } from '@/api/board'

// 加载效果
const state = reactive<{
  loading: any
  options: any
  project: string
}>({
  loading: null,
  options: [] as any,
  project: '',
})

// 请求数据接口方法
async function fetchData() {
  state.loading = Loading.service({
    text: 'loading...',
    target: document.getElementById('container'),
  })
  try {
    const { data } = await getUserPractic()
    state.options = data.options
  }
  finally {
    state.loading.close()
  }
}

// 初始化请求数据
onMounted(() => {
  fetchData()
})

// 切换数据
const number = ref([])
async function fetchSelect(param: string) {
  const { data } = await getUserChange(param)
  number.value = data
}

// 切换数据
watch(
  state,
  (newValue) => {
    fetchSelect(newValue.project)
  },
  { immediate: true },
)
</script>

<template>
  <div>
    <div class="practiced-select">
      <h3>{{ $t('work.index.practiced') }}</h3>
      <TinySelect
        v-model="state.project"
        :placeholder="$t('baseForm.form.label.placeholder')"
        filterable
      >
        <TinyOption
          v-for="item in state.options"
          :key="item.value"
          :label="$t(item.label)"
          :value="item.value"
        />
      </TinySelect>
    </div>
    <TinyLayout>
      <TinyRow :flex="true" justify="center" class="margin-bottom">
        <TinyCol :span="3">
          <div class="col">
            <div>
              <span class="font-pass">{{ number[0] }}</span>
              <span>&nbsp;/ {{ $t('work.index.Person') }}</span>
            </div>
            <span>{{ $t('work.index.allocated') }}</span>
          </div>
        </TinyCol>
        <div class="divider" />
        <TinyCol :span="3">
          <div class="col">
            <div>
              <span class="font-pass">{{ number[1] }}</span>
              <span>&nbsp;/ {{ $t('work.index.Person') }}</span>
            </div>
            <span>{{ $t('work.index.start') }}</span>
          </div>
        </TinyCol>
        <div class="divider" />
        <TinyCol :span="3">
          <div class="col">
            <div>
              <span class="font-pass">{{ number[2] }}</span>
              <span>&nbsp;/ {{ $t('work.index.Person') }}</span>
            </div>
            <span>{{ $t('work.index.practice') }}</span>
          </div>
        </TinyCol>
      </TinyRow>
    </TinyLayout>
  </div>
</template>

<style scoped lang="less">
.margin-bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 98.5%;
  height: 150px;
  margin: 0 auto;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
}

.margin-bottom:hover {
  box-shadow: 0 3px 10px 0 rgb(64 98 225 / 45%);
}

.col {
  text-align: center;
}

.col > span {
  display: flex;
  flex-direction: column;
  padding: 10px 10px;
  text-align: center;
}

.col > span:last-child {
  color: #4e5969;
  font-weight: normal;
  font-size: 18px;
  line-height: 14px;
}

.divider {
  width: 1px;
  height: 41px;
  margin: 0 20px;
  background: #7b7e84;
  opacity: 0.3;
}

.font {
  color: #575d6c;
  font-weight: 600;
  font-size: 30px;
  font-family:
    PingFang SC,
    PingFang SC-PingFang SC;
  line-height: 36px;
  text-align: left;
}

.font-pass {
  .font();
}

.font-fail {
  .font();

  color: #2f5bea;
}

.practiced-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 8px;

  h3 {
    width: 20%;
    color: #575d6c;
    font-size: 16px;
    line-height: 14px;
    text-align: left;
  }

  div {
    width: 323px;
  }

  :deep(.tiny-input) {
    background-color: #f5f6f7;

    input {
      border-radius: 17px;
    }
  }
}

@media (max-width: @screen-md) {
  .font-pass {
    font-size: 24px;
  }

  .col > span:last-child {
    font-size: 10px;
  }
}
</style>
