import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  NgZone,
  signal,
  ViewChild,
  type OnDestroy,
} from '@angular/core';
import {
  defineTrChatElements,
  type Attachment,
  type CreateChatRuntimeOptions,
  type TrChatHTMLElement,
  type TrChatRenderers,
  type TrChatUIHTMLElement,
} from '@opentiny/tiny-robot-chat/experimental';
import { trChatEventDetail } from './tr-chat-dom-events';
import { ConversationRepository } from './services/conversation-repository';
import type { ConversationGroup, ConversationRecord } from './models/conversation-record';
import { defaultMcpTestService } from './services/mcp-test.service';
import { createSkillRuntimePlugins } from './skill-runtime';
import { defaultSkillTestService } from './services/skill-test.service';
import { defaultAttachmentTestService } from './services/attachment-test.service';
import { transformAttachmentPayload } from './attachment-payload';
import { ScenarioStore } from './services/scenario-store';

defineTrChatElements();

type Theme = 'light' | 'night';
type Language = 'zh' | 'en';
type Voice = 'clear' | 'calm';
type AsidePanel = 'preview' | 'sources' | 'mcp';
type FloatingState = NonNullable<TrChatUIHTMLElement['floatingState']>;
type AnswerFeedback = { kind: 'positive' } | { kind: 'negative'; reason: string };
type ScenarioId = 'chat' | 'history' | 'mcp' | 'skills' | 'attachments' | 'messages' | 'responsive';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: {
    '[attr.data-theme]': 'theme()',
    '[attr.data-integration-status]': 'ready() ? "ready" : "waiting"',
    '[attr.data-style-stress]': 'styleStress() ? "enabled" : "disabled"',
  },
})
export class App implements OnDestroy {
  @ViewChild('chat') private chat?: ElementRef<TrChatHTMLElement>;
  private readonly zone = inject(NgZone);

  protected readonly ready = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly settingsOpen = signal(false);
  protected readonly theme = signal<Theme>('light');
  protected readonly language = signal<Language>('zh');
  protected readonly voice = signal<Voice>('clear');
  protected readonly historyData = signal<TrChatHTMLElement['historyData']>(undefined);
  protected readonly searchQuery = signal('');
  protected readonly historyLoading = signal(false);
  protected readonly historyError = signal('');
  protected readonly historyNextCursor = signal<string | undefined>(undefined);
  protected readonly rightAsideOpen = signal(false);
  protected readonly activeRightAsidePanelId = signal<AsidePanel>('preview');
  protected readonly floatingOpen = signal(false);
  protected readonly styleStress = signal(false);
  protected readonly attachments = signal<Attachment[]>([]);
  protected readonly attachmentSubmitStatus = signal('尚未提交附件');
  protected readonly processedAttachments = defaultAttachmentTestService.records;
  protected readonly mcpCallRecords = defaultMcpTestService.records;
  protected readonly skillCatalog = defaultSkillTestService.catalog;
  protected readonly resolvedSkillNames = defaultSkillTestService.resolvedSkillNames;
  protected readonly skillOverlayName = signal<string | undefined>(undefined);
  protected readonly scenarioStore = new ScenarioStore<ScenarioId>([
    'chat',
    'history',
    'mcp',
    'skills',
    'attachments',
    'messages',
    'responsive',
  ]);
  protected readonly scenarioLabels: ReadonlyArray<{ id: ScenarioId; label: string }> = [
    { id: 'chat', label: '对话与流式响应' },
    { id: 'history', label: '历史会话' },
    { id: 'mcp', label: 'MCP 工具调用' },
    { id: 'skills', label: 'Skills' },
    { id: 'attachments', label: '文件与图片' },
    { id: 'messages', label: '消息操作' },
    { id: 'responsive', label: '响应式与可访问性' },
  ];
  protected readonly floatingState = signal<FloatingState>({
    placement: 'top-right',
    offsetX: 24,
    offsetY: 72,
    width: 520,
    height: 520,
  });

