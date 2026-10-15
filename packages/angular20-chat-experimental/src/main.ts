import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { installDeterministicChatApi } from './mock-chat-api';

installDeterministicChatApi();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
