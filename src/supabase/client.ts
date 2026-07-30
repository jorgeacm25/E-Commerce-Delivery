import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Database } from './supabase';

const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;
const supabaseUrl = import.meta.env.VITE_PROJECT_URL_SUPABASE;

const hasSupabaseConfig = Boolean(supabaseUrl && supabaseKey);

type OfflineQueryResult = { data: unknown; error: null; count: number };

const createOfflineQuery = (table: string) => {
	const responseData = table === 'products' || table === 'combos' ? [] : null;

	const query = {
		select: () => query,
		order: () => query,
		range: () => query,
		limit: () => query,
		eq: () => query,
		in: () => query,
		ilike: () => query,
		insert: () => query,
		update: () => query,
		delete: () => query,
		maybeSingle: async () => ({ data: null, error: null }),
		single: async () => ({ data: null, error: null }),
		then: <TResult1 = OfflineQueryResult, TResult2 = never>(
			onFulfilled?:
				| ((value: OfflineQueryResult) => TResult1 | PromiseLike<TResult1>)
				| null,
			onRejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
		) =>
			Promise.resolve({ data: responseData, error: null, count: 0 }).then(
				onFulfilled,
				onRejected
			),
	};

	return query;
};

const offlineSupabase = {
	auth: {
		getSession: async () => ({
			data: { session: null },
			error: null,
		}),
		getUser: async () => ({
			data: {
				user: {
					id: 'offline-user',
				},
			},
			error: null,
		}),
		signInWithPassword: async () => ({
			data: null,
			error: { message: 'Supabase no configurado' },
		}),
		signUp: async () => ({
			data: null,
			error: { message: 'Supabase no configurado' },
		}),
		signOut: async () => ({
			error: null,
		}),
		onAuthStateChange: () => ({
			data: {
				subscription: {
					unsubscribe: () => undefined,
				},
			},
		}),
	},
	from: (table: string) => createOfflineQuery(table),
	storage: {
		from: () => ({
			upload: async () => ({ data: { path: '' }, error: null }),
			getPublicUrl: () => ({ data: { publicUrl: '' } }),
			remove: async () => ({ data: null, error: null }),
			createSignedUrl: async () => ({
				data: { signedUrl: '' },
				error: null,
			}),
		}),
	},
} as unknown as SupabaseClient<Database>;

export const supabase = hasSupabaseConfig
	? createClient<Database>(supabaseUrl, supabaseKey)
	: offlineSupabase;

if (!hasSupabaseConfig) {
	console.warn(
		'Supabase no está configurado. La app se ejecutará en modo sin backend hasta definir VITE_PROJECT_URL_SUPABASE y VITE_SUPABASE_API_KEY.'
	);
}