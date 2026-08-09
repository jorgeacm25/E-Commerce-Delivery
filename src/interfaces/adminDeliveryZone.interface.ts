// Zonas de entrega reales contra el backend .NET (api/province,
// api/municipality). Geografía fija (Pinar del Río, Artemisa, La Habana con
// todos sus municipios, ver DbSeeder del backend) — desde acá solo se edita
// la tarifa de domicilio por municipio, no se crean ni eliminan provincias
// ni municipios.
export interface AdminProvince {
	id: string;
	name: string;
}

export interface AdminMunicipality {
	id: string;
	name: string;
	provinceId: string;
	deliveryFeeUsd: number;
}
