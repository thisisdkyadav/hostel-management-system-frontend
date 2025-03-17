import IITI_Logo from "../assets/logos/IITILogo.png"; 
const Login = () => {
  return (
    <div className="flex justify-center items-center min-h-screen  bg-gradient-to-b from-gray-100 to-blue-200">
      <div className="bg-white p-8 rounded-[20px] shadow-[0px_1px_20px_rgba(0,0,0,0.06)] w-96">
        <img
          src={IITI_Logo}
          
          className="h-28 mx-auto mb-6"
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full h-10 p-3 mb-4 border border-gray-300 rounded-[12px] bg-blue-50 focus:outline-none focus:ring-1 focus:ring-[#1360AB]"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full h-10 p-3 mb-4 border border-gray-300 rounded-[12px] bg-blue-50 focus:outline-none focus:ring-1 focus:ring-[#1360AB]"
        />
        <button className="w-full bg-[#1360AB] h-10 text-white py-2 rounded-[12px] font-medium hover:bg-[#0F4C81] transition">
          Login
        </button>
        <hr className="my-4 border-gray-300" />
        <button className="w-full bg-[#1360AB] text-white py-2 h-10 rounded-[12px] font-medium hover:bg-[#0F4C81] transition">
          Sign in with Google
        </button>
        <p className="text-center text-gray-500 mt-4 text-sm cursor-pointer hover:underline">
          Forgot Password ?
        </p>
      </div>
    </div>
  );
};

export default Login;
