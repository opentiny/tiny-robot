import { expect, test } from '@playwright/experimental-ct-vue'
import type { Page } from '@playwright/test'
import VoiceButtonFixture from './VoiceButton.fixture.vue'
import type { Failure } from './harness'

const snapshot = (page: Page) => page.evaluate(() => window.voiceFixture.snapshot())

test.describe('结果解析', () => {
  for (const texts of [
    ['A', 'B'],
    ['你好', '你好'],
  ]) {
    test(`按结果位置累计 ${texts.join(' → ')}`, async ({ mount, page }) => {
      await mount(VoiceButtonFixture, { props: { native: true, replace: true } })
      await page.evaluate(([a, b]) => {
        const voice = window.voiceFixture
        voice.start()
        voice.result([{ text: a, final: true }])
        voice.result(
          [
            { text: a, final: true },
            { text: b, final: false },
          ],
          1,
        )
        voice.result(
          [
            { text: a, final: true },
            { text: b, final: true },
          ],
          1,
        )
        voice.result(
          [
            { text: a, final: true },
            { text: b, final: true },
          ],
          0,
        )
        voice.emit('end')
      }, texts)
      await expect.poll(async () => (await snapshot(page)).content).toBe(texts.join(''))
      const { events } = await snapshot(page)
      expect(events.filter(({ name }) => name === 'final').map(({ text }) => text)).toEqual(texts)
      expect(events.filter(({ name }) => name === 'end')).toEqual([{ name: 'end', text: texts.join('') }])
    })
  }

  test('final/interim 混合、修正、缩短及撤回', async ({ mount, page }) => {
    await mount(VoiceButtonFixture, { props: { native: true, replace: true } })
    await page.evaluate(() => {
      const voice = window.voiceFixture
      voice.start()
      voice.result([
        { text: 'A', final: true },
        { text: 'long preview', final: false },
      ])
      voice.result(
        [
          { text: 'A', final: true },
          { text: 'short', final: false },
        ],
        1,
      )
      voice.result([{ text: 'A', final: true }], 1)
    })
    await expect.poll(async () => (await snapshot(page)).content).toBe('A')
    const { events } = await snapshot(page)
    expect(events.filter(({ name }) => name === 'interim').map(({ text }) => text)).toEqual([
      'Along preview',
      'Ashort',
      'A',
    ])
    expect(events.filter(({ name }) => name === 'final')).toEqual([{ name: 'final', text: 'A' }])
  })

  test('全部临时结果撤回仍发送空预览', async ({ mount, page }) => {
    await mount(VoiceButtonFixture, { props: { native: true, replace: true, initial: '原输入' } })
    await page.evaluate(() => {
      const voice = window.voiceFixture
      voice.start()
      voice.result([{ text: 'preview', final: false }])
      voice.result([])
      voice.emit('end')
    })
    await expect.poll(async () => (await snapshot(page)).content).toBe('')
    expect((await snapshot(page)).events.filter(({ name }) => name === 'interim').map(({ text }) => text)).toEqual([
      'preview',
      '',
    ])
  })
})

