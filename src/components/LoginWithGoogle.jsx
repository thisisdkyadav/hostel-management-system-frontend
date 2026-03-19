import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
import { FcGoogle } from "react-icons/fc"

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

function LoginWithGoogle({ callback, className }) {
  // Custom button renderer for GoogleLogin
  const customButton = ({ onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} className={`flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-300 ${className || ""}`} style={{ minWidth: "240px" }}>
      <FcGoogle className="text-xl" />
      <span>Continue with Google</span>
    </button>
  )

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="flex justify-center items-center">
        <GoogleLogin onSuccess={async (tokenResponse) => {
            const token = tokenResponse.credential
            await callback(token)
          }}
          onError={() => console.log("Login Failed")}
          useOneTap
          type="standard"
          theme="filled_blue"
          shape="rectangular"
          size="large"
          text="continue_with"
          locale="en"
          logo_alignment="left"
          width="100%"
          render={customButton}
        />
      </div>
    </GoogleOAuthProvider>
  )
}

export default LoginWithGoogle