  private pendingRestoreId: string | undefined;
  private readonly conversationRepository = new ConversationRepository(localStorage);
  private readonly loadedHistory = new Map<string, ConversationRecord>();
  private historyRequest?: Promise<void>;
  private historyLoadQueued?: boolean;
  private historyPaused = false;
  private attachmentsSubmitted = false;
  private readonly answerFeedback = new Map<string, AnswerFeedback>();
  private readonly answerShareState = new Map<string, 'shared' | 'copied'>();
  private activeSpeech:
    { utterance: SpeechSynthesisUtterance; button: HTMLButtonElement } | undefined;

  readonly runtimeOptions = {
    storageKey: 'tiny-robot-angular20-application-v1',
    autoSaveThrottle: 0,
    plugins: createSkillRuntimePlugins(defaultSkillTestService),
    transformSendPayload: (payload) => {
      const records = defaultAttachmentTestService.records();
      const transformed = transformAttachmentPayload(payload, records);
      if (records.some((record) => record.state === 'ready')) {
        this.attachmentsSubmitted = true;
        queueMicrotask(() => {
          this.zone.run(() => {
            defaultAttachmentTestService.clear();
            this.clearAttachmentUi();
          });
        });
        setTimeout(() => this.zone.run(() => this.clearAttachmentUi()));
      }
      return transformed;
    },
    titleGenerator: (text) => text.trim().slice(0, 32) || '新对话',
    beforeSend: ({ payload }) => {
      const names = payload.attachments?.map(
        (attachment) => attachment.name ?? attachment.rawFile?.name ?? '未命名文件',
      );
      if (names?.length) {
        this.attachmentSubmitStatus.set(`已随消息提交附件：${names.join('、')}`);
        queueMicrotask(() => {
          defaultAttachmentTestService.clear();
          this.clearAttachmentUi();
        });
      }
      return 'continue';
    },
    onLoad: (conversations) => {
      const latest = [...conversations].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))[0];
      this.pendingRestoreId = latest?.id;
      void this.restoreLatestConversation();
    },
    modelProviders: [
      {
        type: 'qwen',
        label: 'Angular deterministic mock',
        apiUrl: `${window.location.origin}/mock-chat`,
        models: [
          {
            id: 'angular-deterministic-model',
            label: 'TrChat Mock',
            description: '本地确定性 SSE，不调用外部模型',
            capabilities: { thinking: true, search: true },
          },
        ],
      },
      {
        type: 'deepseek',
        label: 'DeepSeek API（本地代理）',
        apiUrl: `${window.location.origin}/api/deepseek`,
        models: [
          {
            id: 'deepseek-flash',
            label: 'DeepSeek V4.1 Flash',
            description: '官方 deepseek-flash，支持文本、图像与 low/high/max 思考强度',
            capabilities: { thinking: true },
          },
          {
            id: 'deepseek-v4-pro',
            label: 'DeepSeek V4 Pro',
            description: '官方 deepseek-v4-pro，文本输入与 low/high/max 思考强度',
            capabilities: { thinking: true },
          },
        ],
      },
    ],
    mcpServers: [
      {
        id: 'local-project-tools',
        name: '本地项目工具',
        description: '确定性本地 MCP，用于验证安装、启停、工具选择与移除。',
        baseUrl: `${window.location.origin}/mock-mcp`,
      },
    ],
  } satisfies CreateChatRuntimeOptions;

  ui: NonNullable<TrChatHTMLElement['ui']> = {
    layout: {
      emptyState: 'center',
      composer: { welcome: 'center' },
      contentMaxWidth: 860,
      leftAside: { width: 268, defaultOpen: window.matchMedia('(min-width: 960px)').matches },
      rightAside: {
        width: 344,
        resizable: true,
        minWidth: 300,
        maxWidth: 480,
        panels: [
          { id: 'preview', title: '发布预览' },
          { id: 'sources', title: '参考资料' },
        ],
      },
    },
    brand: { name: 'TrChat Lab' },
    labels: {
      composerPlaceholder: '给 TrChat 发送消息',
      welcomeTitle: '欢迎使用 TrChat',
      welcomeDescription: '这是 Angular 20 宿主中的完整 Web Component 应用示例',
      searchFeature: '智能搜索',
    },
    history: { showRenameControls: true },
    extensions: { defaultActiveTab: 'skills', tabs: this.createSkillTabs() },
    prompts: {
      wrap: true,
      items: [
        { id: 'capabilities', label: '介绍能力', description: '介绍这个 TrChat 应用示例的能力。' },
        {
          id: 'integration',
          label: '说明集成',
          description: '说明 Angular 如何集成 Web Component。',
        },
      ],
    },
    sender: { stopText: '停止' },
  } satisfies NonNullable<TrChatHTMLElement['ui']>;

  readonly renderers: TrChatRenderers = {
    'extension-overlay': () => {
      const name = this.skillOverlayName();
      const skill = this.skillCatalog().find((item) => item.name === name);
      const section = document.createElement('section');
      section.className = 'angular-skill-overlay';
      const title = document.createElement('h3');
      title.textContent = skill?.label ?? 'Skill 详情';
      const description = document.createElement('p');
      description.textContent = skill?.description ?? '未找到 Skill。';
      const instructions = document.createElement('pre');
      instructions.textContent = skill?.instructions ?? '';
      const close = document.createElement('button');
      close.type = 'button';
      close.textContent = '返回扩展列表';
      close.addEventListener('click', () => this.closeSkillOverlay(), { once: true });
      section.append(title, description, instructions, close);
      return section;
    },
    'layout-right-aside-panel': ({ panelId, activateRightAsidePanel }, lifecycle) => {
      const panel = document.createElement('section');
      panel.className = 'angular-aside-panel';

      const heading = document.createElement('h2');
      heading.textContent = panelId === 'sources' ? 'Angular 参考资料' : 'Angular 发布方案';
      panel.append(heading);

      const description = document.createElement('p');
      description.textContent =
        panelId === 'sources'
          ? '这里验证 Renderer 内部动作仍能回写 Angular 的 activeRightAsidePanelId signal。'
          : '这里验证 Angular 属性绑定可以控制 Web Component 的右侧面板。';
      panel.append(description);

      if (panelId === 'sources') {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = '切换到发布预览';
        const activate = () => activateRightAsidePanel('preview');
        button.addEventListener('click', activate);
        lifecycle.signal.addEventListener(
          'abort',
          () => button.removeEventListener('click', activate),
          { once: true },
        );
        panel.append(button);
      }

      return panel;
    },
    'bubble-content-footer': ({ messages, role, messageIndexes }, lifecycle) => {
      if (role !== 'assistant' || messageIndexes.length === 0) return null;

      const actions = document.createElement('div');
      actions.className = 'angular-message-actions';
      const messageText = messages
        .map((message) => this.messageText(message.content))
        .filter(Boolean)
        .join('\n');
      const activeConversation = this.chat?.nativeElement.getRuntime()?.activeConversation.value;
      const answerIsStreaming = activeConversation?.requestState === 'processing';
      const actionKey = `${activeConversation?.id ?? 'pending'}:${messageIndexes.join(',')}`;

      const copy = this.actionButton('复制回答');
      const copyAnswer = async () => {
        try {
          await navigator.clipboard.writeText(messageText);
          copy.textContent = '已复制';
          copy.setAttribute('aria-label', '已复制');
        } catch (error) {
          copy.textContent = '复制失败';
          copy.setAttribute('aria-label', '复制失败');
          this.errorMessage.set(String(error));
        }
      };

      const retry = this.actionButton('重新生成');
      const retryAnswer = async () => {
        const runtime = this.chat?.nativeElement.getRuntime();
        const conversationMessages = runtime?.activeConversation.value?.messages ?? [];
        const firstAssistantIndex = messageIndexes[0] ?? -1;
        const source = [...conversationMessages]
          .slice(0, firstAssistantIndex)
          .reverse()
          .find((message) => message.role === 'user');
        const text = this.messageText(source?.content);
        if (!text) return;

        retry.disabled = true;
        retry.textContent = '重试中…';
        await this.chat?.nativeElement.send({ text });
      };

      const recordedFeedback = this.answerFeedback.get(actionKey);
      const helpful = this.actionButton(
        recordedFeedback?.kind === 'positive' ? '已评价' : '有帮助',
      );
      const unhelpful = this.actionButton(
        recordedFeedback?.kind === 'negative' ? `已反馈：${recordedFeedback.reason}` : '不满意',
      );
      const readAloud = this.actionButton('朗读');
      const recordedShare = this.answerShareState.get(actionKey);
      const share = this.actionButton(
        recordedShare === 'shared'
          ? '已分享'
          : recordedShare === 'copied'
            ? '已复制分享内容'
            : '分享',
      );
      helpful.disabled = Boolean(recordedFeedback);
      unhelpful.disabled = Boolean(recordedFeedback);
      share.disabled = Boolean(recordedShare);
      const rateAnswer = () => {
        this.answerFeedback.set(actionKey, { kind: 'positive' });
        helpful.textContent = '已评价';
        helpful.setAttribute('aria-label', '已评价');
        helpful.disabled = true;
        unhelpful.disabled = true;
      };

      let reasonPanel: HTMLDivElement | undefined;
      const closeReasonPanel = () => {
        reasonPanel?.remove();
        reasonPanel = undefined;
      };
      const openReasonPanel = () => {
        if (reasonPanel) return;

        reasonPanel = document.createElement('div');
        reasonPanel.className = 'angular-feedback-reasons';
        reasonPanel.role = 'dialog';
        reasonPanel.setAttribute('aria-label', '选择不满意原因');

        for (const reason of ['内容不准确', '没有解决问题', '表达不清楚']) {
          const reasonButton = this.actionButton(reason);
          reasonButton.addEventListener(
            'click',
            () => {
              this.answerFeedback.set(actionKey, { kind: 'negative', reason });
              unhelpful.textContent = `已反馈：${reason}`;
              unhelpful.setAttribute('aria-label', `已反馈：${reason}`);
              unhelpful.disabled = true;
              helpful.disabled = true;
              closeReasonPanel();
            },
            { once: true },
          );
          reasonPanel.append(reasonButton);
        }

        const cancel = this.actionButton('取消');
        cancel.addEventListener('click', closeReasonPanel, { once: true });
        reasonPanel.append(cancel);
        actions.append(reasonPanel);
      };

      const toggleReadAloud = () => {
        if (this.activeSpeech?.button === readAloud) {
          this.stopActiveSpeech();
          return;
        }
        const speech = window.speechSynthesis;
        const Utterance = window.SpeechSynthesisUtterance;
        if (!speech || typeof speech.speak !== 'function' || typeof Utterance !== 'function') {
          readAloud.textContent = '朗读不可用';
          readAloud.setAttribute('aria-label', '朗读不可用');
          readAloud.disabled = true;
          return;
        }

        this.stopActiveSpeech();
        const utterance = new Utterance(messageText);
        utterance.lang = this.language() === 'en' ? 'en-US' : 'zh-CN';
        utterance.rate = this.voice() === 'calm' ? 0.9 : 1;
        utterance.addEventListener(
          'start',
          () => {
            readAloud.textContent = '停止朗读';
            readAloud.setAttribute('aria-label', '停止朗读');
          },
          { once: true },
        );
        const finish = () => {
          if (this.activeSpeech?.utterance !== utterance) return;
          this.activeSpeech = undefined;
          readAloud.textContent = '朗读';
          readAloud.setAttribute('aria-label', '朗读');
        };
        utterance.addEventListener('end', finish, { once: true });
        utterance.addEventListener(
          'error',
          () => {
            finish();
            this.errorMessage.set('浏览器朗读失败');
          },
          { once: true },
        );
        this.activeSpeech = { utterance, button: readAloud };
        readAloud.textContent = '准备朗读…';
        readAloud.setAttribute('aria-label', '准备朗读');
        try {
          speech.speak(utterance);
        } catch (error) {
          this.activeSpeech = undefined;
          readAloud.textContent = '朗读失败';
          readAloud.setAttribute('aria-label', '朗读失败');
          this.errorMessage.set(String(error));
        }
      };

      const shareAnswer = async () => {
        share.disabled = true;
        if (typeof navigator.share === 'function') {
          try {
            await navigator.share({ title: 'TrChat 回答', text: messageText });
            this.answerShareState.set(actionKey, 'shared');
            share.textContent = '已分享';
            share.setAttribute('aria-label', '已分享');
            return;
          } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
              share.disabled = false;
              share.textContent = '分享';
              share.setAttribute('aria-label', '分享');
              return;
            }
          }
        }

        try {
          await navigator.clipboard.writeText(messageText);
          this.answerShareState.set(actionKey, 'copied');
          share.textContent = '已复制分享内容';
          share.setAttribute('aria-label', '已复制分享内容');
        } catch (error) {
          share.disabled = false;
          share.textContent = '分享失败';
          share.setAttribute('aria-label', '分享失败');
          this.errorMessage.set(String(error));
        }
      };

      copy.addEventListener('click', copyAnswer);
      retry.addEventListener('click', retryAnswer);
      helpful.addEventListener('click', rateAnswer);
      unhelpful.addEventListener('click', openReasonPanel);
      readAloud.addEventListener('click', toggleReadAloud);
      share.addEventListener('click', shareAnswer);
      if (answerIsStreaming) {
        actions.setAttribute('aria-busy', 'true');
        for (const action of [copy, retry, helpful, unhelpful, readAloud, share]) {
          action.disabled = true;
        }
      }
      lifecycle.signal.addEventListener(
        'abort',
        () => {
          copy.removeEventListener('click', copyAnswer);
          retry.removeEventListener('click', retryAnswer);
          helpful.removeEventListener('click', rateAnswer);
          unhelpful.removeEventListener('click', openReasonPanel);
          readAloud.removeEventListener('click', toggleReadAloud);
          share.removeEventListener('click', shareAnswer);
          if (this.activeSpeech?.button === readAloud) this.stopActiveSpeech();
          closeReasonPanel();
        },
        { once: true },
      );
      actions.append(copy, retry, helpful, unhelpful, readAloud, share);
      return actions;
    },
  };

  readonly floatingData: NonNullable<TrChatUIHTMLElement['data']> = {
    conversation: { activeId: 'angular-floating', title: 'Angular 浮动助手' },
    bubble: {
      messages: [
        {
          role: 'assistant',
          content: '拖动顶部把手或右下角缩放窗口，Angular 外部状态会同步更新。',
        },
      ],
    },
    sender: { submitDisabled: true },
  };

  readonly floatingUi: NonNullable<TrChatUIHTMLElement['ui']> = {
    layout: {
      surface: {
        mode: 'floating',
        floatingOptions: {
          draggable: true,
          resizable: true,
          minWidth: 360,
          maxWidth: 760,
          minHeight: 420,
          maxHeight: 720,
        },
      },
      leftAside: false,
      rightAside: false,
    },
  };

  protected async onReady(): Promise<void> {
    this.ready.set(true);
    this.scenarioStore.mark('chat', 'ready', 'Runtime 与流式 Provider 已连接');
    this.scenarioStore.mark('messages', 'ready', '复制、重试、评价、朗读、分享已启用');
    this.scenarioStore.mark('responsive', 'ready', '桌面与 390px 布局可验收');
    await this.restoreLatestConversation();
    await this.loadHistory(true);
  }

  protected async onRuntimeStateChange(event: Event): Promise<void> {
    const snapshot = trChatEventDetail(event, 'runtime-state-change');
    if (defaultMcpTestService.records().some((record) => record.status === 'success')) {
      this.scenarioStore.mark('mcp', 'ready', '原生 tools/call 已完成');
    }
    if (
      snapshot.activeConversation?.requestState === 'completed' &&
      this.attachments().length > 0
    ) {
      defaultAttachmentTestService.clear();
      this.clearAttachmentUi();
    }
    await this.conversationRepository.reset(
      snapshot.conversations.map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt ?? Date.now(),
        updatedAt: conversation.updatedAt ?? Date.now(),
        pinned: conversation.metadata?.['pinned'] === true,
        metadata: conversation.metadata,
      })),
    );
    if (this.historyPaused) return;
    await this.loadHistory(true);
  }

  protected onTrChatError(event: Event): void {
    const detail = trChatEventDetail(event, 'tr-chat-error');
    const cause = detail.cause;
    this.errorMessage.set(cause instanceof Error ? cause.message : String(cause));
  }

  protected async onAttachmentsSelect(event: Event): Promise<void> {
    this.attachmentsSubmitted = false;
    const files = trChatEventDetail(event, 'attachments-select');
    await defaultAttachmentTestService.add(files);
    this.scenarioStore.mark('attachments', 'ready', '本地解析与多模态转换就绪');
    this.syncNativeAttachments();
  }

  protected onAttachmentsUpdate(event: Event): void {
    const next = [...trChatEventDetail(event, 'attachments-update')];
    if (this.attachmentsSubmitted) {
      if (next.length === 0) this.attachmentsSubmitted = false;
      this.attachments.set([]);
      return;
    }
    const nextIds = new Set(next.map((attachment) => attachment.id));
    defaultAttachmentTestService
      .records()
      .filter((record) => !nextIds.has(record.id))
      .forEach((record) => defaultAttachmentTestService.remove(record.id));
    this.attachments.set(next);
  }

  protected async retryAttachment(id: string): Promise<void> {
    await defaultAttachmentTestService.retry(id);
    this.syncNativeAttachments();
  }

  protected removeAttachment(id: string): void {
    defaultAttachmentTestService.remove(id);
    this.syncNativeAttachments();
  }

  protected async createConversation(): Promise<void> {
    this.clearSearch();
    await this.chat?.nativeElement.getRuntime()?.actions.clearActiveConversation();
  }

  protected searchConversations(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    void this.loadHistory(true);
  }

  protected onHistoryAction(): void {
    this.clearSearch();
  }

  protected loadMoreHistory(): void {
    void this.loadHistory(false);
  }

  protected async simulateHistoryFailure(): Promise<void> {
    await this.historyRequest;
    this.historyPaused = true;
    this.conversationRepository.setFailureMode('once');
    await this.loadHistory(true);
  }

  protected retryHistory(): void {
    this.historyPaused = false;
    void this.loadHistory(true);
  }

  protected clearMcpCalls(): void {
    defaultMcpTestService.clear();
  }

  protected onExtensionAction(event: Event): void {
    const detail = trChatEventDetail(event, 'extension-action');
    if (detail.tabId !== 'skills') return;
    if (detail.action.id === 'install') defaultSkillTestService.install(detail.itemId);
    if (detail.action.id === 'remove') defaultSkillTestService.remove(detail.itemId);
    if (detail.action.id === 'enable') {
      defaultSkillTestService.setEnabled(detail.itemId, detail.action.checked ?? false);
    }
    if (detail.action.id === 'select') {
      defaultSkillTestService.setSelected(detail.itemId, detail.action.checked ?? false);
    }
    this.scenarioStore.mark('skills', 'ready', 'Skill 状态与 Runtime 插件已同步');
    this.refreshSkillUi();
  }

  protected onExtensionNameClick(event: Event): void {
    const detail = trChatEventDetail(event, 'extension-name-click');
    if (detail.tabId !== 'skills') return;
    this.skillOverlayName.set(detail.itemId);
    this.refreshSkillUi(true);
  }

  protected onMcpAvailability(available: boolean): void {
    defaultSkillTestService.setMcpAvailable(available);
    this.refreshSkillUi();
    this.scenarioStore.mark(
      'mcp',
      available ? 'ready' : 'pending',
      available ? 'MCP Server 已启用' : undefined,
    );
  }

  ngOnDestroy(): void {
    defaultAttachmentTestService.destroy();
    this.scenarioStore.destroy();
  }

  protected openSettings(): void {
    this.settingsOpen.set(true);
  }

  protected closeSettings(): void {
    this.settingsOpen.set(false);
  }

  protected useTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  protected chooseLanguage(event: Event): void {
    this.language.set((event.target as HTMLSelectElement).value as Language);
  }

  protected chooseVoice(event: Event): void {
    this.voice.set((event.target as HTMLSelectElement).value as Voice);
  }

  protected languageLabel(): string {
    return this.language() === 'en' ? 'English' : '简体中文';
  }

  protected voiceLabel(): string {
    return this.voice() === 'calm' ? '沉稳' : '清晰';
  }

  protected openAside(panel: AsidePanel): void {
    this.activeRightAsidePanelId.set(panel);
    this.rightAsideOpen.set(true);
  }

  protected onRightAsideOpenUpdate(event: Event): void {
    this.rightAsideOpen.set(trChatEventDetail(event, 'right-aside-open-update'));
  }

  protected onActiveRightAsidePanelIdUpdate(event: Event): void {
    const panelId = trChatEventDetail(event, 'active-right-aside-panel-id-update');
    if (panelId === 'preview' || panelId === 'sources' || panelId === 'mcp') {
      this.activeRightAsidePanelId.set(panelId);
    }
  }

  protected asidePanelLabel(): string {
    const panel = this.activeRightAsidePanelId();
    if (panel === 'sources') return '参考资料';
    if (panel === 'mcp') return 'MCP';
    return '发布预览';
  }

  protected openFloating(): void {
    this.floatingOpen.set(true);
  }

  protected closeFloating(): void {
    this.floatingOpen.set(false);
  }

  protected toggleStyleStress(): void {
    this.styleStress.update((enabled) => !enabled);
  }

  protected onFloatingStateUpdate(event: Event): void {
    this.floatingState.set({ ...trChatEventDetail(event, 'floating-state-update') });
  }

  private async restoreLatestConversation(): Promise<void> {
    const id = this.pendingRestoreId;
    const runtime = this.chat?.nativeElement.getRuntime();
    if (!id || !runtime) return;

    this.pendingRestoreId = undefined;
    await runtime.actions.switchConversation(id);
  }

  private clearSearch(): void {
    this.searchQuery.set('');
    void this.loadHistory(true);
  }

  private loadHistory(reset: boolean): Promise<void> {
    if (reset || this.historyLoadQueued === undefined) this.historyLoadQueued = reset;
    if (this.historyRequest) return this.historyRequest;

    this.historyRequest = this.drainHistoryLoads().finally(() => {
      this.historyRequest = undefined;
    });
    return this.historyRequest;
  }

  private async drainHistoryLoads(): Promise<void> {
    while (this.historyLoadQueued !== undefined) {
      const reset = this.historyLoadQueued;
      this.historyLoadQueued = undefined;
      await this.performHistoryLoad(reset);
    }
  }

  private async performHistoryLoad(reset: boolean): Promise<void> {
    this.historyLoading.set(true);
    this.historyError.set('');
    try {
      const page = await this.conversationRepository.list(
        this.searchQuery(),
        reset ? undefined : this.historyNextCursor(),
      );
      if (reset) this.loadedHistory.clear();
      page.items.forEach((record) => this.loadedHistory.set(record.id, record));
      this.historyNextCursor.set(page.nextCursor);
      this.historyData.set(this.groupHistory([...this.loadedHistory.values()]));
      this.scenarioStore.mark('history', 'ready', `已加载 ${page.total} 条会话索引`);
    } catch (error) {
      this.historyPaused = true;
      this.historyError.set(error instanceof Error ? error.message : String(error));
      this.scenarioStore.mark('history', 'failed', this.historyError());
    } finally {
      this.historyLoading.set(false);
    }
  }

  private groupHistory(records: ConversationRecord[]): ConversationGroup[] {
    const now = new Date();
    const groups = new Map<ConversationGroup['group'], ConversationRecord[]>();
    for (const record of records) {
      const date = new Date(
        record.updatedAt < 1_000_000_000_000 ? record.updatedAt * 1000 : record.updatedAt,
      );
      const group = record.pinned
        ? '置顶'
        : date.toDateString() === now.toDateString()
          ? '今天'
          : '更早';
      groups.set(group, [...(groups.get(group) ?? []), record]);
    }
    return (['置顶', '今天', '更早'] as const)
      .filter((group) => groups.has(group))
      .map((group) => ({ group, items: groups.get(group)! }));
  }

  private createSkillTabs() {
    return [
      {
        id: 'skills',
        label: 'Skills',
        items: this.skillCatalog().map((skill) => {
          const state = defaultSkillTestService.stateFor(skill.name);
          return {
            id: skill.name,
            name: skill.label,
            description: `${skill.description}${defaultSkillTestService.dependencyStatus(skill.name) === 'missing' ? '（等待 MCP）' : ''}`,
            installed: state.installed,
            nameClickable: true,
            actions: state.installed
              ? [
                  { id: 'enable', type: 'switch' as const, label: '启用', checked: state.enabled },
                  {
                    id: 'select',
                    type: 'switch' as const,
                    label: '本轮使用',
                    checked: state.selected,
                    disabled: !state.enabled,
                  },
                  { id: 'remove', type: 'button' as const, label: '卸载', danger: true },
                ]
              : [{ id: 'install', type: 'button' as const, label: '安装' }],
          };
        }),
      },
    ];
  }

  private refreshSkillUi(overlayOpen = Boolean(this.skillOverlayName())): void {
    this.ui = {
      ...this.ui,
      extensions: { defaultActiveTab: 'skills', tabs: this.createSkillTabs(), overlayOpen },
    };
  }

  private closeSkillOverlay(): void {
    this.skillOverlayName.set(undefined);
    this.refreshSkillUi(false);
  }

  private syncNativeAttachments(): void {
    this.attachments.set(
      defaultAttachmentTestService.records().map((record): Attachment => ({
        id: record.id,
        name: record.file.name,
        rawFile: record.file,
        size: record.file.size,
        url: record.previewUrl,
        status:
          record.state === 'failed' ? 'error' : record.state === 'ready' ? 'success' : 'uploading',
        message: record.error,
      })),
    );
  }

  private clearAttachmentUi(): void {
    this.attachments.set([]);
    if (this.chat?.nativeElement) this.chat.nativeElement.attachments = [];
  }

  private actionButton(label: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'angular-message-action';
    button.textContent = label;
    button.setAttribute('aria-label', label);
    return button;
  }

  private stopActiveSpeech(): void {
    const active = this.activeSpeech;
    if (!active) return;
    window.speechSynthesis?.cancel();
    active.button.textContent = '朗读';
    active.button.setAttribute('aria-label', '朗读');
    this.activeSpeech = undefined;
  }

  private messageText(content: unknown): string {
    if (typeof content === 'string') return content;
    if (!Array.isArray(content)) return '';
    return content
      .map((part) => {
        if (!part || typeof part !== 'object') return '';
        const record = part as Record<string, unknown>;
        if (typeof record['content'] === 'string') return record['content'];
        if (typeof record['text'] === 'string') return record['text'];
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }
}
