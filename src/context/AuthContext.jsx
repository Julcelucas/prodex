import React, { createContext, useState } from "react";
import { supabase } from "../lib/supabase";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // ==========================
  // REGISTRAR GESTOR
  // ==========================
  const registerManager = async (email, password, name, phone, companyName) => {
    try {
      setLoading(true);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Usuário não foi criado");

      const userId = authData.user.id;

      const companyCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: companyName,
          company_code: companyCode,
          subscription_status: "trial",
        })
        .select()
        .single();

      if (companyError) throw companyError;

      const { data: user, error: userError } = await supabase
        .from("users")
        .insert({
          id: userId,
          email,
          name,
          phone,
          user_type: "gestor",
          company_id: company.id,
        })
        .select()
        .single();

      if (userError) throw userError;

      setCurrentUser(user);
      setCompanyInfo(company);

      return { success: true };

    } catch (error) {
      console.error("Erro ao registrar gestor:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // REGISTRAR FUNCIONÁRIO
  // ==========================
  const registerEmployee = async (email, password, name, phone, companyCode) => {
    try {
      setLoading(true);

      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("company_code", companyCode)
        .single();

      if (companyError || !company) {
        throw new Error("Código da empresa inválido");
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      const userId = authData.user.id;

      const { data: user, error: userError } = await supabase
        .from("users")
        .insert({
          id: userId,
          email,
          name,
          phone,
          user_type: "funcionario",
          company_id: company.id,
        })
        .select()
        .single();

      if (userError) throw userError;

      setCurrentUser(user);
      setCompanyInfo(company);

      return { success: true };

    } catch (error) {
      console.error("Erro ao registrar funcionário:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // ==========================
// LOGIN (gestor / funcionário / admin)
const login = async (email, password) => {
  try {
    setLoading(true);

    // 1️⃣ Tenta login Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.user) {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (userError || !user) throw new Error("Perfil do usuário não encontrado");

      let company = null;
      if (user.company_id) {
        const { data: companyData } = await supabase
          .from("companies")
          .select("*")
          .eq("id", user.company_id)
          .single();
        company = companyData;
      }

      setCurrentUser(user);
      if (company) setCompanyInfo(company);

      return { success: true, user };
    }

    // 2️⃣ Login ADMIN via backend
    const res = await fetch("http://localhost:5000/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha: password }),
    });

    const result = await res.json();

    if (res.ok && result.success) {
      const adminUser = {
        ...result.admin,
        user_type: "admin",
      };

      // ⚡ Atualiza o contexto para o admin
      setCurrentUser(adminUser);
      setCompanyInfo(null); // admin não tem empresa

      return { success: true, user: adminUser };
    }

    return { success: false, error: "Credenciais inválidas" };
  } catch (error) {
    console.error("Erro no login:", error);
    return { success: false, error: error.message };
  } finally {
    setLoading(false);
  }
};

  // ==========================
  // LOGOUT
  // ==========================
  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setCurrentUser(null);
      setCompanyInfo(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        companyInfo,
        userType: currentUser?.user_type,
        loading,
        registerManager,
        registerEmployee,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};