import { BookOpen, Map, Package, Settings, ShoppingCart, Tag, Truck, Users } from 'lucide-react';

export default function TutorialPage() {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', marginBottom: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <BookOpen size={32} style={{ color: 'var(--color-primary)' }} />
        </div>
        <h1 className="page-title" style={{ fontSize: '32px' }}>Guía de Uso Paso a Paso</h1>
        <p className="page-subtitle" style={{ fontSize: '16px', marginTop: '8px', lineHeight: 1.5 }}>
          Entendé la lógica del sistema para cargar tu empresa correctamente. Seguí este orden para no tener problemas.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Paso 1 */}
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--color-primary)' }}></div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0, fontSize: '20px', fontWeight: 700 }}>
              1
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={20} /> Configurá qué vas a medir
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '15px' }}>
                Antes de cargar productos, el sistema necesita saber cómo los medís.
                Andá a <strong>Configuración {'>'} Unidades de Medida</strong> y creá la unidad base (por ejemplo: "gramos", "kilos", o "litros"). 
                Esto es vital para que luego el sistema sepa calcular los pesos totales en las hojas de ruta de los camiones.
              </p>
            </div>
          </div>
        </div>

        {/* Paso 2 */}
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#8b5cf6' }}></div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', flexShrink: 0, fontSize: '20px', fontWeight: 700 }}>
              2
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={20} /> Creá tus Productos y sus "Presentaciones"
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '15px' }}>
                Andá a <strong>Productos {'>'} Nuevo Producto</strong>. Aquí hay una trampa común: el "Producto" es la entidad general (Ej: Yerba Mate), pero lo que realmente vendés son sus <strong>Presentaciones</strong> (Ej: Funda de 20 x 500g, o Caja de 10 paquetes).
                <br/><br/>
                Para cada presentación, te pediremos un <strong>Factor de Conversión</strong>.
                ¿Qué es esto? Es cuántas "Unidades Base" trae ese bulto. Si el producto base es un paquete de yerba, y vendés una caja o funda de 20 paquetes unidos, el factor es "20".
              </p>
            </div>
          </div>
        </div>

        {/* Paso 3 */}
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#0ea5e9' }}></div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', flexShrink: 0, fontSize: '20px', fontWeight: 700 }}>
              3
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} /> Registrá a tus Clientes
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '15px' }}>
                Andá a la sección <strong>Clientes</strong>. Podés hacerlo a mano (uno por uno) o usar el botón de <strong>Importar Excel/CSV</strong> si ya los tenés armados.
                <br/><br/>
                <strong>¡Importante!</strong> Es clave que coloques el Pin en el mapa de Google durante la creación. Sin la ubicación en el mapa, el sistema no sabrá asesorar al repartidor sobre el viaje geográfico.
              </p>
            </div>
          </div>
        </div>

        {/* Paso 4 */}
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#10b981' }}></div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0, fontSize: '20px', fontWeight: 700 }}>
              4
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={20} /> Automatizá los Precios Diferenciados (Opcional)
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '15px' }}>
                Seguramente a algunos clientes o "Kioscos" les cobrés el valor minorista y a los "Mayoristas" otro valor más barato.
                <br/>
                Para que la persona que tome los pedidos no tenga que memorizar nada, andá a <strong>Motor de Precios</strong> y generá reglas. Ejemplo: <em>"Si el cliente es Categoría Mayorista, hacer un Descuento Porcentual del 20% en todo el catálogo"</em>. El sistema lo hará automáticamente de ahora en más.
              </p>
            </div>
          </div>
        </div>

        {/* Paso 5 */}
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#f59e0b' }}></div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', flexShrink: 0, fontSize: '20px', fontWeight: 700 }}>
              5
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingCart size={20} /> Tomar Pedidos
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '15px' }}>
                Cuando llame un cliente o el vendedor visite el local, andá a <strong>Pedidos {'>'} Nuevo Pedido</strong>.
                Buscá al cliente y agregá los productos. El sistema calculará el total respetando las reglas de precio que configuraste antes. Al guardarlo, quedará en estado <em>Pendiente/Confirmado</em>.
              </p>
            </div>
          </div>
        </div>

        {/* Paso 6 */}
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#ef4444' }}></div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', flexShrink: 0, fontSize: '20px', fontWeight: 700 }}>
              6
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} /> Armar Ruteo para que salga el Camión
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '15px' }}>
                Ya tenés 20 pedidos listos, es hora de enviarlos. 
                Andá a <strong>Repartos {'>'} Armar Hoja de Ruta</strong>. El programa te mostrará todos los pedidos frenados. Tildá los que van a salir hoy, anotá la patente de la camioneta y guardá. 
                <br/><br/>
                Esa hoja de ruta podrá ser leída luego desde el celular por el hombre que maneje el vehículo.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
