const Card = ({ title, value, icon, bgColor="bg-[#1360AB]" }) => {
  return (
    <div className={`${bgColor} text-white shadow--[0px_1px_20px_rgba(0,0,0,0.06)] p-4 rounded-[20px] flex flex-col items-center justify-center w-40 h-24`}>
      <div className="text-lg">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-sm">{title}</p>
    </div>
  );
};

export default Card;
