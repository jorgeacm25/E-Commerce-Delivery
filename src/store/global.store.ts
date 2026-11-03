import { create, StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';

type SheetContent = 'cart' | 'search' | null;

export interface GlobalState {
	isSheetOpen: boolean;
	sheetContent: SheetContent;
	activeNavMobile: boolean;
	isLoginModalOpen: boolean;
	/** Ruta a la que se navega tras iniciar sesión (null = quedarse donde está). */
	loginRedirectTo: string | null;

	openSheet: (content: SheetContent) => void;
	closeSheet: () => void;
	setActiveNavMobile: (active: boolean) => void;
	openLoginModal: (redirectTo?: string) => void;
	closeLoginModal: () => void;
}

const storeApi: StateCreator<GlobalState> = set => ({
	isSheetOpen: false,
	sheetContent: null,
	activeNavMobile: false,
	isLoginModalOpen: false,
	loginRedirectTo: null,

	openSheet: content => {
		set({ isSheetOpen: true, sheetContent: content });
	},
	closeSheet: () => {
		set({ isSheetOpen: false, sheetContent: null });
	},
	setActiveNavMobile: active => {
		set({ activeNavMobile: active });
	},
	openLoginModal: redirectTo => {
		set({ isLoginModalOpen: true, loginRedirectTo: redirectTo ?? null });
	},
	closeLoginModal: () => {
		set({ isLoginModalOpen: false, loginRedirectTo: null });
	},
});

export const useGlobalStore = create<GlobalState>()(
	devtools(storeApi)
);
