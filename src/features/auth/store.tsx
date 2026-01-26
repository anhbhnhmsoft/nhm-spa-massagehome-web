import {_AuthStatus} from '@/features/auth/const';
import {AuthData, User} from '@/features/auth/types';
import {create} from 'zustand';
import {SecureStorage, Storage} from '@/lib/storages';
import {_StorageKey} from '@/lib/storages/key';
import {persist, createJSONStorage} from 'zustand/middleware';

export interface IAuthStore {
    status: _AuthStatus;
    token: string | null;
    user: User | null;
    _hydrated: boolean;

    phone_authen: string | null;
    expire_minutes: number | null;
    token_register: string | null;

    login: (data: AuthData) => void;
    logout: () => void;
    hydrate: () => void;
    setUser: (user: User) => void;

    setPhoneAuthen: (phone: string) => void;
    setExpireMinutes: (expire_minutes: number | null) => void;
    setTokenRegister: (token: string) => void;


}

const useAuthStore = create<IAuthStore>()(
    persist(
        (set) => ({
            status: _AuthStatus.UNAUTHORIZED,
            token: null,
            user: null,
            _hydrated: false,

            phone_authen: null,
            expire_minutes: null,
            token_register: null,


            login: (data) => {
                SecureStorage.setItem(_StorageKey.SECURE_AUTH_TOKEN, data.token);
                Storage.setItem(_StorageKey.USER_LOGIN, data.user);
                set({user: data.user, token: data.token, status: _AuthStatus.AUTHORIZED});
            },
            logout: () => {
                SecureStorage.removeItem(_StorageKey.SECURE_AUTH_TOKEN);
                Storage.removeItem(_StorageKey.USER_LOGIN);
                set({user: null, token: null, status: _AuthStatus.UNAUTHORIZED});
            },
            hydrate: async () => {
                const token = SecureStorage.getItem<string>(_StorageKey.SECURE_AUTH_TOKEN);
                const user = Storage.getItem<User>(_StorageKey.USER_LOGIN);
                if (user && token) {
                    set({user: user, token, status: _AuthStatus.AUTHORIZED});
                } else {
                    set({user: null, token: null, status: _AuthStatus.UNAUTHORIZED});
                }
                set({_hydrated: true});
            },
            setUser: async (user: User | null) => {
                Storage.setItem(_StorageKey.USER_LOGIN, user);
                set({user});
            },

            setPhoneAuthen: async (phone: string) => {
                set({phone_authen: phone});
            },
            setExpireMinutes: async (expire_minutes: number | null) => {
                set({expire_minutes});
            },
            setTokenRegister: async (token: string) => {
                set({token_register: token});
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage), // Hoặc SecureStorage của bạn
            skipHydration: true, // QUAN TRỌNG: Để tránh lỗi Hydration của Next.js
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                status: state.status
            }),
        }
    )
);

export default useAuthStore;
