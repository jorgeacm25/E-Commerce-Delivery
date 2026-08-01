import { Profile } from '../interfaces';

// Roles que pueden entrar a /admin. El backend .NET no distingue
// admin/operador todavía (solo Customer vs. staff — Admin y User, ver
// src/api/auth.ts), así que por ahora cualquier identidad 'staff' entra.
// Cuando el backend tenga permisos por endpoint (ver tarea de reforzar
// autorización en Almacen-Delivery-Home_Api_new), esto puede refinarse sin
// tocar RequireAuth.
export const ADMIN_ACCESS_ROLES: Profile['role'][] = ['staff'];

export const hasRole = (
	role: Profile['role'] | null | undefined,
	allowedRoles: Profile['role'][]
): boolean => !!role && allowedRoles.includes(role);

export const hasAdminAccess = (role: Profile['role'] | null | undefined): boolean =>
	hasRole(role, ADMIN_ACCESS_ROLES);
