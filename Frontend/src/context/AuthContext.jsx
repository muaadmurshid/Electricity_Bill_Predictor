import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import authService from "../services/authService";

import {
  clearStoredAuth,
  readStoredAuth,
  storeAuth,
} from "../api/axios";

const AuthContext =
  createContext(null);

export function AuthProvider({
  children,
}) {
  const [session, setSession] =
    useState(null);

  const [
    initialising,
    setInitialising,
  ] = useState(true);

  // =========================================================
  // RESTORE SAVED LOGIN SESSION
  // =========================================================
  useEffect(() => {
    const stored =
      readStoredAuth();

    if (
      stored?.token &&
      stored?.user
    ) {
      setSession(stored);
    }

    setInitialising(false);
  }, []);

  // =========================================================
  // NORMALISE BACKEND AUTH RESPONSE
  // Backend login/register response contains role
  // =========================================================
  function acceptAuthResponse(
    data
  ) {
    if (!data?.token) {
      throw new Error(
        "Authentication response did not contain a token."
      );
    }

    const nextSession = {
      token: data.token,

      user: {
        userId: data.userId,
        firstName:
          data.firstName || "",
        lastName:
          data.lastName || "",
        email:
          data.email || "",

        role:
          data.role || "USER",
      },
    };

    storeAuth(nextSession);
    setSession(nextSession);

    return nextSession;
  }

  // =========================================================
  // LOGIN
  // =========================================================
  async function login(
    credentials
  ) {
    const data =
      await authService.login(
        credentials
      );

    return acceptAuthResponse(
      data
    );
  }

  // =========================================================
  // REGISTER
  // Public registrations always become USER on backend
  // =========================================================
  async function register(
    details
  ) {
    const data =
      await authService.register(
        details
      );

    if (data?.token) {
      return acceptAuthResponse(
        data
      );
    }

    return null;
  }

  // =========================================================
  // LOGOUT
  // =========================================================
  function logout() {
    clearStoredAuth();
    setSession(null);
  }

  // =========================================================
  // ROLE HELPERS
  // =========================================================
  const role =
    session?.user?.role || null;

  const isAdmin =
    role === "ADMIN";

  const isUser =
    role === "USER";

  const value = useMemo(
    () => ({
      user:
        session?.user ?? null,

      token:
        session?.token ?? null,

      role,

      authenticated:
        Boolean(session?.token),

      isAdmin,
      isUser,

      initialising,

      login,
      register,
      logout,
    }),
    [
      session,
      role,
      isAdmin,
      isUser,
      initialising,
    ]
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside <AuthProvider>"
    );
  }

  return context;
}

export default AuthContext;