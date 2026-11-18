import { useState } from "react";
import axios from "axios";
import client from "../api/client";
import { AuthContext } from "./authContextValue";

const demoAdmin = {
  id: "admin-demo",
  name: "Northstar Admin",
  email: "admin@northstar.local",
  role: "admin",
  active: true,
};
const demoAdminEmails = new Set([demoAdmin.email, "admin@example.com"]);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const loading = false;

  const saveSession = (account) => {
    setUser(account);
    localStorage.setItem("user", JSON.stringify(account));
    return account;
  };

  const login = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      throw new Error("Enter your email address and password.");
    }

    if (demoAdminEmails.has(normalizedEmail)) {
      return saveSession(demoAdmin);
    }

    try {
      const { data: accounts } = await client.get("/users", {
        params: { email: normalizedEmail },
      });
      const account = accounts[0];
      if (!account) {
        throw new Error("No account found. Create an account first.");
      }
      if (account.active === false) {
        throw new Error("This account has been deactivated.");
      }
      return saveSession(account);
    } catch (error) {
      if (!axios.isAxiosError(error)) throw error;
      if (error.response) {
        throw new Error(
          error.response.data?.message ||
            error.response.data?.detail ||
            "The local API could not process the sign-in request.",
        );
      }
      throw new Error(
        "Could not reach the local API. Start the project with npm.cmd start and try again.",
      );
    }
  };

  const register = async (payload) => {
    const email = payload.email.trim().toLowerCase();
    if (!payload.name.trim() || !email || !payload.password) {
      throw new Error("Enter your name, email address, and password.");
    }

    try {
      const { data: accounts } = await client.get("/users", {
        params: { email },
      });
      if (accounts.length > 0) {
        throw new Error("An account with this email already exists.");
      }

      const { data: account } = await client.post("/users", {
        id: crypto.randomUUID(),
        name: payload.name.trim(),
        email,
        role: "customer",
        active: true,
      });
      return saveSession(account);
    } catch (error) {
      if (!axios.isAxiosError(error)) throw error;
      if (error.response) {
        throw new Error(
          error.response.data?.message ||
            error.response.data?.detail ||
            "The local API could not process the registration request.",
        );
      }
      throw new Error(
        "Could not reach the local API. Start the project with npm.cmd start and try again.",
      );
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}