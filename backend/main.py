from fastapi import FastAPI, Request # type: ignore
from app.routers import example
from fastapi.middleware.cors import CORSMiddleware # type: ignore
import openai # type: ignore
import os
from dotenv import load_dotenv # type: ignore
import asyncio
import time
from fastapi import WebSocket, WebSocketDisconnect # type: ignore
from collections import deque
from typing import Dict

load_dotenv()

app = FastAPI()

app.include_router(example.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.chat_history: Dict[WebSocket, deque] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.chat_history[websocket] = deque(maxlen=10)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        del self.chat_history[websocket]

    async def send_message(self, message: str, websocket: WebSocket):
        await websocket.send_json(message)

manager = ConnectionManager()


@app.websocket("/chat")
async def chat(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()

            manager.chat_history[websocket].append({"role": "user", "content": data})

            try:
                response = await client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=manager.chat_history[websocket],
                    max_tokens=1000,
                    stream=True 
                )

                ai_reponse = ""
                async for chunk in response:
                    if chunk.choices[0].delta.content:
                        ai_reponse += chunk.choices[0].delta.content
                        await manager.send_message({"type": "chunk", "role": "assistant", "content": chunk.choices[0].delta.content}, websocket)
                        await asyncio.sleep(0.05)

                manager.chat_history[websocket].append({"role": "assistant", "content": ai_reponse})
            except Exception as e:
                print(f"Error: {e}")
                await manager.send_message({"type": "error", "role": "assistant", "content": f"Error: {e}"}, websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)