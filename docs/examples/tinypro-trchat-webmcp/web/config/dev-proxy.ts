export interface DevProxyEnv {
  VITE_BASE_API: string
  VITE_SERVER_HOST: string
  VITE_MOCK_HOST: string
}

export interface DevProxyRewrite {
  target: string
  changeOrigin: true
  logLevel?: 'debug'
  rewrite: (path: string) => string
}

export function createDevProxyConfig(
  env: DevProxyEnv,
  useMock: boolean,
): Record<string, DevProxyRewrite> {
  const apiTarget = useMock ? env.VITE_MOCK_HOST : env.VITE_SERVER_HOST

  return {
    [env.VITE_BASE_API]: {
      target: apiTarget,
      changeOrigin: true,
      logLevel: 'debug',
      rewrite: (path: string) =>
        path.replace(
          new RegExp(`^${env.VITE_BASE_API}`),
          // 纯前端 mock 模式原样转发到 8848（handler 按 /api 匹配）；
          // 联调模式剥掉 /api 前缀转发到后端，
          // 演示接口走 NestJS 内存 mock 还是真实数据库由后端的
          // MOCK_MODE 决定（nestJs: pnpm start:mock / pnpm start:dev）
          useMock ? env.VITE_BASE_API : '',
        ),
    },
  }
}
