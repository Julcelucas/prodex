import React, { createContext, useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const AuthContext = createContext();

export const generateCompanyId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PRODEX-${result}`;
};

export const validateCompanyId = (companyId) => {
  return /^PRODEX-[A-Z0-9]{5}$/.test(companyId);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const logAuthError = (scope, error, extra = {}) => {
    console.error(`[AuthContext:${scope}]`, {
      message: error?.message || error,
      ...extra,
    });
  };

  const normalizeEmail = (value) => (value || "").trim().toLowerCase();
  const normalizeName = (value) => (value || "").trim().replace(/\s+/g, " ");
  const normalizePhone = (value) => (value || "").replace(/[^0-9+]/g, "");

  const isAllowedRole = (userType, expectedType) => {
    if (!expectedType) return true;

    if (expectedType === "admin") {
      return userType === "admin";
    }

    return userType === expectedType;
  };

  // =========================
  // BUSCAR PERFIL
  // =========================

  const fetchUser = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) return null;
    return data;
  };

  // =========================
  // BUSCAR EMPRESA
  // =========================

  const fetchCompany = async (companyId) => {
    if (!companyId) return null;

    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single();

    if (error) return null;
    return data;
  };

  const fetchCompanyByCode = async (companyCode) => {
    const byId = await fetchCompany(companyCode);
    if (byId) return byId;

    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("company_code", companyCode)
      .maybeSingle();

    if (error) return null;
    return data;
  };

  // =========================
  // GARANTIR EMPRESA
  // =========================

  const ensureCompanyExists = async (companyId, companyName) => {
    const existing = await fetchCompany(companyId);

    if (existing) return existing;

    const { error } = await supabase.from("companies").insert({
      id: companyId,
      name: companyName,
    });

    if (error) throw new Error(error.message);

    return await fetchCompany(companyId);
  };

  // =========================
  // GARANTIR PERFIL
  // =========================

  const ensureUserExists = async ({
    userId,
    email,
    name,
    phone,
    userType,
    companyId,
  }) => {
    const existing = await fetchUser(userId);

    if (existing) return existing;

    const { error } = await supabase.from("profiles").insert({
      id: userId,
      email,
      name,
      phone,
      user_type: userType,
      company_id: companyId,
    });

    if (error) throw new Error(error.message);

    return await fetchUser(userId);
  };

  // =========================
  // INICIAR SESSÃO
  // =========================

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const user = await fetchUser(session.user.id);

        if (user) {
          setCurrentUser(user);

          const company = await fetchCompany(user.company_id);
          setCompanyInfo(company);
        }
      }

      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) {
        setCurrentUser(null);
        setCompanyInfo(null);
      } else {
        const user = await fetchUser(session.user.id);

        if (user) {
          setCurrentUser(user);

          const company = await fetchCompany(user.company_id);
          setCompanyInfo(company);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // =========================
  // LOGIN
  // =========================

  const login = async (email, password, expectedType = null) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizeEmail(email),
        password,
      });

      if (error) {
        logAuthError("login.signInWithPassword", error, { email: normalizeEmail(email) });
        return { success: false, error: error.message };
      }

      const user = await fetchUser(data.user.id);

      if (!user) {
        logAuthError("login.fetchUser", "Usuário não encontrado", { userId: data.user.id });
        return { success: false, error: "Usuário não encontrado." };
      }

      if (!isAllowedRole(user.user_type, expectedType)) {
        logAuthError("login.roleMismatch", "Tipo de conta sem permissão para este painel", {
          expectedType,
          userType: user.user_type,
          email: normalizeEmail(email),
        });
        await supabase.auth.signOut();
        return { success: false, error: "Esta conta não tem acesso a este painel." };
      }

      setCurrentUser(user);

      const company = await fetchCompany(user.company_id);
      setCompanyInfo(company);

      return { success: true };

    } catch (error) {
      logAuthError("login.catch", error, { email: normalizeEmail(email) });
      return { success: false, error: error.message };

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // REGISTRAR GESTOR
  // =========================

  const registerManager = async (
    email,
    password,
    name,
    phone,
    companyName
  ) => {
    try {
      setLoading(true);

      const normalizedEmail = normalizeEmail(email);
      const normalizedName = normalizeName(name);
      const normalizedPhone = normalizePhone(phone);
      const normalizedCompanyName = normalizeName(companyName);

      let companyId;
      let exists = true;

      while (exists) {
        companyId = generateCompanyId();
        const company = await fetchCompany(companyId);
        if (!company) exists = false;
      }

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            name: normalizedName,
            phone: normalizedPhone,
            user_type: "gestor",
            company_id: companyId,
            company_name: normalizedCompanyName,
          },
        },
      });

      if (error) {
        logAuthError("registerManager.signUp", error, { email: normalizedEmail, companyId });
        return { success: false, error: error.message };
      }

      const userId = data.user.id;

      await ensureCompanyExists(companyId, normalizedCompanyName);

      const user = await ensureUserExists({
        userId,
        email: normalizedEmail,
        name: normalizedName,
        phone: normalizedPhone,
        userType: "gestor",
        companyId,
      });

      setCurrentUser(user);

      const company = await fetchCompany(companyId);
      setCompanyInfo(company);

      return {
        success: true,
        companyId,
      };

    } catch (error) {
      logAuthError("registerManager.catch", error, { email: normalizeEmail(email), companyName });
      return { success: false, error: error.message };

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // REGISTRAR FUNCIONÁRIO
  // =========================

  const registerEmployee = async (
    email,
    password,
    name,
    phone,
    companyCode
  ) => {
    try {
      setLoading(true);

      const normalizedEmail = normalizeEmail(email);
      const normalizedName = normalizeName(name);
      const normalizedPhone = normalizePhone(phone);
      const normalizedCompanyCode = (companyCode || "").trim().toUpperCase();

      if (!validateCompanyId(normalizedCompanyCode)) {
        logAuthError("registerEmployee.invalidCompanyCode", "Código de empresa inválido", { companyCode: normalizedCompanyCode });
        return { success: false, error: "Código de empresa inválido." };
      }

      const company = await fetchCompanyByCode(normalizedCompanyCode);

      if (!company) {
        logAuthError("registerEmployee.companyNotFound", "Empresa não encontrada", { companyCode: normalizedCompanyCode });
        return { success: false, error: "Empresa não encontrada." };
      }

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            name: normalizedName,
            phone: normalizedPhone,
            user_type: "funcionario",
            company_id: company.id,
          },
        },
      });

      if (error) {
        logAuthError("registerEmployee.signUp", error, { email: normalizedEmail, companyCode: normalizedCompanyCode });
        return { success: false, error: error.message };
      }

      const userId = data.user.id;

      const user = await ensureUserExists({
        userId,
        email: normalizedEmail,
        name: normalizedName,
        phone: normalizedPhone,
        userType: "funcionario",
        companyId: company.id,
      });

      setCurrentUser(user);
      setCompanyInfo(company);

      return { success: true };

    } catch (error) {
      logAuthError("registerEmployee.catch", error, { email: normalizeEmail(email), companyCode });
      return { success: false, error: error.message };

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCompanyInfo(null);
  };

  const refreshCompanyInfo = useCallback(async () => {
    if (!currentUser?.company_id) return;

    const company = await fetchCompany(currentUser.company_id);
    setCompanyInfo(company);

  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        companyInfo,
        userType: currentUser?.user_type,
        loading,
        login,
        registerManager,
        registerEmployee,
        logout,
        refreshCompanyInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};