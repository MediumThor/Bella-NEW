import { useEffect } from 'react';
import { quoteWidgetConfig } from '../config/kallistiWidgets';

const SCRIPT_ID = 'kallisti-quote-widget';

const { src: WIDGET_SRC, company: WIDGET_COMPANY, token: WIDGET_TOKEN, accent: WIDGET_ACCENT, label: WIDGET_LABEL } =
  quoteWidgetConfig;

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
