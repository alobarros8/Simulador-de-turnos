// ===========================================
// TIPOS PARA EL SISTEMA DE SOPORTE
// ===========================================

// ROLES en el sistema
export type Rol = 'admin' | 'tecnico' | 'presupuestador';

// ESTADOS de un ticket
export type EstadoTicket = 'nuevo' | 'en-revision' | 'presupuestando' | 'resolviendo' | 'resuelto' | 'cerrado';

// USUARIO - Miembro del equipo
export interface Usuario {
	id: string;
	nombre: string;
	email: string;
	contrasena: string; // En producción usar hash
	rol: Rol;
	activo: boolean;
	fechaCreacion: Date;
}

// CLIENTE - Persona que reporta el problema
export interface Cliente {
	id: string;
	nombre: string;
	email: string;
	telefono: string;
	empresa?: string;
	ciudad?: string;
	fechaRegistro: Date;
}

// TICKET - Caso de soporte
export interface Ticket {
	id: string;
	
	// Información del cliente
	clienteId: string;
	cliente?: Cliente;
	
	// Detalles del problema
	titulo: string;
	descripcion: string;
	categoria: 'virus' | 'rendimiento' | 'conexion' | 'hardware' | 'software' | 'otro';
	prioridad: 'baja' | 'media' | 'alta' | 'urgente';
	
	// Control de flujo
	estado: EstadoTicket;
	asignadoA?: string; // ID del usuario asignado
	asignadoUnidadA?: Rol; // Tipo de rol al que se delega
	
	// Similitud
	ticketSimilarId?: string; // ID del ticket similar anterior
	porcentajeSimilitud?: number; // 0-100
	
	// Presupuesto
	presupuesto?: number;
	razonPresupuesto?: string;
	presupuestadoPor?: string; // ID del usuario
	
	// Solución
	solucion?: string;
	resueltoPor?: string; // ID del usuario
	tiempoResolucion?: number; // minutos
	
	// Campos de tiempo
	fechaCreacion: Date;
	fechaActualizacion: Date;
	fechaResolucion?: Date;
	
	// Notas internas
	notas: Nota[];
	
	// Retroalimentación
	calificacion?: number; // 1-5
	comentarioCliente?: string;
}

// NOTA - Comentario interno en un ticket
export interface Nota {
	id: string;
	autorId: string;
	autorNombre: string;
	contenido: string;
	fecha: Date;
	esPublica: boolean; // Si el cliente puede verla
}
