import Decimal from 'decimal.js';
import { AdminOrdersSearchParams, AdminOrdersSummary, OrderInput } from '../interfaces';
import { supabase } from '../supabase/client';

export const createOrder = async (order: OrderInput) => {
	// 1. Obtener el usuario autenticado + Cliente de tabla customer
	const { data, error: errorUser } = await supabase.auth.getUser();

	if (errorUser) {
		console.log(errorUser);
		throw new Error(errorUser.message);
	}

	const userId = data.user.id;

	const { data: customer, error: errorCustomer } = await supabase
		.from('customers')
		.select('id')
		.eq('user_id', userId)
		.single();

	if (errorCustomer) {
		console.log(errorCustomer);
		throw new Error(errorCustomer.message);
	}

	const customerId = customer.id;

	// 2. Verificar que haya stock suficiente para cada variante en el carrito
	for (const item of order.cartItems) {
		const { data: variantData, error: variantError } = await supabase
			.from('variants')
			.select('stock')
			.eq('id', item.variantId)
			.single();

		if (variantError) {
			console.log(variantError);
			throw new Error(variantError.message);
		}

		if (variantData.stock < item.quantity) {
			throw new Error(
				'No hay stock suficiente los artículos seleccionados'
			);
		}
	}

	// 3. Guardar la dirección del envío
	const { data: addressData, error: addressError } = await supabase
		.from('addresses')
		.insert({
			address_line1: order.address.addressLine1,
			address_line2: order.address.addressLine2,
			city: order.address.city,
			state: order.address.state,
			postal_code: order.address.postalCode,
			country: order.address.country,
			customer_id: customerId,
		})
		.select()
		.single();

	if (addressError) {
		console.log(addressError);
		throw new Error(addressError.message);
	}

	// 4. Crear la orden
	const { data: orderData, error: orderError } = await supabase
		.from('orders')
		.insert({
			customer_id: customerId,
			address_id: addressData.id,
			total_amount: order.totalAmount,
			status: 'Pending',
		})
		.select()
		.single();

	if (orderError) {
		console.log(orderError);
		throw new Error(orderError.message);
	}

	// 5. Guardar los detalles de la orden
	const orderItems = order.cartItems.map(item => ({
		order_id: orderData.id,
		variant_id: item.variantId,
		quantity: item.quantity,
		price: item.price,
	}));

	const { error: orderItemsError } = await supabase
		.from('order_items')
		.insert(orderItems);

	if (orderItemsError) {
		console.log(orderItemsError);
		throw new Error(orderItemsError.message);
	}

	// 6. Actualizar el stock de  las variantes
	for (const item of order.cartItems) {
		// Obtener el stock actual
		const { data: variantData } = await supabase
			.from('variants')
			.select('stock')
			.eq('id', item.variantId)
			.single();

		if (!variantData) {
			throw new Error('No se encontró la variante');
		}

		const newStock = variantData.stock - item.quantity;

		const { error: updatedStockError } = await supabase
			.from('variants')
			.update({
				stock: newStock,
			})
			.eq('id', item.variantId);

		if (updatedStockError) {
			console.log(updatedStockError);
			throw new Error(
				`No se pudo actualizar el stock de la variante`
			);
		}
	}

	return orderData;
};

export const getOrdersByCustomerId = async () => {
	const { data, error } = await supabase.auth.getUser();

	if (error) {
		console.log(error);
		throw new Error(error.message);
	}

	const { data: customer, error: customerError } = await supabase
		.from('customers')
		.select('id')
		.eq('user_id', data.user.id)
		.single();

	if (customerError) {
		console.log(customerError);
		throw new Error(customerError.message);
	}

	const customerId = customer.id;

	const { data: orders, error: ordersError } = await supabase
		.from('orders')
		.select('id, total_amount, status, created_at')
		.eq('customer_id', customerId)
		.order('created_at', {
			ascending: false,
		});

	if (ordersError) {
		console.log(ordersError);
		throw new Error(ordersError.message);
	}

	return orders;
};

export const getOrderById = async (orderId: number) => {
	const { data, error: errorUser } = await supabase.auth.getUser();

	if (errorUser) {
		console.log(errorUser);
		throw new Error(errorUser.message);
	}

	const { data: customer, error: customerError } = await supabase
		.from('customers')
		.select('id')
		.eq('user_id', data.user.id)
		.single();

	if (customerError) {
		console.log(customerError);
		throw new Error(customerError.message);
	}

	const customerId = customer.id;

	const { data: order, error } = await supabase
		.from('orders')
		.select(
			'*, addresses(*), customers(full_name, email), order_items(quantity, price, variants(color_name, storage, products(name, images)))'
		)
		.eq('customer_id', customerId)
		.eq('id', orderId)
		.single();

	if (error) {
		console.log(error);
		throw new Error(error.message);
	}

	return {
		customer: {
			email: order?.customers?.email,
			full_name: order.customers?.full_name,
		},
		totalAmount: order.total_amount,
		status: order.status,
		created_at: order.created_at,
		address: {
			addressLine1: order.addresses?.address_line1,
			addressLine2: order.addresses?.address_line2,
			city: order.addresses?.city,
			state: order.addresses?.state,
			postalCode: order.addresses?.postal_code,
			country: order.addresses?.country,
		},
		orderItems: order.order_items.map(item => ({
			quantity: item.quantity,
			price: item.price,
			color_name: item.variants?.color_name,
			storage: item.variants?.storage,
			productName: item.variants?.products?.name,
			productImage: item.variants?.products?.images[0],
		})),
	};
};

