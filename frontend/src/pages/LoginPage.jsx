import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { login, requestPasswordReset, resetPassword } from "../services/loginService";

function LoginPage({ onLogin, onNavigate }) {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [status, setStatus] = useState(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState("request");
  const [forgotForm, setForgotForm] = useState({
    email: "",
    code: "",
    newPassword: ""
  });
  const [forgotStatus, setForgotStatus] = useState(null);
  const [isForgotPasswordVisible, setIsForgotPasswordVisible] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const data = await login(form);

      setStatus({ type: "success", message: "Login realizado!" });

      if (onLogin) onLogin(data);
    } catch (err) {
      console.log(err);
      setStatus({ type: "error", message: "Email ou senha inválidos" });
    }
  }

  async function handleRequestCode() {
    setForgotStatus(null);
    if (!forgotForm.email) {
      setForgotStatus({ type: "error", message: "Informe seu email para recuperar a senha." });
      return;
    }

    try {
      const response = await requestPasswordReset(forgotForm.email);
      setForgotForm((prev) => ({ ...prev, code: response.code || "" }));
      setForgotStatus({
        type: "success",
        message: response.code
          ? `Codigo gerado: ${response.code}`
          : (response.message || "Codigo gerado com sucesso.")
      });
      setForgotStep("reset");
    } catch (err) {
      setForgotStatus({ type: "error", message: err.message || "Nao foi possivel enviar o codigo." });
    }
  }

  async function handleResetPassword() {
    setForgotStatus(null);
    if (!forgotForm.email || !forgotForm.code || !forgotForm.newPassword) {
      setForgotStatus({ type: "error", message: "Preencha email, codigo e nova senha." });
      return;
    }

    try {
      const response = await resetPassword({
        email: forgotForm.email,
        code: forgotForm.code,
        newPassword: forgotForm.newPassword
      });
      const successMessage = response.message || "Senha redefinida com sucesso.";
      setForgotStatus({ type: "success", message: successMessage });
      setForgotForm({ email: "", code: "", newPassword: "" });
      setForgotStep("request");
      setShowForgotPassword(false);
      setStatus({ type: "success", message: `${successMessage} Faça login com a nova senha.` });
    } catch (err) {
      setForgotStatus({ type: "error", message: err.message || "Nao foi possivel redefinir a senha." });
    }
  }

  return (
    <section className="hero-card">
      <div className="hero-copy">
        <p className="eyebrow">Bem-vindo de volta</p>
        <h2>Entrar</h2>
        <p>Acesse sua conta para realizar seus pedidos.</p>
      </div>

      <div className="form-card">
        <form className="product-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>

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

          {status && (
            <p className={`status-message ${status.type}`}>
              {status.message}
            </p>
          )}

          <button className="submit-button" type="submit">
            Entrar
          </button>


          
          <button type="button" className="link-button"
          onClick={() => onNavigate('register')}>
            Não tem conta? Criar
          </button>

          <button
            type="button"
            className="link-button"
            onClick={() => {
              setShowForgotPassword((prev) => !prev);
              setForgotStatus(null);
            }}
          >
            Esqueci minha senha
          </button>

          {showForgotPassword && (
            <div className="forgot-password-card">
              {forgotStep === "request" ? (
                <div className="product-form">
                  <label>
                    <span>Email para recuperar</span>
                    <input
                      type="email"
                      required
                      value={forgotForm.email}
                      onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })}
                    />
                  </label>
                  <button className="submit-button" type="button" onClick={handleRequestCode}>
                    Enviar codigo
                  </button>
                </div>
              ) : (
                <div className="product-form">
                  <label>
                    <span>Codigo recebido</span>
                    <input
                      required
                      value={forgotForm.code}
                      onChange={(e) => setForgotForm({ ...forgotForm, code: e.target.value })}
                    />
                  </label>

                  <label>
                    <span>Nova senha</span>
                    <div className="password-field">
                      <input
                        type={isForgotPasswordVisible ? "text" : "password"}
                        required
                        value={forgotForm.newPassword}
                        onChange={(e) => setForgotForm({ ...forgotForm, newPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setIsForgotPasswordVisible((prev) => !prev)}
                        aria-label={isForgotPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                        aria-pressed={isForgotPasswordVisible}
                      >
                        {isForgotPasswordVisible ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </button>
                    </div>
                  </label>

                  <button className="submit-button" type="button" onClick={handleResetPassword}>
                    Redefinir senha
                  </button>

                  <button
                    type="button"
                    className="link-button"
                    onClick={() => {
                      setForgotStep("request");
                      setForgotStatus(null);
                    }}
                  >
                    Enviar novo codigo
                  </button>
                </div>
              )}

              {forgotStatus && (
                <p className={`status-message ${forgotStatus.type}`}>
                  {forgotStatus.message}
                </p>
              )}
            </div>
          )}

        </form>
      </div>
    </section>
  );
}

export default LoginPage;
