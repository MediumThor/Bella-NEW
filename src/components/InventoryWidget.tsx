import { useEffect } from 'react';

const SCRIPT_ID = 'kallisti-inventory-widget';

const WIDGET_SRC =
  import.meta.env.VITE_KALLISTI_INVENTORY_WIDGET_SRC ??
  'http://localhost:5173/embed/inventory-widget.js';
const WIDGET_COMPANY =
  import.meta.env.VITE_KALLISTI_INVENTORY_WIDGET_COMPANY ??
  import.meta.env.VITE_KALLISTI_WIDGET_COMPANY ??
  'bella-stone-hlzclr';
const WIDGET_TOKEN =
  import.meta.env.VITE_KALLISTI_INVENTORY_WIDGET_TOKEN ??
  'j-3nVRhNUsahA3Z4saNj6Buj15P5VOrP';
const WIDGET_THEME =
  import.meta.env.VITE_KALLISTI_INVENTORY_WIDGET_THEME ?? 'dark';
const WIDGET_LABEL =
  import.meta.env.VITE_KALLISTI_INVENTORY_WIDGET_LABEL ?? 'In-stock slabs';

function removeWidgetScript() {
  document.getElementById(SCRIPT_ID)?.remove();
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

    return removeWidgetScript;
  }, [targetId]);

  return null;
};

export default InventoryWidget;
