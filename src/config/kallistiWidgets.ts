const KALLISTI_ORIGIN = 'https://www.kallisti.pro';
const devOrigin = 'http://localhost:5173';

function envValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function widgetOrigin(): string {
  const configuredOrigin = envValue(import.meta.env.VITE_KALLISTI_ORIGIN);
  if (configuredOrigin) return configuredOrigin;
  return import.meta.env.DEV ? devOrigin : KALLISTI_ORIGIN;
}

function kallistiOrigin(): string {
  for (const candidate of [
    import.meta.env.VITE_KALLISTI_INVENTORY_WIDGET_SRC,
    import.meta.env.VITE_KALLISTI_WIDGET_SRC,
  ]) {
    const value = envValue(candidate);
    if (!value) continue;
    try {
      return new URL(value).origin;
    } catch {
      /* try next */
    }
  }

  return widgetOrigin();
}

function inventoryWidgetSrc(): string {
  const configured = envValue(import.meta.env.VITE_KALLISTI_INVENTORY_WIDGET_SRC);
  if (configured?.includes('/embed/inventory-widget.js')) return configured;

  if (configured && import.meta.env.DEV) {
    console.warn(
      '[Kallisti] VITE_KALLISTI_INVENTORY_WIDGET_SRC must point to /embed/inventory-widget.js, not widget.js.',
    );
  }

  return `${kallistiOrigin()}/embed/inventory-widget.js`;
}

function inventoryEmbedUrl(): string {
  const company =
    envValue(import.meta.env.VITE_KALLISTI_INVENTORY_WIDGET_COMPANY) ??
    KALLISTI_WIDGET_COMPANY;
  const token =
    envValue(import.meta.env.VITE_KALLISTI_INVENTORY_WIDGET_TOKEN) ??
    '1ZnI2AnF411jo8ZbqOXOJUGZom9dJ6-H';
  const theme = envValue(import.meta.env.VITE_KALLISTI_INVENTORY_WIDGET_THEME) ?? 'dark';
  const origin = kallistiOrigin();

  const params = new URLSearchParams({ t: token });
  if (theme === 'dark' || theme === 'light') {
    params.set('theme', theme);
  }

  return `${origin}/embed/inventory/${encodeURIComponent(company)}?${params.toString()}`;
}

export const KALLISTI_WIDGET_COMPANY =
  envValue(import.meta.env.VITE_KALLISTI_WIDGET_COMPANY) ??
  envValue(import.meta.env.VITE_KALLISTI_INVENTORY_WIDGET_COMPANY) ??
  'bella-stone-hlzclr';

export const quoteWidgetConfig = {
  src:
    envValue(import.meta.env.VITE_KALLISTI_WIDGET_SRC) ??
    `${widgetOrigin()}/embed/widget.js`,
  company: KALLISTI_WIDGET_COMPANY,
  token:
    envValue(import.meta.env.VITE_KALLISTI_WIDGET_TOKEN) ??
    'oOteBYnNaKLRQmH7xrHWs6Sr3780j9d6',
  accent: envValue(import.meta.env.VITE_KALLISTI_WIDGET_ACCENT) ?? '#111827',
  label: envValue(import.meta.env.VITE_KALLISTI_WIDGET_LABEL) ?? 'Request a quote',
};

export const INVENTORY_EMBED_URL =
  'https://www.kallisti.pro/embed/inventory/bella-stone-hlzclr?t=1ZnI2AnF411jo8ZbqOXOJUGZom9dJ6-H&theme=dark';

export const inventoryWidgetConfig = {
  src: inventoryWidgetSrc(),
  embedUrl: inventoryEmbedUrl(),
  company:
    envValue(import.meta.env.VITE_KALLISTI_INVENTORY_WIDGET_COMPANY) ??
    KALLISTI_WIDGET_COMPANY,
  token:
    envValue(import.meta.env.VITE_KALLISTI_INVENTORY_WIDGET_TOKEN) ??
    '1ZnI2AnF411jo8ZbqOXOJUGZom9dJ6-H',
  theme: envValue(import.meta.env.VITE_KALLISTI_INVENTORY_WIDGET_THEME) ?? 'dark',
  label:
    envValue(import.meta.env.VITE_KALLISTI_INVENTORY_WIDGET_LABEL) ?? 'In-stock slabs',
};
