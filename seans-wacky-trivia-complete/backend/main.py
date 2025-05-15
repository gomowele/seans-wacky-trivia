from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend to call this from Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or replace with your exact frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

players = []
questions = [
    {
        "question": "What is the capital of France?",
        "choices": ["Paris", "Rome", "Berlin", "Madrid"],
        "answer_index": 0,
    },
    {
        "question": "What is 2 + 2?",
        "choices": ["3", "4", "5", "22"],
        "answer_index": 1,
    },
]
current_index = -1


@app.post("/join")
def join(nickname: str = Form(...), icon_url: str = Form(...)):
    player_id = len(players)
    players.append({
        "id": player_id,
        "nickname": nickname,
        "icon_url": icon_url,
        "score": 0
    })
    return {"player_id": player_id}


@app.get("/current-question")
def current_question():
    if 0 <= current_index < len(questions):
        q = questions[current_index].copy()
        del q["answer_index"]
        return {"question": q["question"], "choices": q["choices"]}
    elif current_index >= len(questions):
        return {"status": "finished"}
    return {"status": "waiting"}


@app.post("/submit-answer")
def submit_answer(player_id: int = Form(...), answer_index: int = Form(...)):
    if 0 <= current_index < len(questions):
        correct = questions[current_index]["answer_index"]
        if answer_index == correct:
            players[player_id]["score"] += 10
    return {"status": "ok"}


@app.post("/next-question")
def next_question():
    global current_index
    current_index += 1
    if current_index < len(questions):
        return {"status": "ok", "question": questions[current_index]}
    return {"status": "finished"}


@app.get("/leaderboard")
def leaderboard():
    top5 = sorted(players, key=lambda p: -p["score"])[:5]
    winner = max(players, key=lambda p: p["score"])
    return {"top5": top5, "winner": winner}
