import { useEffect, useState } from "react";
import { updateUser, getCurrentUser } from "../services/profileService";

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

    try {
      await updateUser(form);

      setStatus({
        type: "success",
        message: "Perfil atualizado com sucesso!"
      });

      setForm(prev => ({ ...prev, password: "" }));
    } catch (err) {
      setStatus({
        type: "error",
        message: "Erro ao atualizar perfil"
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
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />
          </label>

          <label>
            <span>Nova senha (opcional)</span>
            <input
              type="password"
              placeholder="Deixe vazio para manter atual"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
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