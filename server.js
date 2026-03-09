// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// === DADOS DO ADMIN CENTRALIZADOS ===
const emailAdmin = "admin@teste.com";
const nomeAdmin = "Admin";
const tipoAdmin = "admin";
// Coloque aqui o hash gerado no terminal usando bcrypt
const senhaAdminHash ="admin123"; // Substitua pelo hash real gerado

// === FUNÇÃO PARA CRIAR ADMIN AUTOMATICAMENTE ===
async function criarAdmin() {
  try {
    const { data: existingAdmin, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("user_type", tipoAdmin);

    if (fetchError) {
      console.error("Erro ao verificar admin existente:", fetchError);
      return;
    }

    if (!existingAdmin || existingAdmin.length === 0) {
      const { data, error } = await supabase
        .from("users")
        .insert([{
          email: emailAdmin,
          name: nomeAdmin,
          senha: senhaAdminHash,
          user_type: tipoAdmin
        }])
        .select();

      if (error) console.error("Erro ao criar admin:", error);
      else console.log("✅ Usuário admin criado com sucesso!");
    } else {
      console.log("ℹ️ Admin já existe no banco de dados.");
    }
  } catch (err) {
    console.error("Erro inesperado ao criar admin:", err.message);
  }
}

// === ROTA DE LOGIN DO ADMIN ===
app.post('/admin/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ error: 'Email e senha são obrigatórios.' });

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('user_type', tipoAdmin);

    if (error) throw error;
    if (!users || users.length === 0) return res.status(401).json({ error: 'Admin não encontrado.' });

    const admin = users[0];
    const senhaValida = await bcrypt.compare(senha, admin.senha);

    if (!senhaValida) return res.status(401).json({ error: 'Senha incorreta.' });

    return res.json({ 
      success: true, 
      admin: { id: admin.id, name: admin.name, email: admin.email } 
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// === INICIALIZAÇÃO DO SERVIDOR ===
app.listen(PORT, async () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
  await criarAdmin();
});