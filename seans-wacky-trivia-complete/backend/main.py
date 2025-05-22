from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import threading
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Player(BaseModel):
    nickname: str
    icon: str

class Answer(BaseModel):
    nickname: str
    answer: str

players = {}
scores = {}
current_question = None
answer_lock = threading.Lock()
show_answer = False
game_started = False
timer = 13

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
    # Add more questions as needed
]

question_index = 0
submitted_answers = {}

@app.post("/join")
def join_game(player: Player):
    players[player.nickname] = player.icon
    scores[player.nickname] = 0
    return {"status": "joined"}

@app.get("/state")
def get_state():
    if not current_question:
        return {"started": game_started, "question": None}
    return {
        "started": game_started,
        "question": current_question["question"],
        "choices": current_question["choices"],
        "answer_index": current_question["answer_index"],
        "image_url": current_question["image_url"],
        "show_answer": show_answer,
        "scores": scores,
        "timer": timer
    }

@app.post("/start")
def start_game():
    global game_started, question_index, current_question
    game_started = True
    question_index = 0
    current_question = questions[question_index]
    threading.Thread(target=question_timer).start()
    return {"status": "started"}

@app.post("/answer")
def submit_answer(answer: Answer):
    with answer_lock:
        if not show_answer and answer.nickname not in submitted_answers:
            submitted_answers[answer.nickname] = answer.answer
    return {"status": "received"}

@app.post("/reset")
def reset_game():
    global players, scores, current_question, show_answer, game_started, timer, submitted_answers
    players = {}
    scores = {}
    current_question = None
    show_answer = False
    game_started = False
    timer = 13
    submitted_answers = {}
    return {"status": "reset"}

def question_timer():
    global timer, show_answer, submitted_answers, question_index, current_question
    timer = 13
    show_answer = False
    submitted_answers = {}
    while timer > 0:
        time.sleep(1)
        timer -= 1
    show_answer = True
    correct = current_question["choices"][current_question["answer_index"]]
    for player, ans in submitted_answers.items():
        if ans == correct:
            scores[player] += round((timer / 13) * 100)
    time.sleep(7)  # Show answer and leaderboard for 7 seconds
    question_index += 1
    if question_index < len(questions):
        current_question = questions[question_index]
        threading.Thread(target=question_timer).start()
    else:
        current_question = None
