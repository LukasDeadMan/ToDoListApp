import { useEffect, useRef, useState } from "react";
import { buildLoginPayload } from "../lib/auth";
import { createFlash, getErrorMessage } from "../lib/feedback";
import { routePaths } from "../lib/router";
import { usersApi } from "../services/users";

const initialAuthState = {
  status: "booting",
  user: null,
};

export default function useAuth({ navigate, setFlash }) {
  const [authState, setAuthState] = useState(initialAuthState);
  const [pendingAction, setPendingAction] = useState("");

  const navigateRef = useRef(navigate);
  const setFlashRef = useRef(setFlash);

  useEffect(() => {
    navigateRef.current = navigate;
    setFlashRef.current = setFlash;
  }, [navigate, setFlash]);

  function pushFlash(type, message) {
    setFlashRef.current(createFlash(type, message));
  }

  function redirect(path, options = {}) {
    navigateRef.current(path, options);
  }

  useEffect(() => {
    let ignore = false;

    async function bootstrapSession() {
      try {
        const user = await usersApi.me();

        if (ignore) {
          return;
        }

        setAuthState({
          status: "authenticated",
          user,
        });
      } catch (error) {
        if (ignore) {
          return;
        }

        if (error.status === 401) {
          setAuthState({
            status: "anonymous",
            user: null,
          });
          return;
        }

        setAuthState({
          status: "anonymous",
          user: null,
        });
        pushFlash("error", "Nao foi possivel restaurar a sessao inicial.");
      }
    }

    bootstrapSession();

    return () => {
      ignore = true;
    };
  }, []);

  function expireSession(message) {
    setPendingAction("");
    setAuthState({
      status: "anonymous",
      user: null,
    });
    pushFlash("info", message);
    redirect(routePaths.login, { replace: true });
  }

  async function handleLogin(credentials) {
    setPendingAction("login");

    try {
      const response = await usersApi.login(
        buildLoginPayload(credentials.identifier, credentials.password)
      );

      setAuthState({
        status: "authenticated",
        user: response.user,
      });
      pushFlash("success", "Sessao iniciada com sucesso.");
      redirect(routePaths.tasks, { replace: true });
    } catch (error) {
      throw new Error(getErrorMessage(error, "Nao foi possivel concluir o login."));
    } finally {
      setPendingAction("");
    }
  }

  async function handleRegister(payload) {
    setPendingAction("register");

    try {
      await usersApi.register(payload);

      const loginResponse = await usersApi.login({
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
      });

      setAuthState({
        status: "authenticated",
        user: loginResponse.user,
      });
      pushFlash("success", "Conta criada e sessao iniciada.");
      redirect(routePaths.tasks, { replace: true });
    } catch (error) {
      throw new Error(getErrorMessage(error, "Nao foi possivel criar a conta agora."));
    } finally {
      setPendingAction("");
    }
  }

  async function handleLogout() {
    setPendingAction("logout");

    try {
      await usersApi.logout();
      pushFlash("info", "Sessao encerrada.");
    } catch (error) {
      if (error.status !== 401) {
        pushFlash(
          "error",
          "A sessao local foi encerrada, mas o backend nao confirmou o logout."
        );
      }
    } finally {
      setPendingAction("");
      redirect(routePaths.home, { replace: true });
      setAuthState({
        status: "anonymous",
        user: null,
      });
    }
  }

  async function handleSaveProfile(payload) {
    setPendingAction("profile");

    try {
      const response = await usersApi.update(authState.user.id, payload);

      setAuthState({
        status: "authenticated",
        user: response.user,
      });
      pushFlash("success", "Perfil atualizado.");
    } catch (error) {
      if (error.status === 401) {
        expireSession("Sua sessao expirou. Entre novamente.");
        throw new Error("Sessao expirada.");
      }

      throw new Error(getErrorMessage(error, "Nao foi possivel atualizar o perfil."));
    } finally {
      setPendingAction("");
    }
  }

  async function handleDeleteAccount() {
    setPendingAction("delete-account");

    try {
      await usersApi.delete(authState.user.id);

      redirect(routePaths.home, { replace: true });
      setAuthState({
        status: "anonymous",
        user: null,
      });
      pushFlash("info", "Conta removida com sucesso.");
    } catch (error) {
      if (error.status === 401) {
        expireSession("Sua sessao expirou. Entre novamente.");
        return;
      }

      throw new Error(getErrorMessage(error, "Nao foi possivel excluir a conta."));
    } finally {
      setPendingAction("");
    }
  }

  return {
    authState,
    pendingAction,
    expireSession,
    handleDeleteAccount,
    handleLogin,
    handleLogout,
    handleRegister,
    handleSaveProfile,
  };
}
