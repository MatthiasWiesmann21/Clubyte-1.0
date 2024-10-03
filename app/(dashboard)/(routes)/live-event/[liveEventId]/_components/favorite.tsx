"use client";

import axios from "axios";
import { Star } from "lucide-react";

const Favorite = ({ liveEvent, getLiveEvent }: any) => (
  <div className="flex">
    <div
      onClick={async () => {
        const response = await axios?.post(`/api/favorite/create`, {
          liveEventId: liveEvent?.id,
        });
        if (response?.status === 200) getLiveEvent();
      }}
      className="flex cursor-pointer items-center justify-around rounded-[10px] border border-[#fff] bg-slate-100/60 p-2 hover:shadow-sm dark:border-[#1e172a] dark:bg-[#0c0319]"
    >
      {liveEvent?.favorites?.length}
      <Star
        size={26}
        fill={!!liveEvent?.currentFavorite ? "#FFD700" : "#ffffff00"}
        className="ml-2 transition duration-200 ease-in-out hover:scale-110"
        style={!!liveEvent?.currentFavorite ? { color: "#FFD700" } : {}}
      />
    </div>
  </div>
);

export default Favorite;
