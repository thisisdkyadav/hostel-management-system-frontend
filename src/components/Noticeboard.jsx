import { ReactComponent as NoticeIcon } from "../assets/icons/noticeboard.svg";

const Noticeboard = () => {
  return (
    <div className="bg-white shadow-[0px_1px_20px_rgba(0,0,0,0.06)] py-4 rounded-[20px] w-130 h-70 text-center">
      <div className="flex items-center justify-center space-x-2">
      <NoticeIcon className="w-5 h-5 text-[#1360AB]" />
        <h3 className="font-semibold text-lg text-black">Notice Board</h3>
      </div>
      <p className="mt-4 text-gray-500">Nothing to show</p>
    </div>
  );
};

export default Noticeboard;
