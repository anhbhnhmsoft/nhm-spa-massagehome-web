"use client";

import { ReactNode, useEffect } from "react";
import { useProfileMutation } from "@/features/auth/hooks/use-mutation";
import useToast from "@/features/app/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { _AuthStatus } from "@/features/auth/const";
import useAuthStore from "../store/auth-store";

export const HydrateAuthProvider = ({ children }: { children: ReactNode }) => {
  const hydrate = useAuthStore((state) => state.hydrate);
  const status = useAuthStore((state) => state.status);
  const setUser = useAuthStore((state) => state.setUser);
  const setStatus = useAuthStore((state) => state.setStatus);
  const logout = useAuthStore((state) => state.logout);

  const { mutate } = useProfileMutation();
  const { error } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const validateToken = async () => {
      if (status === _AuthStatus.INITIAL) {
        await hydrate();
        return;
      }

      if (status === _AuthStatus.HYDRATE) {
        mutate(undefined, {
          onSuccess: async (res) => {
            await setUser(res.data.user);
            setStatus(_AuthStatus.AUTHORIZED);
          },
          onError: async () => {
            error({ message: t("common_error.invalid_or_expired_token") });
            await logout();
          },
        });
      }
    };

    validateToken();
  }, [status]);

  return children;
};
