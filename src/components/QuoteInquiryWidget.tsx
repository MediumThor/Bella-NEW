import { useEffect } from 'react';

const SCRIPT_ID = 'kallisti-quote-widget';

const WIDGET_SRC =
  import.meta.env.VITE_KALLISTI_WIDGET_SRC ?? 'http://localhost:5173/embed/widget.js';
const WIDGET_COMPANY =
  import.meta.env.VITE_KALLISTI_WIDGET_COMPANY ?? 'bella-stone-hlzclr';
const WIDGET_TOKEN =
  import.meta.env.VITE_KALLISTI_WIDGET_TOKEN ?? 'oOteBYnNaKLRQmH7xrHWs6Sr3780j9d6';
const WIDGET_ACCENT = import.meta.env.VITE_KALLISTI_WIDGET_ACCENT ?? '#111827';
const WIDGET_LABEL = import.meta.env.VITE_KALLISTI_WIDGET_LABEL ?? 'Request a quote';

function removeWidgetDom() {
  document.getElementById(SCRIPT_ID)?.remove();
  document.getElementById('kallisti-inquiry-btn')?.remove();
  document.getElementById('kallisti-inquiry-overlay')?.remove();
}

const QuoteInquiryWidget = () => {
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return;

    const mountWidget = () => {
      if (document.getElementById(SCRIPT_ID)) return;

      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = WIDGET_SRC;
      script.setAttribute('data-company', WIDGET_COMPANY);
      script.setAttribute('data-token', WIDGET_TOKEN);
      script.setAttribute('data-accent', WIDGET_ACCENT);
      script.setAttribute('data-label', WIDGET_LABEL);
      document.body.appendChild(script);
    };

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(mountWidget, { timeout: 5000 });
    } else {
      timeoutId = setTimeout(mountWidget, 2000);
    }

    return () => {
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      removeWidgetDom();
    };
  }, []);

  return null;
};

export default QuoteInquiryWidget;
