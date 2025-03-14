const Notification = () => {
  return (
    <div className="bg-white shadow-md p-4 rounded-lg w-full">
      <h3 className="font-semibold text-lg">Notifications</h3>
      <ul className="mt-2 space-y-2 text-sm text-gray-600">
        <li>🔧 Update on Electrician complaint.</li>
        <li>📌 Warden’s comment on room change request.</li>
      </ul>
    </div>
  );
};

export default Notification;
