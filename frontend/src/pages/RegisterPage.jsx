import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { createUser } from "../services/registerService";

function RegisterPage({ onNavigate }) {
  const [form, setForm] = useState({
    name: "",
    cpf: "",
    email: "",
    password: "",
    phone: ""
  });

  const [status, setStatus] = useState(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await createUser(form);
      setStatus({ type: "success", message: "Conta criada com sucesso!" });
      onNavigate('login');
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Erro ao criar conta" });
    }
  }

  return (
    <section className="hero-card">
      <div className="hero-copy">
        <p className="eyebrow">Novo por aqui?</p>
        <h2>Criar Conta</h2>
        <p>Cadastre-se para realizar seus pedidos.</p>
      </div>

      <div className="form-card">
        <form className="product-form" onSubmit={handleSubmit}>
          <label>
            <span>Nome</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>

          <label>
            <span>CPF</span>
            <input
              required
              value={form.cpf}
              onChange={(e) => setForm({ ...form, cpf: e.target.value })}
            />
          </label>

          <label>
            <span>Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>

          <div className="form-row">
            <label>
              <span>Senha</span>
              <div className="password-field">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
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

            <label>
              <span>Telefone</span>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
          </div>

          {status && (
            <p className={`status-message ${status.type}`}>
              {status.message}
            </p>
          )}

          <button className="submit-button" type="submit">
            Criar conta
          </button>

          <button
            type="button"
            className="link-button"
            onClick={() => onNavigate('login')}
          >
            Já tem login? Entrar
          </button>
        </form>
      </div>
    </section>
  );
}

export default RegisterPage;
