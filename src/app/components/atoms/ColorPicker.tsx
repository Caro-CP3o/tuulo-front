const COLORS = [
  "#E8586C",
  "#F3AB4B",
  "#547854",
  "#4ABFEE",
  "#6F5E9F",
  "#AF16A8",
  "#2A4AA1",
  "#B4B45D",
  "#FFDC7C",
  "#1C7F83",
];

export default function ColorPicker({
  color,
  setColor,
  usedColors = [],
}: {
  color: string;
  setColor: (value: string) => void;
  usedColors?: string[];
}) {
  // ---------------------------
  // Color picker component with used colors
  // ---------------------------
  return (
    <div className="flex flex-wrap gap-2">
      {COLORS.map((c) => {
        const isUsed = usedColors.some(
          (used) => used.toLowerCase() === c.toLowerCase()
        );
        return (
          <button
            key={c}
            type="button"
            disabled={isUsed}
            onClick={() => !isUsed && setColor(c)}
            aria-pressed={color === c}
            title={isUsed ? "Couleur déjà utilisée" : `Choisir ${c}`}
            className={`
              relative w-8 h-8 rounded-full border
              ${color === c ? "ring-2 ring-offset-2 ring-blue-500" : ""}
              ${
                isUsed
                  ? "opacity-15 cursor-not-allowed color-used"
                  : "cursor-pointer"
              }
            `}
            style={{ backgroundColor: c }}
          />
        );
      })}
    </div>
  );
}
