import { useEffect } from 'react';
import { inventoryWidgetConfig } from '../config/kallistiWidgets';

const SCRIPT_ID = 'kallisti-inventory-widget';

const {
  src: WIDGET_SRC,
  company: WIDGET_COMPANY,
  token: WIDGET_TOKEN,
  theme: WIDGET_THEME,
  label: WIDGET_LABEL,
} = inventoryWidgetConfig;

function removeWidgetDom(targetId: string) {
  document.getElementById(SCRIPT_ID)?.remove();
  document.getElementById('kallisti-inv-embed')?.remove();
  document.getElementById(targetId)?.replaceChildren();
}

interface InventoryWidgetProps {
  targetId?: string;
}

const InventoryWidget = ({ targetId = 'in-stock-slabs' }: InventoryWidgetProps) => {
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return;
    if (!document.getElementById(targetId)) return;

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = WIDGET_SRC;
    script.setAttribute('data-company', WIDGET_COMPANY);
    script.setAttribute('data-token', WIDGET_TOKEN);
    script.setAttribute('data-theme', WIDGET_THEME);
    script.setAttribute('data-target', `#${targetId}`);
    script.setAttribute('data-preload', 'true');
    script.setAttribute('data-label', WIDGET_LABEL);
    document.body.appendChild(script);

    return () => removeWidgetDom(targetId);
  }, [targetId]);

  return null;
};

export default InventoryWidget;
