import React, {useEffect, useState} from "react";
import {createRoot} from "react-dom/client";
import {DEFAULT_SERVER_PORT} from "./const";

const Popup = () => {
    const [port, setPort] = useState<string>("34988");
    const [status, setStatus] = useState<string>("");
    const [isConnected, setIsConnected] = useState<boolean>(false);

    useEffect(() => {
        chrome.storage.sync.get(
            {
                port: DEFAULT_SERVER_PORT,
            },
            (items) => {
                setPort(items.port);
            }
        );

        checkConnected();
    }, []);

    useEffect(() => {
        const t = setInterval(checkConnected, 1000);
        return () => clearInterval(t);
    }, []);

    const checkConnected = () => {
        chrome.runtime.sendMessage(
            {
                method: "isConnected",
                data: "",
            },
            (response) => {
                console.log("isConnected:", response);
                setIsConnected(response);
            }
        );
    };

    const saveOptions = () => {
        chrome.storage.sync.set(
            {
                port: port,
            },
            () => {
                setStatus("Options saved.");
                const id = setTimeout(() => {
                    setStatus("");
                }, 1000);
                return () => clearTimeout(id);
            }
        );
    };

    return (
        <div style={{width: 200}}>
            <div style={{marginBottom: 20}}>
                Server Port: <input type="text" value={port} onChange={(event) => setPort(event.target.value)}/>
            </div>
            <div style={{marginBottom: 20}}>Connected: {isConnected ? "yes" : "no"}</div>
            <button onClick={saveOptions}>Save</button>
            <div>{status}</div>
        </div>
    );
};

const root = createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Popup/>
    </React.StrictMode>
);
