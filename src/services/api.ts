import { Settings } from '../types/settings';
import { ChatMessage } from '../types/chat';

// Main API service that coordinates between different services
export class APIService {
  private settings: Settings;

  constructor(settings: Settings) {
    this.settings = settings;
  }

  public getSettings(): Settings {
    return this.settings;
  }

  public updateSettings(settings: Settings): void {
    this.settings = settings;
  }
} 