class BrowserService {
  private static instance: BrowserService;
  private proxyUrl = 'https://api.allorigins.win/raw?url=';
  private googleSearchUrl = 'https://www.google.com/search';

  private constructor() {}

  static getInstance(): BrowserService {
    if (!BrowserService.instance) {
      BrowserService.instance = new BrowserService();
    }
    return BrowserService.instance;
  }

  private makeAbsoluteUrl(baseUrl: string, relativeUrl: string): string {
    try {
      return new URL(relativeUrl, baseUrl).toString();
    } catch {
      return relativeUrl;
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isGoogleSearchQuery(url: string): boolean {
    // If it's a valid URL but points to our local search endpoint, treat it as a search query
    if (url.includes('/search?') && url.includes('localhost:3000') || url.includes('192.168.')) {
      const searchParams = new URLSearchParams(url.split('?')[1]);
      return searchParams.has('q');
    }
    // If it's not a valid URL and doesn't contain dots, treat as search query
    return !this.isValidUrl(url) && !url.includes('.');
  }

  private constructGoogleSearchUrl(query: string): string {
    // If the query is a full search URL, extract just the 'q' parameter
    if (query.includes('/search?')) {
      try {
        const searchParams = new URLSearchParams(query.split('?')[1]);
        query = searchParams.get('q') || query;
      } catch {
        // If parsing fails, use the query as-is
      }
    }
    return `${this.googleSearchUrl}?q=${encodeURIComponent(query)}`;
  }

  async fetchPage(url: string): Promise<string> {
    try {
      // Handle Google search queries
      const finalUrl = this.isGoogleSearchQuery(url)
        ? this.constructGoogleSearchUrl(url)
        : url;

      // If URL doesn't start with http/https, add https://
      const processedUrl = !finalUrl.startsWith('http') ? `https://${finalUrl}` : finalUrl;

      const response = await fetch(this.proxyUrl + encodeURIComponent(processedUrl));
      let content = await response.text();

      // Fix relative URLs for images, scripts, and stylesheets
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');

      // Fix images
      doc.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        if (src) {
          const absoluteUrl = this.makeAbsoluteUrl(url, src);
          img.setAttribute('src', this.proxyUrl + encodeURIComponent(absoluteUrl));
        }
      });

      // Fix stylesheets
      doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          const absoluteUrl = this.makeAbsoluteUrl(url, href);
          link.setAttribute('href', this.proxyUrl + encodeURIComponent(absoluteUrl));
        }
      });

      // Fix scripts
      doc.querySelectorAll('script[src]').forEach(script => {
        const src = script.getAttribute('src');
        if (src) {
          const absoluteUrl = this.makeAbsoluteUrl(url, src);
          script.setAttribute('src', this.proxyUrl + encodeURIComponent(absoluteUrl));
        }
      });

      // Fix background images in style attributes
      doc.querySelectorAll('[style*="background"]').forEach(el => {
        const style = el.getAttribute('style');
        if (style) {
          const newStyle = style.replace(/url\(['"]?([^'")]+)['"]?\)/g, (match, p1) => {
            const absoluteUrl = this.makeAbsoluteUrl(url, p1);
            return `url("${this.proxyUrl + encodeURIComponent(absoluteUrl)}")`;
          });
          el.setAttribute('style', newStyle);
        }
      });

      return doc.documentElement.outerHTML;
    } catch (error) {
      console.error('Error fetching page:', error);
      throw error;
    }
  }
}

export default BrowserService; 