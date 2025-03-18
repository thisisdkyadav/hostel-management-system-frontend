const Navbar = () => {
  return (
    <header className="flex justify-between items-center mb-6 p-4 bg-[#EFF3F4] ">
      <div>
        <h1 className="text-2xl font-bold">Warden</h1>
        <p className="text-sm text-gray-500">13 Feb 2025</p>
      </div>
      <div className="flex items-center space-x-4">
        <button className="bg-white text-red-500 px-4 py-2 rounded-md shadow">
          Alert
        </button>
        <span className="font-medium text-gray-700">Warden</span>
      </div>
    </header>
  );
};

export default Navbar;
