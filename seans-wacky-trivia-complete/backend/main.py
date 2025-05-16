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
        "question": "Who sang 'Oops!... I Did It Again'?",
        "choices": ["Christina Aguilera", "Jessica Simpson", "Britney Spears", "Mandy Moore"],
        "answer_index": 2,
        "image_url": "britney.jpg"
    },
    {
        "question": "Which group released 'No Scrubs'?",
        "choices": ["TLC", "En Vogue", "Destiny's Child", "Salt-N-Pepa"],
        "answer_index": 0,
        "image_url": "tlc.jpg"
    },
    {
        "question": "Which artist sang 'Someone Like You'?",
        "choices": ["Adele", "Taylor Swift", "Katy Perry", "Rihanna"],
        "answer_index": 0,
        "image_url": "adele.jpg"
    },
    {
        "question": "Who released 'American Idiot' in 2004?",
        "choices": ["Green Day", "Blink-182", "The Offspring", "Fall Out Boy"],
        "answer_index": 0,
        "image_url": "greenday.jpg"
    },
    {
        "question": "Which rapper is known for the song 'Lose Yourself'?",
        "choices": ["Jay-Z", "Eminem", "Nas", "50 Cent"],
        "answer_index": 1,
        "image_url": "eminem.jpg"
    },
    {
        "question": "Who made the reggaeton hit 'Danza Kuduro'?",
        "choices": ["Don Omar", "Daddy Yankee", "Bad Bunny", "Nicky Jam"],
        "answer_index": 0,
        "image_url": "don.jpg"
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
        q = questions[current_index]
        return {
            "question": q["question"],
            "choices": q["choices"],
            "image_url": q["image_url"]
        }
    elif current_index >= len(questions):
        return {"status": "finished"}
    return {"status": "waiting"}


@app.post("/submit-answer")
def submit_answer(player_id: int = Form(...), answer_index: int = Form(...)):
    if 0 <= current_index < len(questions):
        correct_index = questions[current_index]["answer_index"]
        image_url = questions[current_index]["image_url"]

        if answer_index == correct_index:
            players[player_id]["score"] += 10

        return {
            "status": "ok",
            "correct_index": correct_index,
            "image_url": image_url,
            "updated_score": players[player_id]["score"]
        }

    return {"status": "error"}



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

