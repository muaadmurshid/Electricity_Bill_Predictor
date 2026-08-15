import { createContext, useContext, useEffect, useMemo, useState } from "react";
import authService from "../services/authService";
import { clearStoredAuth, readStoredAuth, storeAuth } from "../api/axios";

/**
 * Holds the logged-in user for the whole app.
 * The user's identity comes from the JWT on the backend — nothing here
 * is trusted for authorisation, it only drives what the UI shows.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null); // { token, user }
  const [initialising, setInitialising] = useState(true);

  // Restore the session on a page refresh.
  useEffect(() => {
    const stored = readStoredAuth();
    if (stored?.token) setSession(stored);
    setInitialising(false);
  }, []);

  /** Turns a login/register response into the session we keep. */
  function acceptAuthResponse(data) {
    const next = {
      token: data.token,
      user: {
        userId: data.userId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      },
    };
    storeAuth(next);
    setSession(next);
    return next;
  }

  async function login(credentials) {
    const data = await authService.login(credentials);
    return acceptAuthResponse(data);
  }

  async function register(details) {
    const data = await authService.register(details);
    // Registration also returns a token, so the user goes straight in.
    if (data?.token) return acceptAuthResponse(data);
    return null;
  }

  function logout() {
    clearStoredAuth();
    setSession(null);
  }

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      authenticated: Boolean(session?.token),
      initialising,
      login,
      register,
      logout,
    }),
    [session, initialising]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export default AuthContext;
