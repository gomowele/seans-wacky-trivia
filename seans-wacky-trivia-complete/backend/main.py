with state["lock"]:
    state["show_answer"] = True
    correct_index = questions[state["question_index"]]["answer_index"]
    correct = questions[state["question_index"]]["choices"][correct_index]
    for name, data in state["players"].items():
        answer = state["answers"].get(name)
        if answer == correct:
            data["score"] += 100
