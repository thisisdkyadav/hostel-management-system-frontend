import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
import { FcGoogle } from "react-icons/fc"

const clientId = "38247354372-kfedg2ftoq2m6a32qq3qq9bggoamcg4a.apps.googleusercontent.com"

function LoginWithGoogle({ callback, className }) {
  // Custom button renderer for GoogleLogin
  const customButton = ({ onClick, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group flex items-center justify-center gap-3 w-full bg-white/90 text-gray-700 border border-gray-200 py-3.5 px-6 rounded-xl font-medium hover:bg-gray-50/90 hover:border-gray-300 hover:shadow-lg transition-all duration-300 relative overflow-hidden ${className || ""}`}
      style={{ width: "100%" }}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
      <FcGoogle className="text-xl" />
      <span className="relative">Continue with Google</span>
    </button>
  )

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="w-full">
        <GoogleLogin
          onSuccess={async (tokenResponse) => {
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