test.describe('写入行为', () => {
  for (const replace of [false, true]) {
    test(`语音文本保留标签、实体、空格和换行；replace=${replace}`, async ({ mount, page }) => {
      await mount(VoiceButtonFixture, { props: { replace, initial: '原输入' } })
      const text = '  A  B <tag>demo</tag> &amp;\n下一行  '
      await page.evaluate((text) => {
        const voice = window.voiceFixture
        voice.start()
        voice.emit('final', text)
        voice.emit('end', text)
      }, text)
      expect((await snapshot(page)).content).toBe(replace ? text : `原输入${text} `)
    })
  }

  test('追加只写增量，结束不再次插入累计结果', async ({ mount, page }) => {
    await mount(VoiceButtonFixture, { props: { initial: '原输入' } })
    await page.evaluate(() => {
      const voice = window.voiceFixture
      voice.start()
      voice.emit('interim', '预览')
      voice.emit('final', '你好')
      voice.emit('final', '你好')
      voice.stop()
      voice.emit('final', 'B')
      voice.emit('end', '你好你好B')
    })
    await expect.poll(async () => (await snapshot(page)).content).toBe('原输入你好 你好 B ')
  })

  for (const end of ['end', 'error'] as const) {
    test(`替换在 ${end} 时移除未确认预览`, async ({ mount, page }) => {
      await mount(VoiceButtonFixture, { props: { replace: true, initial: '原输入' } })
      await page.evaluate(() => window.voiceFixture.start())
      expect((await snapshot(page)).content).toBe('原输入')
      await page.evaluate(() => {
        window.voiceFixture.emit('final', 'A')
        window.voiceFixture.emit('interim', 'AB临时')
      })
      await expect.poll(async () => (await snapshot(page)).content).toBe('AB临时')
      await page.evaluate((name) => window.voiceFixture.emit(name, name === 'error' ? '失败' : 'A'), end)
      await expect.poll(async () => (await snapshot(page)).content).toBe('A')
    })
  }

  for (const replace of [false, true]) {
    test(`仅事件不写编辑器，仍独立累计；replace=${replace}`, async ({ mount, page }) => {
      await mount(VoiceButtonFixture, { props: { replace, autoInsert: false, initial: '原输入' } })
      await page.evaluate(() => {
        const voice = window.voiceFixture
        voice.start()
        voice.emit('final', 'A')
        voice.emit('final', 'A')
        voice.emit('interim', 'AA临时')
        voice.configure({ autoInsert: true, autoReplace: true })
      })
      expect((await snapshot(page)).content).toBe('原输入')
      await page.evaluate(() => window.voiceFixture.emit('final', 'B'))
      await expect.poll(async () => (await snapshot(page)).content).toBe('AAB')
      await page.evaluate(() => {
        window.voiceFixture.emit('end', 'AAB')
        window.voiceFixture.start()
        window.voiceFixture.emit('final', 'C')
        window.voiceFixture.emit('end', 'C')
      })
      await expect.poll(async () => (await snapshot(page)).content).toBe('C')
    })
  }

  test('无有效结果保留原输入，只有临时结果结束后清空', async ({ mount, page }) => {
    await mount(VoiceButtonFixture, { props: { replace: true, initial: '原输入' } })
    await page.evaluate(() => {
      const voice = window.voiceFixture
      voice.start()
      voice.emit('interim', '')
      voice.emit('end')
    })
    expect((await snapshot(page)).content).toBe('原输入')
    await page.evaluate(() => {
      const voice = window.voiceFixture
      voice.start()
      voice.emit('interim', '临时')
      voice.emit('end')
    })
    await expect.poll(async () => (await snapshot(page)).content).toBe('')
  })

  test('切换选项不追溯改写已追加内容', async ({ mount, page }) => {
    await mount(VoiceButtonFixture)
    await page.evaluate(() => {
      window.voiceFixture.start()
      window.voiceFixture.emit('final', 'A')
      window.voiceFixture.configure({ autoReplace: true })
    })
    expect((await snapshot(page)).content).toBe('A ')
    await page.evaluate(() => window.voiceFixture.configure({ autoInsert: false }))
    await page.evaluate(() => {
      window.voiceFixture.emit('final', 'B')
      window.voiceFixture.emit('interim', 'AB临时')
      window.voiceFixture.emit('end', 'AB')
    })
    expect((await snapshot(page)).content).toBe('A ')
  })

  test('替换后追加，再切回替换但无新结果，结束不追溯覆盖追加', async ({ mount, page }) => {
    await mount(VoiceButtonFixture, { props: { replace: true } })
    await page.evaluate(() => {
      window.voiceFixture.start()
      window.voiceFixture.emit('final', 'A')
      window.voiceFixture.configure({ autoReplace: false })
    })
    await page.evaluate(() => {
      window.voiceFixture.emit('final', 'B')
      window.voiceFixture.configure({ autoReplace: true })
    })
    await page.evaluate(() => window.voiceFixture.emit('end', 'AB'))
    expect((await snapshot(page)).content).toBe('AB ')
  })
})

