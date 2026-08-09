// Tipos TS que reflejan los DTOs del backend .NET
// (Almacen-Delivery-Home_Api_new, AlmacenApi.Presentation, api/*).
//
// El backend usa System.Text.Json con la política por defecto de ASP.NET
// Core (camelCase en el body JSON), sin importar el casing de las
// propiedades en C# — por eso estas interfaces están todas en camelCase
// aunque en el DTO original algunas propiedades empiecen en mayúscula
// (ej. `Name` en C# -> `name` en el JSON de la respuesta).
//
// decimal (C#) llega como `number` en JSON; si se necesita precisión
// decimal en cálculos encadenados en el frontend (totales, comisiones),
// usar decimal.js sobre este `number` en el punto de cálculo, igual que ya
// hace src/store/cart.store.ts — nunca operar el number crudo en cadena.

export interface CategoryResultDto {
	id: string | null;
	name: string | null;
	slug: string | null;
}

export interface ProvinceResultDto {
	id: string | null;
	name: string | null;
}

// Sin provinceName: el backend no incluye el nombre de la provincia en la
// respuesta (no hace Include() de la navegación) — se resuelve cruzando con
// GET /api/province por provinceId, igual que categoryId en productos.
export interface MunicipalityResultDto {
	id: string | null;
	name: string | null;
	provinceId: string | null;
	deliveryFeeUsd: number;
}

export interface ProductResultDto {
	id: string;
	name: string;
	quantity: number;
	unity: string;
	salePriceUsd: number;
	discountPriceUsd: number | null;
	endDate: string; // ISO date
	nameUserorAdmin: string | null;
	categoryId: string;
	categoryName: string | null;
	provider: string;
	updateAt: string; // ISO date
	images: string[];
}

export interface ProductComboResultDto {
	id: string | null;
	nameProduct: string | null;
	quantity: number;
	unity: string | null;
}

export interface ComboResultDto {
	id: string;
	name: string;
	salePriceUsd: number;
	discountPriceUsd: number | null;
	products: ProductComboResultDto[];
	nameUserOrAdmin: string | null;
}

export interface CustomerResultDto {
	id: string | null;
	fullName: string | null;
	email: string | null;
	phone: string | null;
	status: string | null;
	createdAt: string | null;
	updatedAt: string | null;
}

export interface CustomerAddressResultDto {
	id: string | null;
	customerId: string | null;
	label: string | null;
	province: string | null;
	municipality: string | null;
	addressLine: string | null;
	referenceNotes: string | null;
	isDefault: boolean | null;
	createdAt: string | null;
	updatedAt: string | null;
}

export interface CustomerRecipientResultDto {
	id: string | null;
	customerId: string | null;
	fullName: string | null;
	phone: string | null;
	nationalId: string | null;
	province: string | null;
	municipality: string | null;
	addressLine: string | null;
	notes: string | null;
	isDefault: boolean | null;
	createdAt: string | null;
	updatedAt: string | null;
}

export interface ExchangeRateResultDto {
	id: string | null;
	valorCupPorUsd: number | null;
	vigenteDesde: string | null;
	creadoPorAdminId: string | null;
}

export interface FavoriteResultDto {
	id: string | null;
	customerId: string | null;
	productId: string | null;
	productName: string | null;
	createdAt: string | null;
}

export interface OrderItemResultDto {
	id: string | null;
	productId: string | null;
	productName: string | null;
	quantity: number | null;
	price: number | null;
}

export type OrderStatus = 'Pending' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderResultDto {
	id: string | null;
	customerId: string | null;
	sellerId: string | null;
	status: OrderStatus | string | null;
	totalAmount: number | null;
	addressLine1: string | null;
	addressLine2: string | null;
	city: string | null;
	state: string | null;
	postalCode: string | null;
	country: string | null;
	createdAt: string | null;
	items: OrderItemResultDto[] | null;
}

// Input para crear un pedido: el precio y el total NO se envían, los
// calcula el servidor a partir de ProductEntity.SalePriceUsd.
export interface OrderItemInput {
	productId: string;
	quantity: number;
}

export interface CreateOrderInput {
	customerId: string;
	sellerId?: string | null;
	addressLine1: string;
	addressLine2?: string | null;
	city: string;
	state: string;
	postalCode?: string | null;
	country: string;
	items: OrderItemInput[];
}

export interface PaymentAccountResultDto {
	id: string | null;
	tipo: string | null;
	titular: string | null;
	referencia: string | null;
	activa: boolean | null;
	prioridad: number | null;
	createdAt: string | null;
}

export interface PaymentProofResultDto {
	id: string | null;
	orderId: string | null;
	paymentAccountId: string | null;
	imagenUrl: string | null;
	estado: string | null;
	operadorId: string | null;
	notaOperador: string | null;
	createdAt: string | null;
	reviewedAt: string | null;
}

export interface SupportCaseResultDto {
	id: string | null;
	customerId: string | null;
	category: string | null;
	subject: string | null;
	message: string | null;
	orderReference: string | null;
	status: string | null;
	createdAt: string | null;
	updatedAt: string | null;
}

export interface UserResultDto {
	id: string | null;
	fullName: string | null;
	userName: string | null;
	createdAt: string | null;
	updatedAt: string | null;
}

export interface AdminResultDto {
	id: string | null;
	userName: string | null;
	fullName: string | null;
	createdAt: string | null;
	updatedAt: string | null;
}

// Movimiento del histórico de almacén (api/history). El backend no expone
// un DTO propio para esto — devuelve la entidad directamente. Nombres de
// campo confirmados contra la respuesta real (no coinciden con
// HistoryEntity.Type en C#, que se serializa como `actionType`).
export interface HistoryEntry {
	id: string;
	actionType: 'Creaciones' | 'Modificaciones' | 'Eliminaciones' | 'Entrada' | 'Salida' | string;
	userOrAdminUserName: string;
	description: string;
	createdAt: string;
}

// Fases E-H (Vendedores/Comisiones, Trabajadores, Remesas, Contabilidad),
// módulos nuevos construidos en el backend .NET real
// (Almacen-Delivery-Home_Api_new) para esta fase del panel admin.
export interface SellerResultDto {
	id: string | null;
	fullName: string | null;
	phone: string | null;
	commissionPercentage: number | null;
	active: boolean | null;
	createdAt: string | null;
}

export interface CommissionResultDto {
	id: string | null;
	sellerId: string | null;
	orderId: string | null;
	amountUsd: number | null;
	status: 'Pending' | 'Settled' | string | null;
	settledAt: string | null;
	createdAt: string | null;
}

export interface WorkerResultDto {
	id: string | null;
	fullName: string | null;
	role: string | null;
	pendingAmountUsd: number | null;
	active: boolean | null;
	createdAt: string | null;
}

export interface RemittanceResultDto {
	id: string | null;
	customerId: string | null;
	recipientName: string | null;
	amountUsd: number | null;
	amountCup: number | null;
	status: 'Pending' | 'Sent' | 'Delivered' | string | null;
	notes: string | null;
	createdAt: string | null;
}

export interface ExpenseResultDto {
	id: string | null;
	description: string | null;
	amountUsd: number | null;
	amountCup: number | null;
	category: string | null;
	date: string | null;
	createdAt: string | null;
}
