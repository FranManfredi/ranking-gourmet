"use client";

import { useRouter } from "next/navigation";
import ScoreBadge from "@/src/components/score/ScoreBadge";
import SmallButton from "@/src/components/button/SmallButton";

interface RestaurantTopBarProps {
  name: string;
  address: string;
  city: string;
  score?: number | null;
  backHref: string;
}

export default function RestaurantTopBar({
                                           name,
                                           address,
                                           city,
                                           score,
                                           backHref,
                                         }: RestaurantTopBarProps) {
  const router = useRouter();

  return (
      <div className="inline-flex w-full items-center justify-between overflow-hidden border-b border-[#ECFDF5] bg-white px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
            <SmallButton
                onClick={() => router.push(backHref)}
                aria-label="Volver"
            />
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
            <div className="truncate text-xl font-bold text-black">
              {name}
            </div>

            <div className="flex min-w-0 items-center gap-1 text-[10px] font-bold text-gray-500">
              <span className="truncate">{address}</span>
              <span className="shrink-0">•</span>
              <span className="truncate">{city}</span>
            </div>
          </div>
        </div>

        <div className="ml-3 shrink-0">
          <ScoreBadge score={score} showText={true} label="PUNTAJE TOTAL" />
        </div>
      </div>
  );
}