test.describe('生命周期', () => {
  for (const deferred of [false, true]) {
    test(`点击拦截器按会话状态切换，等待停止时不重复请求；启动延迟=${deferred}`, async ({ mount, page }) => {
      const component = await mount(VoiceButtonFixture, { props: { deferred, intercept: true } })
      const button = component.locator('.tr-action-button')
      await button.click()
      expect((await snapshot(page)).starts).toEqual([1, 0])
      expect((await snapshot(page)).recording).toBe(!deferred)
      await button.click()
      expect((await snapshot(page)).stops).toEqual([1, 0])
      await button.click()
      expect((await snapshot(page)).stops).toEqual([1, 0])
      await page.evaluate(() => window.voiceFixture.emit('end'))
      await button.click()
      const state = await snapshot(page)
      expect(state.starts).toEqual([2, 0])
      expect(state.events.filter(({ name }) => name === 'click').map(({ text }) => text)).toEqual([
        'false',
        'true',
        'true',
        'false',
      ])
    })
  }

  test('启动中再次点击取消，迟到的 start 不激活录音', async ({ mount, page }) => {
    const component = await mount(VoiceButtonFixture, { props: { deferred: true } })
    const button = component.locator('.tr-action-button')
    await button.click()
    expect((await snapshot(page)).recording).toBe(false)
    await button.click()
    expect((await snapshot(page)).stops).toEqual([1, 0])
    await page.evaluate(() => {
      window.voiceFixture.emit('start')
      window.voiceFixture.emit('end')
    })
    expect((await snapshot(page)).events.map(({ name }) => name)).toEqual(['end'])
    await button.click()
    expect((await snapshot(page)).starts).toEqual([2, 0])
  })

  test('结束回调中的 stop 取消排队重启', async ({ mount, page }) => {
    await mount(VoiceButtonFixture)
    await page.evaluate(() => {
      const voice = window.voiceFixture
      voice.start()
      voice.start()
      voice.stopOnEnd()
      voice.emit('end')
    })
    expect((await snapshot(page)).starts).toEqual([1, 0])
    expect((await snapshot(page)).recording).toBe(false)
  })

  test('旧结束回调不清除新会话的重启请求', async ({ mount, page }) => {
    await mount(VoiceButtonFixture)
    await page.evaluate(() => {
      const voice = window.voiceFixture
      voice.start()
      voice.start()
      voice.restartOnEnd(2)
      voice.emit('end', undefined, 0)
      voice.emit('end', undefined, 1)
    })
    expect((await snapshot(page)).starts).toEqual([3, 0])
    expect((await snapshot(page)).stops).toEqual([2, 0])
    expect((await snapshot(page)).recording).toBe(true)
  })

  test('原生 stop 保留 final 监听直到 end，Promise 完成不代替结束事件', async ({ mount, page }) => {
    await mount(VoiceButtonFixture, { props: { native: true, replace: true } })
    await page.evaluate(() => {
      window.voiceFixture.start()
      window.voiceFixture.stop()
      window.voiceFixture.stop()
    })
    expect((await snapshot(page)).recording).toBe(true)
    expect((await snapshot(page)).native[0]).toMatchObject({ stops: 1, listening: true })
    await page.evaluate(() => {
      window.voiceFixture.result([{ text: '迟到结果', final: true }])
      window.voiceFixture.emit('end')
    })
    const state = await snapshot(page)
    expect(state.content).toBe('迟到结果')
    expect(state.native[0].listening).toBe(false)
    expect(state.recording).toBe(false)
  })

  test('旧启动 Promise 迟到拒绝不影响新会话，stop Promise 不代替 end', async ({ mount, page }) => {
    await mount(VoiceButtonFixture, { props: { deferred: true } })
    await page.evaluate(() => {
      window.voiceFixture.start()
      window.voiceFixture.stop()
    })
    expect((await snapshot(page)).events).toEqual([])
    await page.evaluate(() => {
      window.voiceFixture.emit('end')
      window.voiceFixture.start()
      window.voiceFixture.emit('start')
      window.voiceFixture.rejectStart(0)
    })
    expect((await snapshot(page)).recording).toBe(true)
    expect((await snapshot(page)).events.map(({ name }) => name)).toEqual(['end', 'start'])
  })

  test('启动中重复 start 被忽略，启动中 stop 只请求一次', async ({ mount, page }) => {
    await mount(VoiceButtonFixture, { props: { deferred: true } })
    await page.evaluate(() => {
      const voice = window.voiceFixture
      voice.start()
      voice.start()
      voice.start()
      voice.stop()
      voice.stop()
      voice.emit('start')
      voice.emit('final', 'A')
      voice.emit('end', 'A')
      voice.emit('end', 'A')
    })
    const state = await snapshot(page)
    expect(state.starts).toEqual([1, 0])
    expect(state.stops).toEqual([1, 0])
    expect(state.recording).toBe(false)
    expect(state.events.map(({ name }) => name)).toEqual(['final', 'end'])
  })

  test('录音中 start 停止后重启一次，停止后的 final 正常处理', async ({ mount, page }) => {
    await mount(VoiceButtonFixture)
    await page.evaluate(() => {
      const voice = window.voiceFixture
      voice.start()
      voice.start()
      voice.start()
      voice.emit('final', 'A')
      voice.emit('end', 'A')
      voice.emit('final', '旧会话', 0)
      voice.emit('error', '旧错误', 0)
      voice.emit('end', '旧结束', 0)
      voice.emit('start', undefined, 0)
      voice.emit('interim', '旧预览', 0)
    })
    const state = await snapshot(page)
    expect(state.starts).toEqual([2, 0])
    expect(state.stops).toEqual([1, 0])
    expect(state.recording).toBe(true)
    expect(state.events.map(({ name }) => name)).toEqual(['start', 'final', 'end', 'start'])
  })

  test('外部结束回调新建会话不被排队重启影响', async ({ mount, page }) => {
    await mount(VoiceButtonFixture)
    await page.evaluate(() => {
      const voice = window.voiceFixture
      voice.restartOnEnd()
      voice.start()
      voice.start()
      voice.emit('end')
      voice.emit('final', 'B')
    })
    const state = await snapshot(page)
    expect(state.starts).toEqual([2, 0])
    expect(state.stops).toEqual([1, 0])
    expect(state.recording).toBe(true)
  })

  for (const deferred of [false, true]) {
    test(`卸载使全部迟到回调失效；启动延迟=${deferred}`, async ({ mount, page }) => {
      await mount(VoiceButtonFixture, { props: { deferred } })
      await page.evaluate(() => window.voiceFixture.start())
      const before = (await snapshot(page)).events
      await page.evaluate(() => window.voiceFixture.hide())
      await page.evaluate(() => {
        const voice = window.voiceFixture
        voice.emit('start')
        voice.emit('interim', '临时')
        voice.emit('final', 'A')
        voice.emit('end', 'A')
        voice.emit('error', '失败')
      })
      expect((await snapshot(page)).events).toEqual(before)
      expect((await snapshot(page)).stops).toEqual([1, 0])
    })
  }
})

