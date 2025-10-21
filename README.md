# Aplicación de Monitoreo de Dominios y Sitios IIS

Esta aplicación web proporciona una interfaz para monitorear dominios y controlar sitios de Internet Information Services (IIS). Utiliza Server-Sent Events (SSE) para comunicación en tiempo real entre el servidor y el cliente.

## Características Principales

- **Monitoreo de Sitios IIS**: Visualización y control (encendido/apagado) de sitios web alojados en IIS.
- **Monitoreo de Dominios DNS**: Verificación de resolución DNS y validación de direcciones IP esperadas.
- **Comunicación en Tiempo Real**: Utiliza SSE (Server-Sent Events) para recibir actualizaciones en tiempo real.
- **Estadísticas de Rendimiento**: Métricas de tiempo de respuesta y disponibilidad de dominios.
- **Interfaz Responsiva**: Diseño moderno con componentes UI de Shadcn.

## Estructura de la Aplicación

La aplicación está organizada en los siguientes componentes principales:

### Interfaz de Usuario

- **Panel Principal (IISMonitor)**: Interfaz principal con pestañas para diferentes funcionalidades:
  - Lista de Sitios IIS
  - Control de Monitoreo
  - Estadísticas DNS
  - Logs del Sistema

- **Gestión de Dominios (DNSMonitorManager)**: Permite agregar, editar y eliminar dominios a monitorear, especificando la IP esperada.

### Funcionalidades Implementadas

- **Conexión en Tiempo Real**: Sistema de eventos SSE con reconexión automática.
- **Control de Sitios IIS**: Interfaz para iniciar, detener y reiniciar sitios web.
- **Monitoreo de Dominios**: Verificación de resolución DNS y validación de IPs.
- **Estadísticas**: Recopilación y visualización de métricas de rendimiento:
  - Tasa de éxito
  - Tiempo de respuesta promedio
  - Tiempo de respuesta mínimo/máximo
  - Percentil 95 de tiempo de respuesta

## Tecnologías Utilizadas

- **Frontend**: React + TypeScript + Vite
- **Comunicación**: Server-Sent Events (SSE)
- **UI Components**: Shadcn UI (basado en Tailwind CSS)
- **Estado**: React Hooks personalizados

## Hooks Personalizados

- **useMonitoringEvents**: Gestiona la conexión SSE y procesa los eventos recibidos.
- **useIISMonitor**: Proporciona funcionalidades para controlar sitios IIS.
- **useIPMonitoring**: Gestiona los datos de monitoreo de IPs.
- **useDNSStats**: Maneja las estadísticas de resolución DNS.

## Tipos de Eventos SSE

La aplicación procesa varios tipos de eventos SSE:

- `connected`: Confirmación de conexión establecida
- `initial_status`: Estado inicial del sistema de monitoreo
- `monitoring_started/stopped`: Cambios en el estado del monitoreo
- `monitoring_ip`: Resultados de verificación de IP
- `monitoring_domain_stats`: Estadísticas de un dominio específico
- `monitoring_domain_stats_cached`: Estadísticas almacenadas de múltiples dominios
- `websites_list`: Lista actualizada de sitios IIS
- `control_iis_site`: Resultado de operaciones de control en sitios IIS

## Configuración del Proyecto

Este proyecto utiliza Vite como herramienta de construcción. Para comenzar a desarrollar:

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```