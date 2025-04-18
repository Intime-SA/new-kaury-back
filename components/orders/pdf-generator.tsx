import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { OrderPDF } from "./order-pdf"
import type { OrderItem } from "@/types/orders"
import type { OrderStatusType } from "@/app/components/OrderStatus"

interface Order {
  id: string
  numberOrder: string
  date: any
  total: number
  orderItems: OrderItem[]
  infoEntrega: {
    name: string
    apellido: string
    telefono: string
    email: string
    calle: string
    numero: string
    ciudad: string
    estado: string
    codigoPostal: string
    pisoDpto: string
  }
  status: OrderStatusType
  tipoEnvio: number
  envioSeleccionado?: string
}

export default function PDFGenerator({ order }: { order: Order }) {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isDataComplete = Boolean(
    order &&
    order.numberOrder &&
    order.orderItems?.length > 0 &&
    order.infoEntrega?.name &&
    order.infoEntrega?.apellido
  );

  const handleGeneratePDF = async () => {
    if (!isDataComplete) return;

    try {
      setIsLoading(true);
      setError(null);

      // Importar dinámicamente react-pdf
      const ReactPDF = await import('@react-pdf/renderer');
      
      // Generar el PDF
      const blob = await ReactPDF.pdf(<OrderPDF order={order} />).toBlob();
      
      // Crear URL y descargar
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orden-${order.numberOrder}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generando PDF:', err);
      setError(err instanceof Error ? err : new Error('Error generando PDF'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient || !isDataComplete) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        disabled
        title={!isClient ? "Cargando..." : "Faltan datos necesarios para generar el PDF"}
      >
        <Download className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      disabled={isLoading}
      onClick={handleGeneratePDF}
      title={error ? "Error al generar PDF" : isLoading ? "Generando PDF..." : "Descargar PDF"}
    >
      <Download className="h-4 w-4" />
    </Button>
  );
} 