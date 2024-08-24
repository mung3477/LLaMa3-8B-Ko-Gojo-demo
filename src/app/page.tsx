"use client"

import { IconSend, IconUserCircle } from "@tabler/icons-react";
import ky from "ky";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";

export default function Home() {
  const [chats, setChats] = useState<Array<string>>(["아, 일어났다."]);

  return (
    <main>
    <Title/>
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-end p-[40px]">
      <div className="w-full h-full max-w-5xl items-center justify-between font-mono text-sm">
        <div className="w-full h-full overflow-auto">
          {chats.map((chat, idx) => (idx % 2 === 1) ?
            <MyChat key={idx} text={chat}/>
          : <GojoChat key={idx} text={chat}/>)}
        </div>
        <SendMessage setChats={setChats}/>
      </div>
    </div>
    </main>
  );
}

function Title() {
  return (
    <p className="sticky z-10 left-0 top-0 h-[80px] flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit">
          고죠에게 문자를 보내보세요.
        </p>
  )
}

interface ChatInfo {
  text: string
}
function MyChat({ text }: ChatInfo) {
  return (
    <div className="w-fit flex items-center max-w-[80%]  mb-[8px] mr-auto">
      <IconUserCircle className="w-[36px] h-[36px] flex-none mr-[4px]" stroke={1}/>
      <p className="text-balance break-keep w-fit p-[4px_8px] border border-gray-600 bg-gray-300 rounded-[12px]">{text}</p>
    </div>
  )
}

function GojoChat({ text }: ChatInfo) {
  return (
    <div className="w-fit flex items-center max-w-[80%] mb-[8px] ml-auto">
      <p className="text-balance break-keep w-fit p-[4px_8px] border border-gray-600 bg-gray-300 rounded-[12px]">{text}</p>
      <div className="w-[36px] h-[36px] rounded-full overflow-hidden ml-[4px]">
        <Image src="/Gojo.webp" alt="Gojo" width={500} height={500} className="h-full"/>
      </div>
    </div>
  )
}

interface SendMessageProps {
  setChats: Dispatch<SetStateAction<Array<string>>>
}
function SendMessage({ setChats }: SendMessageProps) {
  const [text, setText] = useState("")
  const [waiting, setWaiting] = useState(false)

  return (
    <form
      className="rounded-[8px] sticky bottom-0 max-h-[200px] m-0 flex w-full items-center p-0 justify-center border border-gray-300 bg-gradient-to-b from-zinc-200 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit"
      onSubmit={(e) => {
        e.preventDefault();
        setChats((cur) => ([...cur, text, "(고죠를 기다리는 중...)"]))

        if (process.env.NEXT_PUBLIC_MODAL_ENDPOINT && !waiting) {
          setWaiting(true);

          ky.post(process.env.NEXT_PUBLIC_MODAL_ENDPOINT, { json: {
            question: text
          }, timeout: 120_000})
            .then((resp) => resp.text())
            .then((textResp) => {
              const response = textResp.slice(1, -1)
              setChats((cur) => [...cur.slice(0, -1), response])
            }).catch((err) => {
              setChats((cur) => cur.slice(0, -2))
              alert(err.name)
            }).finally(() => setWaiting(false))

          } else alert("NO ENDPOINT AT ENV")
      }}
    >
      <textarea
        className="p-[4px] rounded-[8px] w-full"
        value={text}
        rows={2}
        onChange={(e) => { setText(e.currentTarget.value)}}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.currentTarget.nextSibling as HTMLButtonElement | undefined)?.click();
            setText("")
          }
        }}
      />
      <button type="submit" className="flex-none w-[24px] h-[24px] hover:text-gray-600 disabled:text-gray-300" disabled={waiting || text.trim().length === 0}><IconSend/></button>
    </form>
  )
}