/* ********************************** */
/*            ADMINISTRADOR           */
/* ********************************** */
export const getAllOrders = async (params: AdminOrdersSearchParams = {}) => {
	const page = params.page ?? 1;
	const pageSize = params.pageSize ?? 10;
	const from = (page - 1) * pageSize;
	const to = from + pageSize - 1;

	let query = supabase
		.from('orders')
		.select('id, total_amount, status, created_at, customers(full_name, email)', {
			count: 'exact',
		})
		.order('created_at', { ascending: false })
		.range(from, to);

	if (params.status) query = query.eq('status', params.status);
	// orders.id es bigint: solo se filtra si la búsqueda es numérica (número
	// de pedido). Buscar por nombre de cliente requeriría un filtro sobre la
	// relación embebida `customers`, que PostgREST no soporta con `.ilike`
	// directo — fuera de alcance de esta fase.
	if (params.search && /^\d+$/.test(params.search.trim())) {
		query = query.eq('id', params.search.trim());
	}

	const { data, error, count } = await query;

	if (error) {
		console.log(error);
		throw new Error(error.message);
	}

	return { orders: data, count: count ?? 0 };
};

// Resumen para el Dashboard admin (stats reales, no simuladas): pedidos de
// hoy, ventas del mes y ticket promedio. Suma con decimal.js (no `number`
// encadenado) — regla de dinero del proyecto, ver CLAUDE.md.
export const getOrdersSummary = async (): Promise<AdminOrdersSummary> => {
	const startOfToday = new Date();
	startOfToday.setHours(0, 0, 0, 0);

	const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);

	const { data: todayOrders, error: todayError } = await supabase
		.from('orders')
		.select('id')
		.gte('created_at', startOfToday.toISOString());

	if (todayError) {
		console.log(todayError);
		throw new Error(todayError.message);
	}

	const { data: monthOrders, error: monthError } = await supabase
		.from('orders')
		.select('total_amount')
		.gte('created_at', startOfMonth.toISOString());

	if (monthError) {
		console.log(monthError);
		throw new Error(monthError.message);
	}

	const salesUsdThisMonth = monthOrders
		.reduce((acc, order) => acc.plus(new Decimal(order.total_amount)), new Decimal(0))
		.toDecimalPlaces(2)
		.toNumber();

	const avgTicketUsd =
		monthOrders.length > 0
			? new Decimal(salesUsdThisMonth).dividedBy(monthOrders.length).toDecimalPlaces(2).toNumber()
			: 0;

	return {
		ordersToday: todayOrders.length,
		salesUsdThisMonth,
		avgTicketUsd,
	};
};

export const updateOrderStatus = async ({
	id,
	status,
}: {
	id: number;
	status: string;
}) => {
	const { error } = await supabase
		.from('orders')
		.update({ status })
		.eq('id', id);

	if (error) {
		console.log(error);
		throw new Error(error.message);
	}
};

export const getOrderByIdAdmin = async (id: number) => {
	const { data: order, error } = await supabase
		.from('orders')
		.select(
			'*, addresses(*), customers(full_name, email), order_items(quantity, price, variants(color_name, storage, products(name, images)))'
		)
		.eq('id', id)
		.single();

	if (error) {
		console.log(error);
		throw new Error(error.message);
	}

	return {
		customer: {
			email: order?.customers?.email,
			full_name: order.customers?.full_name,
		},
		totalAmount: order.total_amount,
		status: order.status,
		created_at: order.created_at,
		address: {
			addressLine1: order.addresses?.address_line1,
			addressLine2: order.addresses?.address_line2,
			city: order.addresses?.city,
			state: order.addresses?.state,
			postalCode: order.addresses?.postal_code,
			country: order.addresses?.country,
		},
		orderItems: order.order_items.map(item => ({
			quantity: item.quantity,
			price: item.price,
			color_name: item.variants?.color_name,
			storage: item.variants?.storage,
			productName: item.variants?.products?.name,
			productImage: item.variants?.products?.images[0],
		})),
	};
};
