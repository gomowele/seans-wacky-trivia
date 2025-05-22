from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.background import BackgroundTasks
import threading, time
import random
import asyncio

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
    },
    {
        "question": "Who was known as the Queen of Tejano music?",
        "choices": ["Selena", "Gloria Estefan", "Shakira", "Jennifer Lopez"],
        "answer_index": 0,
        "image_url": "selena.jpg"
    },
    {
        "question": "Who released the reggaeton hit 'Dile'?",
        "choices": ["Don Omar", "Daddy Yankee", "Nicky Jam", "Wisin"],
        "answer_index": 0,
        "image_url": "donomar.jpg"
    },
    {
        "question": "Which rapper released 'Lose Yourself'?",
        "choices": ["Jay-Z", "Eminem", "Dr. Dre", "50 Cent"],
        "answer_index": 1,
        "image_url": "eminem.jpg"
    },
    {
        "question": "Who released the hit 'Tití Me Preguntó'?",
        "choices": ["Bad Bunny", "J Balvin", "Ozuna", "Anuel AA"],
        "answer_index": 0,
        "image_url": "badbunny.jpg"
    },
    {
        "question": "Which R&B artist is known for the song 'Ignition (Remix)'?",
        "choices": ["Usher", "Ne-Yo", "R. Kelly", "Chris Brown"],
        "answer_index": 2,
        "image_url": "rkelly.jpg"
    },
    {
        "question": "Who sang 'Boulevard of Broken Dreams'?",
        "choices": ["Green Day", "Blink-182", "Linkin Park", "Sum 41"],
        "answer_index": 0,
        "image_url": "greenday.jpg"
    },
    {
        "question": "Which group is known for 'No Scrubs'?",
        "choices": ["Destiny's Child", "TLC", "En Vogue", "SWV"],
        "answer_index": 1,
        "image_url": "tlc.jpg"
    }
]

def game_loop():
    while True:
        with state["lock"]:
            if not state["started"] or state["question_index"] >= len(questions):
                state["started"] = False
                break
            state["timer"] = 13
            state["show_answer"] = False
            state["answers"] = {}

        for _ in range(13):
            time.sleep(1)
            with state["lock"]:
                state["timer"] -= 1

        with state["lock"]:
            state["show_answer"] = True
            correct_index = questions[state["question_index"]]["answer_index"]
            correct = questions[state["question_index"]]["choices"][correct_index]
            for name in state["players"]:
                answer = state["answers"].get(name)
                if answer == correct:
                    state["players"][name]["score"] += 100

        time.sleep(7)

        with state["lock"]:
            state["question_index"] += 1

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
        for name in state["players"]:
            state["players"][name]["score"] = 0
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
            top_score = max(state["players"].values(), key=lambda p: p["score"], default={"score": 0})
            leaderboard = [
                {"name": name, "score": p["score"], "icon": p["icon"], "top": p["score"] == top_score["score"]}
                for name, p in state["players"].items()
            ]
            return {"finished": True, "leaderboard": leaderboard}

        q = questions[state["question_index"]]
        return {
            "question": q["question"],
            "choices": q["choices"],
            "image_url": q["image_url"],
            "answer_index": q["answer_index"],
            "timer": state["timer"],
            "show_answer": state["show_answer"],
            "started": state["started"],
            "scores": state["players"]
        }

@app.get("/")
def root():
    return {"message": "Trivia backend is running"}
