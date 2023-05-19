import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { rest, setupWorker } from "msw";
import reportWebVitals from "./reportWebVitals";
import urlJoin from "url-join";
import { url } from "./components/common";
import { AnswerMessage, QuestionMessage } from "./types";

const worker = setupWorker(
  rest.post<QuestionMessage>(
    urlJoin(url, "/chat-messages/:session_id"),
    async (req, res, ctx) => {
      const { message } = await req.json();

      return res(
        ctx.json({
          items: [
            {
              description: "string",
              id: "string",
              image_url: "http://localhost:3000/images/sampleA.jpg",
            },
            {
              description: "string",
              id: "string",
              image_url: "http://localhost:3000/images/sampleB.jpg",
            },
          ],
          message: `answer:${message}${message}${message}${message}${message}${message}`,
        } as AnswerMessage),
        ctx.delay(2000)
      );
    }
  )
);

worker.start();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
