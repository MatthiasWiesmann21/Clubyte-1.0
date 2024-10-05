"use client";
import axios from "axios";
import moment from "moment";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ChatInputPost } from "../../../news/_components/chatInput";
import { UserAvatar } from "@/components/user-avatar";

const Chat = () => {
  const path = usePathname();
  const id = path?.split("/")[path?.split("/")?.length - 1];
  const [chat, setChat] = useState([]);

  const getChat = async () => {
    const response = await axios?.post(`/api/comment/list`, {
      liveEventId: id,
    });
    setChat(response?.data?.data);
  };

  useEffect(() => {
    getChat();
  }, []);
  return (
    <div className="border-1 mx-auto mt-10 flex h-[600px] w-[29%] flex-col justify-between rounded-[12px] border border-[#fff] bg-[#131313] p-3 pt-0">
      <p className="my-5 text-[16px] font-[600]">Stream Chat</p>
      <div className="h-[80%] w-full">
        <div className="no-scrollbar h-full overflow-y-scroll">
          {chat?.map((val: any) => (
            <div key={val?.id}>
              <div className="my-4 flex justify-between rounded-lg border p-4 dark:bg-[#131618]">
                <UserAvatar
                  className="min-w-64 max-w-64 min-h-64 mr-3 mr-3 h-64 max-h-64 w-64"
                  src={val?.profile?.imageUrl}
                />
                <div className="w-full">
                  <div className="">
                    <div className="font-500 line-clamp-1 text-base font-bold">
                      {val?.profile?.name}
                    </div>
                    <div className="text-xs">
                      {moment(new Date(val?.createdAt))?.fromNow()}
                    </div>
                    <text className="break-all text-sm">{val?.text}</text>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ChatInputPost
        placeHolder={"Type your comment"}
        apiUrl="/api/comment/create"
        query={{
          postId: null,
          parentCommentId: null,
          liveEventId: id,
        }}
        className="pb-[0]"
        getPosts={getChat}
      />
    </div>
  );
};

export default Chat;
