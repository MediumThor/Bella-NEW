/** Opens the Kallisti quote-inquiry modal injected by QuoteInquiryWidget. */
export function openQuoteInquiryWidget(maxAttempts = 25, intervalMs = 100): void {
  const tryOpen = (attempt: number) => {
    const btn = document.getElementById('kallisti-inquiry-btn');
    if (btn instanceof HTMLButtonElement) {
      btn.click();
      return;
    }

    if (attempt < maxAttempts) {
      window.setTimeout(() => tryOpen(attempt + 1), intervalMs);
    }
  };

  tryOpen(0);
}
