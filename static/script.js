document.addEventListener('DOMContentLoaded', () => {
    const stepsContainer = document.getElementById('steps-container');
    const addStepBtn = document.getElementById('add-step-btn');
    const calculateBtn = document.getElementById('calculate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const uploadJsonInput = document.getElementById('upload-json');
    const asyncTimeDisplay = document.getElementById('async-time');
    const realTimeDisplay = document.getElementById('real-time');
    let steps = [];

    // Add a new step
    addStepBtn.addEventListener('click', () => {
        const stepId = steps.length + 1;

        const stepDiv = document.createElement('div');
        stepDiv.classList.add('step');
        stepDiv.innerHTML = `
            <label>Step ${stepId}</label>
            <input type="text" placeholder="Description" class="step-description">
            <input type="number" placeholder="Time (mins)" class="step-time">
            <label>Needs Chef?</label>
            <input type="checkbox" class="needs-chef">
            <label>Depends on step IDs:</label>
            <input type="text" class="depends-on" placeholder="e.g. 1, 2">
            <button class="remove-step-btn">Remove</button>
        `;

        stepDiv.querySelector('.remove-step-btn').addEventListener('click', () => {
            stepsContainer.removeChild(stepDiv);
            steps = steps.filter(step => step.id !== stepId);
        });

        stepsContainer.appendChild(stepDiv);
        steps.push({ id: stepId });
    });

    // Calculate time (fetch and display results)
    calculateBtn.addEventListener('click', () => {
        steps = Array.from(stepsContainer.getElementsByClassName('step')).map((stepDiv, index) => ({
            step_id: index + 1,
            description: stepDiv.querySelector('.step-description').value, // Get description
            time: parseInt(stepDiv.querySelector('.step-time').value),
            needs_chef: stepDiv.querySelector('.needs-chef').checked,
            depends_on: stepDiv.querySelector('.depends-on').value
                .split(',')
                .map(id => parseInt(id.trim()))
                .filter(id => !isNaN(id))
        }));

        fetch('/calculate_time', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(steps)
        })
        .then(res => res.json())
        .then(data => {
            asyncTimeDisplay.innerText = data.total_async_time;
            realTimeDisplay.innerText = data.actual_time;
        });
    });

    // Download recipe as JSON
    downloadBtn.addEventListener('click', () => {
        const file = new Blob([JSON.stringify(steps, null, 4)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = 'recipe.json';
        link.click();
    });

    // Upload and import recipe
    uploadJsonInput.addEventListener('change', () => {
        const file = uploadJsonInput.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const importedSteps = JSON.parse(reader.result);
            stepsContainer.innerHTML = '';
            steps = importedSteps;
            steps.forEach(step => {
                const stepDiv = document.createElement('div');
                stepDiv.classList.add('step');
                stepDiv.innerHTML = `
                    <label>Step ${step.step_id}</label>
                    <input type="text" value="${step.description}" class="step-description" placeholder="Description">
                    <input type="number" value="${step.time}" class="step-time">
                    <label>Needs Chef?</label>
                    <input type="checkbox" class="needs-chef" ${step.needs_chef ? 'checked' : ''}>
                    <label>Depends on step IDs:</label>
                    <input type="text" class="depends-on" value="${step.depends_on.join(', ')}" placeholder="e.g. 1, 2">
                    <button class="remove-step-btn">Remove</button>
                `;

                stepDiv.querySelector('.remove-step-btn').addEventListener('click', () => {
                    stepsContainer.removeChild(stepDiv);
                    steps = steps.filter(s => s.step_id !== step.step_id);
                });

                stepsContainer.appendChild(stepDiv);
            });
        };
        reader.readAsText(file);
    });
});
