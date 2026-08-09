// Datos de contacto de la agencia (Fase I del roadmap, "Datos de contacto")
// contra el backend .NET real (api/agencyContact). Mismo patrón que la tasa
// de cambio: cada actualización crea una fila nueva "vigente", no se edita
// una fila existente.
export interface AgencyContact {
	id: string;
	whatsappPhone: string;
	vigenteDesde: string;
	creadoPorAdminId: string | null;
}
