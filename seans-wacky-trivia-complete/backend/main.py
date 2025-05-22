from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.background import BackgroundTasks
import threading, time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Game state
state = {
    "players": {},
    "question_index": 0,
    "show_answer": False,
    "started": False,
    "timer": 13,
    "answers": {},
    "lock": threading.Lock()
}

questions = [
    {
        "question": "Which artist released 'Rolling in the Deep' in 2010?",
        "choices": ["Adele", "P!nk", "Kelly Clarkson", "Lorde"],
        "answer_index": 0,
        "image_url": "adele.jpg"
    },
    {
        "question": "'Hey Ya!' was a 2003 hit from which hip-hop duo?",
        "choices": ["OutKast", "The Roots", "UGK", "Mobb Deep"],
        "answer_index": 0,
        "image_url": "outkast.jpg"
    },
    {
        "question": "Which band sang: 'Wonderwall' in the 90s?",
        "choices": ["Nirvana", "Oasis", "Radiohead", "Smashing Pumpkins"],
        "answer_index": 1,
        "image_url": "oasis.jpg"
    }
    # Add more as needed
]

def game_loop():
    while state["started"] and state["question_index"] < len(questions):
        with state["lock"]:
            state["timer"] = 13
            state["show_answer"] = False
            state["answers"] = {}

        # Countdown
        while state["timer"] > 0:
            time.sleep(1)
            with state["lock"]:
                state["timer"] -= 1

        # Reveal answer
        with state["lock"]:
            state["show_answer"] = True
            correct = questions[state["question_index"]]["choices"][questions[state["question_index"]]["answer_index"]]
            for name, answer in state["answers"].items():
                if answer == correct:
                    state["players"][name]["score"] += int((state["timer"] / 13) * 100)

        time.sleep(7)
        with state["lock"]:
            state["question_index"] += 1

    with state["lock"]:
        state["started"] = False


@app.post("/join")
async def join_game(request: Request):
    data = await request.json()
    name = data.get("nickname")
    icon = data.get("icon")
    with state["lock"]:
        if name not in state["players"]:
            state["players"][name] = {"score": 0, "icon": icon}
    return {"status": "joined"}


@app.post("/start")
def start_game(background_tasks: BackgroundTasks):
    with state["lock"]:
        state["started"] = True
        state["question_index"] = 0
        state["players"] = {name: {"score": 0, "icon": player["icon"]} for name, player in state["players"].items()}
    background_tasks.add_task(game_loop)
    return {"status": "started"}


@app.post("/answer")
async def submit_answer(request: Request):
    data = await request.json()
    name = data.get("nickname")
    answer = data.get("answer")
    with state["lock"]:
        if name in state["players"] and not state["show_answer"]:
            state["answers"][name] = answer
    return {"status": "recorded"}


@app.post("/reset")
def reset_game():
    with state["lock"]:
        state["players"] = {}
        state["question_index"] = 0
        state["show_answer"] = False
        state["started"] = False
        state["timer"] = 13
        state["answers"] = {}
    return {"status": "reset complete"}


@app.get("/state")
def get_state():
    with state["lock"]:
        if state["question_index"] >= len(questions):
            return {"finished": True}
        q = questions[state["question_index"]]
        return {
            "question": q["question"],
            "choices": q["choices"],
            "answer_index": q["answer_index"],
            "image_url": q["image_url"],
            "timer": state["timer"],
            "show_answer": state["show_answer"],
            "started": state["started"],
            "scores": {name: player["score"] for name, player in state["players"].items()}
        }


@app.get("/")
def root():
    return {"message": "Trivia backend is running"}
