// ---------------------------
// Menu item component icon + label
// ---------------------------
export default function MenuItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center space-x-3 hover:text-red-400 cursor-pointer justify-start flex-wrap">
      {icon}
      <span className="text-md font-medium hover:text-red-400">{label}</span>
    </div>
  );
}
