// Cuentas de staff/admin del backend .NET (api/admin, user) — no confundir
// con AdminProduct ni con el Profile de la sesión propia (auth.interface.ts).
// El backend modela dos identidades separadas con permisos distintos: Admin
// (raíz, gestiona otros Admin/User) y User (staff normal). Ver
// src/lib/roleGuards.ts y Profile.accountType para cómo se resuelve cuál es
// cuál para la sesión actual.
export interface AdminAccount {
	id: string;
	fullName: string;
	userName: string;
	accountType: 'admin' | 'user';
	createdAt: string | null;
	updatedAt: string | null;
}

export interface AdminAccountInput {
	fullName: string;
	userName: string;
	password: string;
	accountType: 'admin' | 'user';
}
