// ===========================================
// BASE DE DATOS EN MEMORIA
// ===========================================
// Simula una base de datos
// En producción: cambiar por SQLite, PostgreSQL, etc.

import type { Usuario, Cliente, Ticket, Nota } from './soporte';
import { nanoid } from 'nanoid';

// Almacenamiento global (en memoria)
class BD {
	usuarios: Map<string, Usuario> = new Map();
	clientes: Map<string, Cliente> = new Map();
	tickets: Map<string, Ticket> = new Map();

	constructor() {
		this.inicializarDatos();
	}

	// Inicializar datos de ejemplo
	private inicializarDatos() {
		// USUARIOS DEL EQUIPO
		this.usuarios.set('usr_alejandro', {
			id: 'usr_alejandro',
			nombre: 'Alejandro (Tú)',
			email: 'alejandro@soporte.com',
			contrasena: '123456', // En producción: hash
			rol: 'admin',
			activo: true,
			fechaCreacion: new Date('2024-01-01'),
		});

		this.usuarios.set('usr_maria', {
			id: 'usr_maria',
			nombre: 'María',
			email: 'maria@soporte.com',
			contrasena: '123456',
			rol: 'presupuestador',
			activo: true,
			fechaCreacion: new Date('2024-01-15'),
		});

		this.usuarios.set('usr_carlos', {
			id: 'usr_carlos',
			nombre: 'Carlos',
			email: 'carlos@soporte.com',
			contrasena: '123456',
			rol: 'tecnico',
			activo: true,
			fechaCreacion: new Date('2024-02-01'),
		});

		// CLIENTES DE EJEMPLO
		this.clientes.set('cli_empresa1', {
			id: 'cli_empresa1',
			nombre: 'Juan García',
			email: 'juan@empresa1.com',
			telefono: '+34 666 777 888',
			empresa: 'Empresa 1 SL',
			ciudad: 'Madrid',
			fechaRegistro: new Date('2024-01-20'),
		});

		this.clientes.set('cli_empresa2', {
			id: 'cli_empresa2',
			nombre: 'Rosa Martínez',
			email: 'rosa@empresa2.com',
			telefono: '+34 666 111 222',
			empresa: 'Empresa 2 AC',
			ciudad: 'Barcelona',
			fechaRegistro: new Date('2024-02-10'),
		});

		// TICKETS DE EJEMPLO (para aprender)
		this.agregarTicket({
			clienteId: 'cli_empresa1',
			titulo: 'La computadora va lenta',
			descripcion: 'Mi PC se ha puesto muy lenta. Tarda mucho en abrir programas.',
			categoria: 'rendimiento',
			prioridad: 'media',
		});

		this.agregarTicket({
			clienteId: 'cli_empresa2',
			titulo: 'Internet no funciona',
			descripcion: 'La conexión a internet se cae constantemente.',
			categoria: 'conexion',
			prioridad: 'alta',
		});
	}

	// ============= USUARIOS =============

	obtenerUsuario(id: string): Usuario | undefined {
		return this.usuarios.get(id);
	}

	obtenerUsuarioPorEmail(email: string): Usuario | undefined {
		for (const usuario of this.usuarios.values()) {
			if (usuario.email === email) return usuario;
		}
		return undefined;
	}

	listarUsuarios(): Usuario[] {
		return Array.from(this.usuarios.values());
	}

	crearUsuario(datos: Omit<Usuario, 'id' | 'fechaCreacion'>): Usuario {
		const usuario: Usuario = {
			...datos,
			id: `usr_${nanoid(8)}`,
			fechaCreacion: new Date(),
		};
		this.usuarios.set(usuario.id, usuario);
		return usuario;
	}

	// ============= CLIENTES =============

	obtenerCliente(id: string): Cliente | undefined {
		return this.clientes.get(id);
	}

	listarClientes(): Cliente[] {
		return Array.from(this.clientes.values());
	}

	crearCliente(datos: Omit<Cliente, 'id' | 'fechaRegistro'>): Cliente {
		const cliente: Cliente = {
			...datos,
			id: `cli_${nanoid(8)}`,
			fechaRegistro: new Date(),
		};
		this.clientes.set(cliente.id, cliente);
		return cliente;
	}

	// ============= TICKETS =============

	obtenerTicket(id: string): Ticket | undefined {
		const ticket = this.tickets.get(id);
		if (ticket) {
			ticket.cliente = this.obtenerCliente(ticket.clienteId);
		}
		return ticket;
	}

