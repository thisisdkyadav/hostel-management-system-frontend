import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"

const clientId = "38247354372-kfedg2ftoq2m6a32qq3qq9bggoamcg4a.apps.googleusercontent.com"

function LoginWithGoogle({ callback }) {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        onSuccess={async (tokenResponse) => {
          const token = tokenResponse.credential
          await callback(token)
        }}
        onError={() => console.log("Login Failed")}
      />
    </GoogleOAuthProvider>
  )
}

export default LoginWithGoogle
