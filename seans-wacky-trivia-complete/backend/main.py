from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or your actual frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/next-question")
def next_question():
    global current_index
    current_index += 1
    if current_index >= len(questions):
        return {"status": "finished"}
    return {"status": "ok", "question": questions[current_index]}

@app.post("/reset")
def reset():
    global current_index
    current_index = -1
    return {"status": "reset complete"}
