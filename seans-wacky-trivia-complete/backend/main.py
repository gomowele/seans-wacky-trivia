from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import threading
import random

app = Flask(__name__)
CORS(app)

# === Game State ===
players = {}  # { nickname: {score, icon} }
questions = []
current_question_index = -1
current_question = None
start_time = None
question_duration = 13  # seconds
answer_reveal_duration = 7  # seconds
reveal_time = None

game_started = False
lock = threading.Lock()

# === Load questions ===
def load_questions():
    global questions
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
        # ... Add more questions as needed
    ]
    random.shuffle(questions)

load_questions()

# === API Endpoints ===

@app.route('/join', methods=['POST'])
def join():
    data = request.json
    nickname = data['nickname']
    icon = data['icon']
    with lock:
        if nickname not in players:
            players[nickname] = {"score": 0, "icon": icon}
    return jsonify({"status": "joined", "players": list(players.keys())})

@app.route('/start', methods=['POST'])
def start():
    global game_started, current_question_index, start_time
    with lock:
        game_started = True
        current_question_index = 0
        start_time = time.time()
        load_next_question()
    return jsonify({"status": "started"})

@app.route('/state', methods=['GET'])
def get_state():
    with lock:
        if not game_started:
            return jsonify({"status": "waiting"})

        now = time.time()
        time_left = max(0, question_duration - int(now - start_time))

        show_answer = (now - start_time) >= question_duration
        next_ready = (now - start_time) >= (question_duration + answer_reveal_duration)

        if next_ready:
            next_question = load_next_question()
            if not next_question:
                return jsonify({"status": "finished"})

        return jsonify({
            "status": "active",
            "question": current_question,
            "time_left": time_left,
            "show_answer": show_answer,
            "players": players
        })

@app.route('/answer', methods=['POST'])
def answer():
    global players
    data = request.json
    nickname = data['nickname']
    choice = data['choice']

    with lock:
        if current_question is None or nickname not in players:
            return jsonify({"status": "error"})

        correct_choice = current_question['choices'][current_question['answer_index']]
        if choice == correct_choice:
            now = time.time()
            time_taken = now - start_time
            time_taken = min(time_taken, question_duration)
            score_add = round(((question_duration - time_taken) / question_duration) * 100)
            players[nickname]['score'] += score_add

        return jsonify({"status": "answered"})

@app.route('/reset', methods=['POST'])
def reset():
    global players, current_question_index, current_question, game_started, start_time
    with lock:
        players = {}
      
        current_question_index = -1
        current_question = None
        game_started = False
        start_time = None
        load_questions()
    return jsonify({"status": "reset"})

# === Helper ===
def load_next_question():
    global current_question_index, current_question, start_time
    current_question_index += 1
    if current_question_index >= len(questions):
        return False
    current_question = questions[current_question_index]
    start_time = time.time()
    return True

# === Run ===
if __name__ == '__main__':
    app.run(debug=True)
