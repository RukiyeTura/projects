from flask import Flask, request, jsonify, render_template
import json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate_time', methods=['POST'])
def calculate_time():
    steps = request.json

    #Idiot Way
    total_async_time = sum(step['time'] for step in steps)

    #Parallel Way
    actual_time = calculate_parallel_time(steps)

    return jsonify({
        'total_async_time': total_async_time,
        'actual_time': actual_time
    })

def calculate_parallel_time(steps):
    step_finish_times = {}

    for step in steps:
        step_id = step['step_id']
        time = step['time']
        needs_chef = step['needs_chef']
        depends_on = step['depends_on']

        earliest_start_time = 0
        
        for dependency in depends_on:
            if dependency in step_finish_times:
                earliest_start_time = max(earliest_start_time, step_finish_times[dependency])


        start_time = earliest_start_time
        finish_time = start_time + time 
        step_finish_times[step_id] = finish_time

    actual_time = max(step_finish_times.values())
    return actual_time



if __name__ == '__main__':
    app.run(debug=True)
