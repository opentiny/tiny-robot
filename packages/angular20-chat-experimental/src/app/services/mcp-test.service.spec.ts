import { McpTestService } from './mcp-test.service';

describe('McpTestService', () => {
  it('executes the three deterministic tools and records their result', async () => {
    const service = new McpTestService({ delayMs: 0, timeoutMs: 100 });

    expect(await service.call('search_project_code', { query: 'Runtime' })).toContain('Runtime');
    expect(await service.call('get_weather', { city: '深圳' })).toContain('深圳');
    expect(await service.call('inspect_image', { name: 'sample.png' })).toContain('sample.png');
    expect(service.records().map((record) => record.status)).toEqual([
      'success',
      'success',
      'success',
    ]);
  });

  it('rejects invalid arguments, forced server errors, and timeouts with observable records', async () => {
    const service = new McpTestService({ delayMs: 1, timeoutMs: 5 });

    await expectAsync(service.call('search_project_code', {})).toBeRejectedWithError(/query/);
    await expectAsync(
      service.call('search_project_code', { query: 'force-error' }),
    ).toBeRejectedWithError(/模拟 MCP/);
    service.setDelay(20);
    await expectAsync(service.call('get_weather', { city: '上海' })).toBeRejectedWithError(/超时/);
    expect(service.records().map((record) => record.status)).toEqual(['error', 'error', 'error']);
  });

  it('rejects disabled tools and clears call records', async () => {
    const service = new McpTestService({ delayMs: 0, timeoutMs: 100 });
    service.setToolEnabled('get_weather', false);
    await expectAsync(service.call('get_weather', { city: '北京' })).toBeRejectedWithError(
      /已禁用/,
    );
    expect(service.records()).toHaveSize(1);
    service.clear();
    expect(service.records()).toEqual([]);
  });
});
