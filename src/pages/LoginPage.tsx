import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, authErrorMessage } from "../auth/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [email, setEmail] = useState("demo@siganyeohaeng.kr");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(authErrorMessage(err, "로그인에 실패했습니다."));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-eyebrow">TIME-BASED JEJU TRAVEL PLATFORM</div>
        <h1 className="auth-title">제주 코스에 로그인</h1>
        <p className="auth-sub">기존 계정으로 접속하세요</p>

        {error && (
          <div className="auth-error-banner">
            <b>인증에 실패했습니다</b>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <label>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="field-row">
            <label>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button className="btn-primary auth-submit" type="submit" disabled={pending}>
            {pending ? "로그인 중…" : "로그인"}
          </button>
        </form>

        <div className="auth-divider">또는 소셜 로그인으로 시작</div>
        <div className="auth-social-row">
          <button type="button" className="btn-outline" onClick={() => setError("소셜 로그인은 준비 중이에요. 이메일로 로그인해주세요.")}>
            카카오로 로그인
          </button>
          <button type="button" className="btn-outline" onClick={() => setError("소셜 로그인은 준비 중이에요. 이메일로 로그인해주세요.")}>
            네이버로 로그인
          </button>
          <button type="button" className="btn-outline" onClick={() => setError("소셜 로그인은 준비 중이에요. 이메일로 로그인해주세요.")}>
            구글로 로그인
          </button>
        </div>

        <p className="auth-footer-note">
          계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </p>
        <p className="auth-hint mono">데모 계정: demo@siganyeohaeng.kr / demo1234</p>
      </div>
    </div>
  );
}
