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
    # 🎧 Pop
    {
        "question": "Finish this Britney lyric: 'Oops!... I did it again, I played with your ___.'",
        "choices": ["time", "heart", "feelings", "mind"],
        "answer_index": 1
    },

    # 🎤 Hip-Hop
    {
        "question": "'Hey Ya!' was a 2003 hit from which hip-hop duo?",
        "choices": ["OutKast", "The Roots", "UGK", "Mobb Deep"],
        "answer_index": 0
    },

    # 🎶 R&B
    {
        "question": "'No Scrubs' was a 1999 hit for which girl group?",
        "choices": ["Destiny’s Child", "SWV", "En Vogue", "TLC"],
        "answer_index": 3
    },

    # 🎸 Rock
    {
        "question": "'Boulevard of Broken Dreams' was a hit by which band?",
        "choices": ["Green Day", "Red Hot Chili Peppers", "Coldplay", "Linkin Park"],
        "answer_index": 0
    },

    # 🎤 Reggaeton / Latin
    {
        "question": "Which Latin artist sang 'Bidi Bidi Bom Bom'?",
        "choices": ["Shakira", "Selena Quintanilla", "Paulina Rubio", "Jennifer Lopez"],
        "answer_index": 1
    },

    # 🎧 Pop
    {
        "question": "Which artist released 'Rolling in the Deep' in 2010?",
        "choices": ["Adele", "P!nk", "Kelly Clarkson", "Lorde"],
        "answer_index": 0
    },

    # 🎶 R&B
    {
        "question": "Who sang: 'I believe I can fly' in the late 90s?",
        "choices": ["Usher", "R. Kelly", "Brian McKnight", "Tyrese"],
        "answer_index": 1
    },

    # 🎤 Hip-Hop
    {
        "question": "Which artist released 'Lose Yourself' in 2002?",
        "choices": ["Jay-Z", "Eminem", "Nas", "50 Cent"],
        "answer_index": 1
    },

    # 🎸 Rock
    {
        "question": "Which band sang: 'Wonderwall' in the 90s?",
        "choices": ["Nirvana", "Oasis", "Radiohead", "Smashing Pumpkins"],
        "answer_index": 1
    },

    # 🎤 Reggaeton
    {
        "question": "'Danza Kuduro' was a global hit by which artist?",
        "choices": ["Don Omar", "Daddy Yankee", "Luis Fonsi", "Romeo Santos"],
        "answer_index": 0
    }
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

@app.post("/reset")
def reset():
    global players, current_index
    players = []
    current_index = -1
    return {"status": "reset complete"}

