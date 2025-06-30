import Image from "next/image";

// ---------------------------
// Avatar component
// ---------------------------
export default function AvatarBlock({
  avatar,
  color,
}: {
  avatar: string | { contentUrl?: string } | null;
  color?: string;
}) {
  const avatarUrl =
    typeof avatar === "object" && avatar?.contentUrl
      ? `${process.env.NEXT_PUBLIC_API_URL}${avatar.contentUrl}`
      : typeof avatar === "string"
      ? `${process.env.NEXT_PUBLIC_API_URL}${avatar}`
      : null;

  const borderColor = color || "#ccc";

  return (
    <div className="relative w-24 h-24 mb-4">
      <Image
        src="/star.png"
        alt="star"
        className="absolute top-0 right-[-9px] w-6 h-6"
        width={6}
        height={6}
      />
      {avatarUrl ? (
        <div
          className="w-24 h-24 rounded-full overflow-hidden border-[5px] mb-4"
          style={{ borderColor }}
        >
          <Image
            src={avatarUrl}
            alt="User avatar"
            width={96}
            height={96}
            className="object-cover w-full h-full"
            unoptimized
          />
        </div>
      ) : (
        <div
          className="w-24 h-24 rounded-full overflow-hidden border-[5px] mb-4 bg-white flex items-center justify-center"
          style={{ borderColor }}
        ></div>
      )}
      <Image
        src="/star.png"
        alt="star"
        className="absolute bottom-0 left-[-9px] w-6 h-6"
        width={6}
        height={6}
      />
    </div>
  );
}
