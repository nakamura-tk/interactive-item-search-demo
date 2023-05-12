import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { Button, MantineProvider } from "@mantine/core";

function App() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="text-3xl font-bold underline text-blue-500">
            Hello world!
          </h1>
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          <Button
            className="ml-3 disabled:bg-opacity-30 disabled:bg-blue-300 bg-red-500"
            // onClick={() => submitQuestion(message)}
            // disabled={isLoading}
          >
            送信
          </Button>
        </header>
      </div>
    </MantineProvider>
  );
}

export default App;
