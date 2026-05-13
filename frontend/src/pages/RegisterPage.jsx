import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { createUser } from "../services/registerService";
// import { validateCpf } from "../services/cpfService";

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

  const passwordHelp = "Minimo de 8 caracteres, com letra maiuscula, minuscula e numero.";

  async function handleSubmit(e) {
    e.preventDefault();
    const passwordError = validatePassword(form.password);

    if (passwordError) {
      setStatus({ type: "error", message: passwordError });
      return;
    }

    if (!validatePhone(form.phone)) {
      setStatus({ type: "error", message: "Telefone invalido. Informe DDD e 10 ou 11 digitos." });
      return;
    }

    const isCpfValid = await validateCpf(form.cpf);
    if (!isCpfValid) {
      setStatus({ type: "error", message: "CPF invalido. Verifique seus dados." });
      return;
    }

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
              maxLength={14}
              onChange={(e) => setForm({ ...form, cpf: formatCpf(e.target.value) })}
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
                  minLength={8}
                  autoComplete="new-password"
                  title={passwordHelp}
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
              <small className="field-help">{passwordHelp}</small>
            </label>

            <label>
              <span>Telefone</span>
              <input
                type="tel"
                autoComplete="tel"
                required
                inputMode="tel"
                maxLength={15}
                placeholder="(31) 99999-9999"
                pattern="\(\d{2}\) \d{4,5}-\d{4}"
                title="Telefone deve ter DDD e 10 ou 11 dígitos"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
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

function validatePassword(password) {
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(password)) {
    return "Senha deve ter no minimo 8 caracteres, com letra maiuscula, minuscula e numero.";
  }

  return "";
}

function validatePhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11;
}

function formatCpf(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  return digits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export default RegisterPage;
