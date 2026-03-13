import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
	? createClient(supabaseUrl, supabaseAnonKey, {
			auth: {
				persistSession: false,
				autoRefreshToken: true,
				detectSessionInUrl: true,
			},
		})
	: null;

export const assertSupabaseConfigured = () => {
	if (!supabase) {
		throw new Error('Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente.');
	}
	return supabase;
};

export const createIsolatedSupabaseClient = () => {
	if (!isSupabaseConfigured) {
		throw new Error('Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente.');
	}

	return createClient(supabaseUrl, supabaseAnonKey, {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
			detectSessionInUrl: false,
		},
	});
};