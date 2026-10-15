import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, signal, ViewChild } from '@angular/core';
import {
  defineTrChatElements,
  type CreateChatRuntimeOptions,
  type TrChatHTMLElement,
} from '@opentiny/tiny-robot-chat/experimental';

defineTrChatElements();

type Theme = 'light' | 'night';
type Language = 'zh' | 'en';
type Voice = 'clear' | 'calm';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: {
    '[attr.data-theme]': 'theme()',
    '[attr.data-integration-status]': 'ready() ? "ready" : "waiting"',
  },
})
export class App {
  @ViewChild('chat') private chat?: ElementRef<TrChatHTMLElement>;

  protected readonly ready = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly settingsOpen = signal(false);
  protected readonly theme = signal<Theme>('light');
  protected readonly language = signal<Language>('zh');
  protected readonly voice = signal<Voice>('clear');
  protected readonly historyData = signal<TrChatHTMLElement['historyData']>(undefined);
  protected readonly searchQuery = signal('');

  private pendingRestoreId: string | undefined;

  readonly runtimeOptions = {
    storageKey: 'tiny-robot-angular20-application-v1',
    autoSaveThrottle: 0,
    titleGenerator: (text) => text.trim().slice(0, 32) || '新对话',
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
    ],
  } satisfies CreateChatRuntimeOptions;

  readonly ui = {
    layout: {
      emptyState: 'center',
      composer: { welcome: 'center' },
      contentMaxWidth: 860,
      leftAside: { width: 268, defaultOpen: true },
      rightAside: false,
    },
    brand: { name: 'TrChat Lab' },
    labels: {
      composerPlaceholder: '给 TrChat 发送消息',
      welcomeTitle: '欢迎使用 TrChat',
      welcomeDescription: '这是 Angular 20 宿主中的完整 Web Component 应用示例',
      searchFeature: '智能搜索',
    },
    history: { showRenameControls: true },
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

  protected async onReady(): Promise<void> {
    this.ready.set(true);
    await this.restoreLatestConversation();
    this.updateHistoryFilter();
  }

  protected onRuntimeError(event: Event): void {
    const detail = (event as CustomEvent<{ error?: unknown }>).detail;
    this.errorMessage.set(String(detail?.error ?? 'Unknown Runtime error'));
  }

  protected async createConversation(): Promise<void> {
    this.clearSearch();
    await this.chat?.nativeElement.getRuntime()?.actions.clearActiveConversation();
  }

  protected searchConversations(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.updateHistoryFilter();
  }

  protected onHistoryAction(): void {
    this.clearSearch();
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

  private async restoreLatestConversation(): Promise<void> {
    const id = this.pendingRestoreId;
    const runtime = this.chat?.nativeElement.getRuntime();
    if (!id || !runtime) return;

    this.pendingRestoreId = undefined;
    await runtime.actions.switchConversation(id);
  }

  private updateHistoryFilter(): void {
    const query = this.searchQuery().trim().toLocaleLowerCase();
    if (!query) {
      this.historyData.set(undefined);
      return;
    }

    const conversations = this.chat?.nativeElement.getRuntime()?.conversations.value ?? [];
    this.historyData.set(
      conversations.filter((conversation) =>
        conversation.title.toLocaleLowerCase().includes(query),
      ),
    );
  }

  private clearSearch(): void {
    this.searchQuery.set('');
    this.historyData.set(undefined);
  }
}