test.describe('配置与异常', () => {
  for (const deferred of [false, true]) {
    for (const end of ['end', 'error'] as const) {
      test(`切换不支持的 Handler 保留停止入口，${end} 后隐藏；启动延迟=${deferred}`, async ({ mount, page }) => {
        const component = await mount(VoiceButtonFixture, { props: { deferred } })
        await page.evaluate(() => {
          const voice = window.voiceFixture
          voice.start()
          voice.support(1, false)
          voice.select(1)
        })
        await expect(component.locator('.tr-action-button')).toBeVisible()
        await component.locator('.tr-action-button').click()
        expect((await snapshot(page)).stops).toEqual([1, 0])
        await page.evaluate((end) => window.voiceFixture.emit(end, end === 'error' ? '失败' : undefined), end)
        await expect(component.locator('.tr-action-button')).toHaveCount(0)
        await page.evaluate(() => window.voiceFixture.select(0))
        await expect(component.locator('.tr-action-button')).toBeVisible()
      })
    }
  }

  test('原生 stop 异常清理监听，保留已确定文本并移除预览', async ({ mount, page }) => {
    await mount(VoiceButtonFixture, { props: { native: true, replace: true } })
    await page.evaluate(() => {
      window.voiceFixture.start()
      window.voiceFixture.result([
        { text: 'A', final: true },
        { text: '临时', final: false },
      ])
      window.voiceFixture.failure('', 'throw')
      window.voiceFixture.stop()
      window.voiceFixture.emit('end')
    })
    const state = await snapshot(page)
    expect(state.content).toBe('A')
    expect(state.recording).toBe(false)
    expect(state.native[0].listening).toBe(false)
    expect(state.events.filter(({ name }) => name === 'error')).toHaveLength(1)
    expect(state.events.filter(({ name }) => name === 'end')).toHaveLength(0)
  })

  test('省略 lang 不覆盖原生默认值，下一轮读取所有新参数', async ({ mount, page }) => {
    await mount(VoiceButtonFixture, { props: { native: true } })
    await page.evaluate(() => {
      document.documentElement.lang = 'zh-CN'
      window.voiceFixture.start()
    })
    expect((await snapshot(page)).native[0]).toMatchObject({
      lang: 'native-default',
      assignments: [],
      continuous: false,
      interimResults: true,
    })
    await page.evaluate(() => window.voiceFixture.configure({ lang: 'en-US', continuous: true, interimResults: false }))
    expect((await snapshot(page)).native[0].assignments).toEqual([])
    await page.evaluate(() => {
      window.voiceFixture.emit('end')
      window.voiceFixture.start()
    })
    expect((await snapshot(page)).native[1]).toMatchObject({
      lang: 'en-US',
      assignments: ['en-US'],
      continuous: true,
      interimResults: false,
    })
  })

  for (const deferred of [false, true]) {
    test(`Handler 切换只影响下一轮；启动延迟=${deferred}`, async ({ mount, page }) => {
      await mount(VoiceButtonFixture, { props: { deferred } })
      await page.evaluate(() => {
        window.voiceFixture.start()
        window.voiceFixture.select(1)
      })
      await page.evaluate(() => {
        const voice = window.voiceFixture
        voice.stop()
        voice.emit('final', 'A')
        voice.emit('end', 'A')
        voice.start()
      })
      expect((await snapshot(page)).starts).toEqual([1, 1])
      expect((await snapshot(page)).stops).toEqual([1, 0])
      expect((await snapshot(page)).events.filter(({ name }) => name === 'final')).toEqual([
        { name: 'final', text: 'A' },
      ])
    })
  }

  for (const operation of ['start', 'stop']) {
    for (const failure of ['throw', 'reject'] as Failure[]) {
      test(`${operation} ${failure} 只收尾一次并取消重启`, async ({ mount, page }) => {
        await mount(VoiceButtonFixture)
        await page.evaluate(
          ({ operation, failure }) => {
            const voice = window.voiceFixture
            voice.failure(operation === 'start' ? failure : '', operation === 'stop' ? failure : '')
            voice.start()
            if (operation === 'stop') voice.start()
          },
          { operation, failure },
        )
        await expect
          .poll(async () => (await snapshot(page)).events.filter(({ name }) => name === 'error').length)
          .toBe(1)
        await page.evaluate(() => {
          window.voiceFixture.emit('end')
          window.voiceFixture.emit('error', '迟到')
        })
        expect((await snapshot(page)).starts).toEqual([1, 0])
        expect((await snapshot(page)).events.filter(({ name }) => name === 'error')).toHaveLength(1)
        expect((await snapshot(page)).recording).toBe(false)
      })
    }
  }
})
