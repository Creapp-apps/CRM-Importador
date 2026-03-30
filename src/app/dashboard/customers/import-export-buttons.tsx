'use client';

import { useState, useRef } from 'react';
import { Download, Upload, FileSpreadsheet } from 'lucide-react';

export default function ImportExportButtons() {
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const csvContent = "tipo_cliente,razon_social,nombre_fantasia,cuit,email,telefono,direccion,ciudad,provincia,codigo_postal\nBUSINESS,Ejemplo S.A.,Ejemplo Fantasia,30-12345678-9,info@ejemplo.com,1144445555,Av Siempre Viva 123,CABA,CABA,1000";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "plantilla_clientes.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/customers/export');
      if (!res.ok) throw new Error('Error al generar la exportación');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clientes_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      alert("Hubo un error al exportar la lista de clientes.");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      
      const res = await fetch('/api/customers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent: text }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al importar archivo');
      }

      alert(data.message || 'Importación exitosa');
      
      // Reload page to reflect new data
      window.location.reload();
      
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error integrando el archivo CSV';
      alert(`Fallo la importación: ${msg}`);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <button 
        onClick={handleDownloadTemplate}
        className="btn btn-secondary" 
        title="Descargar plantilla CSV modelo"
        type="button"
      >
        <FileSpreadsheet size={16} />
        <span className="hide-on-mobile">Plantilla</span>
      </button>
      
      <button 
        onClick={handleImportClick}
        className="btn btn-secondary"
        type="button"
        disabled={importing}
      >
        <Upload size={16} />
        <span className="hide-on-mobile">{importing ? 'Importando...' : 'Importar'}</span>
      </button>
      <input 
        type="file" 
        accept=".csv" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange}
      />

      <button 
        onClick={handleExport}
        className="btn btn-secondary"
        type="button"
      >
        <Download size={16} />
        <span className="hide-on-mobile">Exportar</span>
      </button>
    </>
  );
}
