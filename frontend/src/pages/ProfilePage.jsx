import { useEffect, useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { updateUser, getCurrentUser } from "../services/profileService";
import { validateCpf } from "../services/cpfService";

function ProfilePage({ onNavigate, onLogout }) {
  const [form, setForm] = useState({
    name: "",
    cpf: "",
    email: "",
    phone: "",
    password: ""
  });

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getCurrentUser();

        setForm({
          name: data.name || "",
          cpf: data.cpf || "",
          email: data.email || "",
          phone: data.phone || "",
          password: ""
        });
      } catch (err) {
        setStatus({ type: "error", message: "Erro ao carregar usuário" });
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const isChangingPassword = Boolean(form.password?.trim());

    if (form.cpf.trim()) {
      const isCpfValid = await validateCpf(form.cpf);
      if (!isCpfValid) {
        setStatus({ type: "error", message: "CPF invalido. Verifique seus dados." });
        return;
      }
    }

    try {
      await updateUser(form);

      setStatus({
        type: "success",
        message: isChangingPassword
          ? "Senha alterada com sucesso."
          : "Perfil atualizado com sucesso!"
      });

      setForm(prev => ({ ...prev, password: "" }));
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Erro ao atualizar perfil"
      });
    }
  }

  if (loading) {
    return (
      <section className="hero-card">
        <div className="hero-copy">
          <h2>Carregando perfil...</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="hero-card">
      <div className="hero-copy">
        <p className="eyebrow">Sua conta</p>
        <h2>Perfil</h2>
        <p>Gerencie suas informações pessoais</p>
      </div>

      <div className="form-card">
        <form className="product-form" onSubmit={handleSubmit}>
          <label>
            <span>Nome</span>
            <input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </label>

          <label>
            <span>CPF</span>
            <input
              value={form.cpf}
              onChange={(e) =>
                setForm({ ...form, cpf: e.target.value })
              }
            />
          </label>

          <label>
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </label>

          <label>
            <span>Telefone</span>
            <input
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />
          </label>

          <label>
            <span>Nova senha (opcional)</span>
            <div className="password-field">
              <input
                type={isPasswordVisible ? "text" : "password"}
                placeholder="Deixe vazio para manter atual"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setIsPasswordVisible((prev) => !prev)}
                aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={isPasswordVisible}
              >
                {isPasswordVisible ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </button>
            </div>
          </label>

          {status && (
            <p className={`status-message ${status.type}`}>
              {status.message}
            </p>
          )}

          <button className="submit-button" type="submit">
            Salvar alterações
          </button>

          <button
            type="button"
            className="link-button"
            onClick={onLogout}
          >
            Sair da conta
          </button>

          <button
            type="button"
            className="link-button"
            onClick={() => onNavigate("menu")}
          >
            Voltar ao menu
          </button>
        </form>
      </div>
    </section>
  );
}

export default ProfilePage;
