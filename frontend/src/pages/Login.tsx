import { useState, type FormEvent } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (response) => {
      console.log("Google Login Success:", response);

      navigate("/home");
    },

    onError: () => {
      console.log("Google Login Failed");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log({
      email,
      password,
    });

    navigate("/home");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Login</h1>

        <button
          type="button"
          className="google-button"
          onClick={() => handleGoogleLogin()}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="google-logo"
          />

          <span>Login with Google</span>
        </button>

        <div className="divider">
          <span></span>
          <p>or sign up through email</p>
          <span></span>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email ID"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;