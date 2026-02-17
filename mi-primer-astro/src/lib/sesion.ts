// ===========================================
// UTILIDADES DE SESIÓN
// ===========================================
// Manejo básico de sesiones con cookies

import type { Usuario } from '../types/soporte';

const SESSION_COOKIE_NAME = 'soporte_session';

// Interfaz de sesión
export interface Sesion {
	usuarioId: string;
	usuario: Usuario;
	inicioSesion: Date;
}

// Obtener la sesión desde las cookies
export function obtenerSesion(cookies: any): Sesion | null {
	try {
		const sessionData = cookies.get(SESSION_COOKIE_NAME)?.value;
		if (!sessionData) return null;

		// En producción, validar firma JWT
		const datos = JSON.parse(sessionData);
		return datos;
	} catch (e) {
		return null;
	}
}

// Crear una sesión
export function crearSesion(usuario: Usuario, cookies: any): void {
	const sesion: Sesion = {
		usuarioId: usuario.id,
		usuario,
		inicioSesion: new Date(),
	};

	cookies.set(SESSION_COOKIE_NAME, JSON.stringify(sesion), {
		httpOnly: true,
		secure: false, // En producción: true
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 7, // 7 días
		path: '/',
	});
}

// Destruir sesión (logout)
export function destruirSesion(cookies: any): void {
	cookies.delete(SESSION_COOKIE_NAME);
}

// Verificar si hay sesión activa
export function tieneSesion(cookies: any): boolean {
	return !!obtenerSesion(cookies);
}
