import { useEffect, useRef, useState } from "react";
import "./App.css";
import {
  MantineProvider,
  Text,
  Button,
  Box,
  Image,
  Textarea,
  ActionIcon,
  Loader,
} from "@mantine/core";
import urlJoin from "url-join";
import { COOKIE_NAME, url } from "./components/common";
import { AnswerMessage } from "./types";
import { useCookies } from "react-cookie";

type Chat =
  | {
      type: "question";
      message: string;
    }
  | {
      type: "answer";
      content: AnswerMessage;
    };

export async function sleep(msec: number): Promise<unknown> {
  return new Promise((resolve) => {
    setTimeout(resolve, msec);
  });
}

const commonStyle =
  "max-w-[385px] break-words w-fit rounded-xl  py-1 px-2 text-black shadow-xl";

function App() {
  const [message, setMessage] = useState<string>("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cookie, setCookie] = useCookies([COOKIE_NAME]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cookie[COOKIE_NAME]) {
      const randomId = Math.random().toString(36).substring(7);
      setCookie(COOKIE_NAME, randomId);
    }
  }, [cookie, setCookie]);

  const scrollToBottom = () => {
    if (messagesEndRef && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  useEffect(scrollToBottom, [chats]);

  const submitQuestion = (message: string) => {
    if (message === "") return;
    setIsLoading(true);
    const updatedChats: Chat[] = [...chats, { type: "question", message }];
    setChats(updatedChats);

    getAnswerMessage(message, updatedChats);
    setMessage("");
  };

  const getAnswerMessage = async (message: string, chats: Chat[]) => {
    const session_id = cookie[COOKIE_NAME];

    const res = await fetch(urlJoin(url, `/chat-messages/${session_id}`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
      }),
    });
    if (!res.ok) {
      const error = new Error("不具合が発生しました");
      console.error(error);
    }

    const json = await res.json();
    console.log("json", json);

    const updatedChats: Chat[] = [...chats, { type: "answer", content: json }];

    setChats(updatedChats);
    setIsLoading(false);
  };

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Box className="bg-slate-200 min-h-screen flex items-center justify-center">
        <Box className="w-[600px]">
          <header className="max-h-[10vh]">
            <Text
              className="text-2xl p-2 border items-center my-2"
              style={{ borderBottom: "2px solid gray" }}
            >
              ゆるふわ検索
            </Text>
          </header>
          <Box className="h-[70vh] overflow-auto">
            {chats.length > 0
              ? chats.map((chat, i) => {
                  return (
                    <Box key={`${i}:${chat}`} className="my-4 ">
                      {chat.type === "question" ? (
                        <Text
                          className={`${commonStyle} bg-orange-100 ml-auto rounded-br-none`}
                        >
                          {chat.message}
                        </Text>
                      ) : (
                        <>
                          <Box className="flex items-end">
                            <ActionIcon
                              className="bg-cyan-200 border-cyan-200"
                              size="lg"
                              mr="xs"
                              radius="xl"
                              variant="default"
                            />

                            <Text
                              className={`${commonStyle} bg-cyan-200 mr-auto rounded-bl-none p-1`}
                            >
                              {chat.content.message}
                            </Text>
                          </Box>
                          <Box className="flex overflow-x-auto">
                            {chat.content.items.length > 0
                              ? chat.content.items.map((value) => {
                                  return (
                                    <Image
                                      maw={380}
                                      miw={280}
                                      my="md"
                                      mr="md"
                                      radius="md"
                                      src={value.image_url}
                                      alt={value.description}
                                    />
                                  );
                                })
                              : null}
                          </Box>
                        </>
                      )}
                    </Box>
                  );
                })
              : null}
            {isLoading ? (
              <Box className="flex items-end">
                <ActionIcon
                  className="bg-cyan-200 border-cyan-200"
                  size="lg"
                  mr="xs"
                  radius="xl"
                  variant="default"
                />
                <Text
                  className={`${commonStyle} bg-cyan-200 mr-auto rounded-bl-none p-1`}
                >
                  検索中です。お待ちください
                  <Loader
                    size="xs"
                    color="dark"
                    variant="dots"
                    className="mx-2"
                  />
                </Text>
              </Box>
            ) : null}
            <Box ref={messagesEndRef} />
          </Box>
          <Box className="flex my-4 max-h-[20vh] items-center">
            <Textarea
              placeholder="質問をどうぞ..."
              className="bg-blue-50 rounded-md w-full"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              minRows={4}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.keyCode === 13)) {
                  submitQuestion(message);
                  setMessage("");
                }
              }}
            />
            <Button
              className="ml-3 disabled:bg-opacity-30 disabled:bg-blue-300"
              onClick={() => submitQuestion(message)}
              disabled={isLoading}
            >
              送信
            </Button>
          </Box>
        </Box>
      </Box>
    </MantineProvider>
  );
}

export default App;
