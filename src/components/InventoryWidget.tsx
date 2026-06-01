import { useEffect, useState } from 'react';
import { INVENTORY_EMBED_URL } from '../config/kallistiWidgets';

const InventoryWidget = () => {
  const [src, setSrc] = useState<string | null>(null);

  // Defer iframe navigation until after mount so Chrome loads it in a visible,
  // non-animated parent (opacity:0 / backdrop-filter ancestors break iframes).
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      setSrc(INVENTORY_EMBED_URL);
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <iframe
      id="kallisti-inv-iframe"
      className="inventory-widget-iframe"
      title="In-stock slabs"
      src={src ?? undefined}
    />
  );
};

export default InventoryWidget;
