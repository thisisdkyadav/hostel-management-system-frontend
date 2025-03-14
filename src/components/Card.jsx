const Card = ({ title, value, icon, bgColor="bg-[#1360AB]" }) => {
  return (
    <div className={`${bgColor} text-white p-4 rounded-[12px] flex flex-col items-center justify-center w-40 h-24`}>
      <div className="text-lg">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-sm">{title}</p>
    </div>
  );
};

export default Card;