	listarTickets(): Ticket[] {
		return Array.from(this.tickets.values()).map((ticket) => ({
			...ticket,
			cliente: this.obtenerCliente(ticket.clienteId),
		}));
	}

	listarTicketsDelUsuario(usuarioId: string): Ticket[] {
		return this.listarTickets().filter((t) => t.asignadoA === usuarioId);
	}

	agregarTicket(datos: {
		clienteId: string;
		titulo: string;
		descripcion: string;
		categoria: Ticket['categoria'];
		prioridad: Ticket['prioridad'];
	}): Ticket {
		const ticket: Ticket = {
			id: `tkt_${nanoid(8)}`,
			clienteId: datos.clienteId,
			titulo: datos.titulo,
			descripcion: datos.descripcion,
			categoria: datos.categoria,
			prioridad: datos.prioridad,
			estado: 'nuevo',
			fechaCreacion: new Date(),
			fechaActualizacion: new Date(),
			notas: [],
		};
		this.tickets.set(ticket.id, ticket);
		return ticket;
	}

	actualizarTicket(id: string, cambios: Partial<Ticket>): Ticket | undefined {
		const ticket = this.obtenerTicket(id);
		if (!ticket) return undefined;

		const actualizado: Ticket = {
			...ticket,
			...cambios,
			id: ticket.id, // No permitir cambiar ID
			fechaActualizacion: new Date(),
		};
		this.tickets.set(id, actualizado);
		return actualizado;
	}

	// Asignar ticket a un usuario
	asignarTicket(ticketId: string, usuarioId: string, rol?: Ticket['asignadoUnidadA']): Ticket | undefined {
		return this.actualizarTicket(ticketId, {
			asignadoA: usuarioId,
			asignadoUnidadA: rol,
			estado: 'en-revision',
		});
	}

	// Buscar tickets similares por descripción (búsqueda básica)
	buscarSimilares(texto: string, excluirId?: string): Ticket[] {
		const palabras = texto.toLowerCase().split(/\s+/);
		const tickets = this.listarTickets();

		return tickets
			.filter((t) => {
				if (excluirId && t.id === excluirId) return false;
				if (t.estado === 'cerrado' || t.estado === 'resuelto') {
					const contenido = `${t.titulo} ${t.descripcion}`.toLowerCase();
					// Contar coincidencias de palabras
					const coincidencias = palabras.filter((p) => contenido.includes(p)).length;
					return coincidencias >= 2;
				}
				return false;
			})
			.slice(0, 5); // Top 5 resultados
	}

	// Agregar nota a un ticket
	agregarNota(
		ticketId: string,
		usuarioId: string,
		usuarioNombre: string,
		contenido: string,
		esPublica: boolean = false,
	): Ticket | undefined {
		const ticket = this.obtenerTicket(ticketId);
		if (!ticket) return undefined;

		const nota: Nota = {
			id: `nota_${nanoid(8)}`,
			autorId: usuarioId,
			autorNombre: usuarioNombre,
			contenido,
			fecha: new Date(),
			esPublica,
		};

		ticket.notas.push(nota);
		this.actualizarTicket(ticketId, { notas: ticket.notas });
		return ticket;
	}

	// Resolver un ticket
	resolverTicket(
		ticketId: string,
		usuarioId: string,
		solucion: string,
		tiempoMinutos: number = 0,
	): Ticket | undefined {
		return this.actualizarTicket(ticketId, {
			estado: 'resuelto',
			resueltoPor: usuarioId,
			solucion,
			tiempoResolucion: tiempoMinutos,
			fechaResolucion: new Date(),
		});
	}

	// Generar presupuesto
	generarPresupuesto(ticketId: string, usuarioId: string, monto: number, razon: string): Ticket | undefined {
		return this.actualizarTicket(ticketId, {
			estado: 'presupuestando',
			presupuestadoPor: usuarioId,
			presupuesto: monto,
			razonPresupuesto: razon,
		});
	}
}

// Exportar instancia única (singleton)
export const bd = new BD();

// Función auxiliar para verificar login
export function verificarLogin(email: string, contrasena: string): Usuario | null {
	const usuario = bd.obtenerUsuarioPorEmail(email);
	if (usuario && usuario.contrasena === contrasena && usuario.activo) {
		return usuario;
	}
	return null;
}
