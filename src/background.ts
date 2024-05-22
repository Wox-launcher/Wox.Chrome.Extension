import {DEFAULT_SERVER_PORT} from "./const";

let ws: WebSocket | null = null;
let lastPongTime = 0;

export interface Message {
    method: string;
    data: string;
}

export interface OpenTabData {
    tabId: number;
    tabIndex: number;
    windowId: number;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.method === "isConnected") {
        let isConnected = new Date().getTime() - lastPongTime < 3000;
        sendResponse(isConnected);
    }
});

// reconnect to the server when the port is changed
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync" && changes.port) {
        if (ws) {
            ws.close();
        }
        console.log("port changed, reconnecting to the server");
        connect();
    }
});

// send ping message to server every 1 second
setInterval(() => {
    sendMsg({
        method: "ping",
        data: new Date().toLocaleTimeString(),
    })
}, 1000);

// send opened tabs to the server every 1 second
setInterval(() => {
    chrome.tabs.query({}, (tabs) => {
        sendMsg({
            method: "tabs",
            data: JSON.stringify(tabs.map((tab) => {
                return {
                    tabId: tab.id || -1,
                    windowId: tab.windowId || -1,
                    tabIndex: tab.index || -1,
                    title: tab.title || "",
                    url: tab.url || "",
                    pinned: tab.pinned || false,
                    highlighted: tab.highlighted || false,
                };
            })),
        });
    });
}, 1000);

function connect() {
    chrome.storage.sync.get(
        {
            port: DEFAULT_SERVER_PORT,
        },
        (items) => {
            const port = items.port;
            console.log("connecting to the server, port:", port);

            ws = new WebSocket("ws://localhost:" + port + "/ws");
            ws.onopen = () => {
                console.log("connected to the server");
            };
            ws.onmessage = (event) => {
                const msg = JSON.parse(event.data) as Message;
                console.log("message from server:", msg);
                if (msg.method === "pong") {
                    lastPongTime = new Date().getTime();
                }
                if (msg.method === "highlightTab") {
                    const tabData = JSON.parse(msg.data) as OpenTabData;
                    highlightTab(tabData);
                }
            };
            ws.onclose = () => {
                console.log("disconnected from the server");
                // reconnect
                setTimeout(() => {
                    connect();
                }, 3000);
            };
        }
    );
}

function highlightTab(tab: OpenTabData) {
    chrome.tabs.highlight({tabs: [tab.tabIndex], windowId: tab.windowId}, () => {
        console.log("highlighted tab:", tab);
    });
}

function sendMsg(msg: Message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(msg));
    }
}

connect();
