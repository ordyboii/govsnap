import { chromium, Browser, BrowserContext, Page } from 'playwright';

type UrlChangeCallback = (url: string) => void;
type TitleChangeCallback = (title: string) => void;

export class PlaywrightController {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private urlChangeCallbacks: UrlChangeCallback[] = [];
  private titleChangeCallbacks: TitleChangeCallback[] = [];

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: false,
      args: ['--disable-blink-features=AutomationControlled'],
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    this.page = await this.context.newPage();

    // Listen for navigation events
    this.page.on('framenavigated', (frame) => {
      if (frame === this.page?.mainFrame()) {
        const url = frame.url();
        this.urlChangeCallbacks.forEach(cb => cb(url));
      }
    });

    // Listen for page load to get title
    this.page.on('load', async () => {
      const title = await this.page?.title();
      if (title) {
        this.titleChangeCallbacks.forEach(cb => cb(title));
      }
    });

    // Navigate to GOV.UK by default
    await this.page.goto('https://www.gov.uk');
  }

  async navigateTo(url: string): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  getCurrentUrl(): string | null {
    return this.page?.url() ?? null;
  }

  async getPageTitle(): Promise<string | null> {
    return this.page?.title() ?? null;
  }

  async captureScreenshot(): Promise<Buffer> {
    if (!this.page) throw new Error('Page not initialized');
    return this.page.screenshot({ type: 'png', fullPage: false });
  }

  onUrlChanged(callback: UrlChangeCallback): void {
    this.urlChangeCallbacks.push(callback);
  }

  onTitleChanged(callback: TitleChangeCallback): void {
    this.titleChangeCallbacks.push(callback);
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
    }
  }
}
