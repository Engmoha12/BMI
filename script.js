document.addEventListener('DOMContentLoaded', () => {
    // Elements - Inputs
    const form = document.getElementById('bmiForm');
    const heightUnitToggle = document.getElementById('heightUnitToggle');
    const weightUnitToggle = document.getElementById('weightUnitToggle');
    const metricHeight = document.getElementById('metricHeight');
    const imperialHeight = document.getElementById('imperialHeight');
    const weightUnitText = document.getElementById('weightUnitText');
    const heightCm = document.getElementById('heightCm');
    const heightFt = document.getElementById('heightFt');
    const heightIn = document.getElementById('heightIn');
    const weightInput = document.getElementById('weight');
    const ageInput = document.getElementById('age');
    const genderInputs = document.querySelectorAll('input[name="gender"]');

    // Elements - UI
    const resultInitial = document.getElementById('resultInitial');
    const resultDisplay = document.getElementById('resultDisplay');
    const bmiValueText = document.getElementById('bmiValue');
    const bmiBadge = document.getElementById('bmiBadge');
    const bmiAdviceText = document.getElementById('bmiAdvice');
    const bmiPointer = document.getElementById('bmiPointer');
    const resetBtn = document.getElementById('resetBtn');
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;

    // --- Theme Logic ---
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-bs-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        htmlElement.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    }

    // --- Unit Toggle Logic ---
    heightUnitToggle.addEventListener('change', () => {
        if (heightUnitToggle.checked) {
            metricHeight.classList.add('d-none');
            imperialHeight.classList.remove('d-none');
        } else {
            metricHeight.classList.remove('d-none');
            imperialHeight.classList.add('d-none');
        }
        calculateBMI();
    });

    weightUnitToggle.addEventListener('change', () => {
        weightUnitText.textContent = weightUnitToggle.checked ? 'lbs' : 'kg';
        calculateBMI();
    });

    // --- Calculation Logic ---
    function calculateBMI() {
        let weightKg = 0;
        let heightM = 0;

        // Get Weight
        const weightVal = parseFloat(weightInput.value);
        if (isNaN(weightVal) || weightVal <= 0) return hideResult();

        if (weightUnitToggle.checked) {
            weightKg = weightVal * 0.453592; // lbs to kg
        } else {
            weightKg = weightVal;
        }

        // Get Height
        if (heightUnitToggle.checked) {
            const ft = parseFloat(heightFt.value) || 0;
            const inch = parseFloat(heightIn.value) || 0;
            if (ft === 0 && inch === 0) return hideResult();
            heightM = (ft * 12 + inch) * 0.0254; // inches to meters
        } else {
            const cm = parseFloat(heightCm.value);
            if (isNaN(cm) || cm <= 0) return hideResult();
            heightM = cm / 100;
        }

        if (heightM === 0) return hideResult();

        const bmi = weightKg / (heightM * heightM);
        showResult(bmi);
        saveLastResult(bmi);
    }

    function showResult(bmi) {
        resultInitial.classList.add('d-none');
        resultDisplay.classList.remove('d-none');
        
        const bmiFixed = bmi.toFixed(1);
        bmiValueText.textContent = bmiFixed;

        const classification = getBMIClassification(bmi);
        
        // Update Badge
        bmiBadge.textContent = classification.label;
        bmiBadge.className = `badge rounded-pill px-3 py-2 mb-3 bg-${classification.class}`;
        
        // Update Advice
        bmiAdviceText.textContent = classification.advice;
        
        // Update Pointer
        updatePointer(bmi);
    }

    function hideResult() {
        resultInitial.classList.remove('d-none');
        resultDisplay.classList.add('d-none');
    }

    function getBMIClassification(bmi) {
        if (bmi < 18.5) {
            return {
                label: 'Underweight',
                class: 'underweight',
                advice: 'Your BMI indicates you are underweight. Consider consulting with a healthcare provider to discuss nutritional needs and healthy weight gain strategies.'
            };
        } else if (bmi < 25) {
            return {
                label: 'Normal Weight',
                class: 'normal',
                advice: 'Congratulations! Your BMI falls within the healthy range. Maintain your current lifestyle with a balanced diet and regular physical activity.'
            };
        } else if (bmi < 30) {
            return {
                label: 'Overweight',
                class: 'overweight',
                advice: 'Your BMI indicates you are slightly overweight. Focus on a balanced diet and increasing physical activity to help manage your weight effectively.'
            };
        } else {
            return {
                label: 'Obese',
                class: 'obese',
                advice: 'Your BMI falls within the obese range. It is recommended to speak with a healthcare professional to create a personalized health and wellness plan.'
            };
        }
    }

    function updatePointer(bmi) {
        // Map BMI to percentage for the pointer position
        // Scale 15 to 35 covers most relevant range
        let percentage = 0;
        if (bmi < 15) percentage = 0;
        else if (bmi > 40) percentage = 100;
        else {
            // Simplified linear mapping for visualization
            // Underweight: 0-18.5 -> 0-18.5%
            // Normal: 18.5-25 -> 18.5-43.5%
            // Overweight: 25-30 -> 43.5-73.5%
            // Obese: 30+ -> 73.5-100%
            if (bmi < 18.5) {
                percentage = (bmi / 18.5) * 18.5;
            } else if (bmi < 25) {
                percentage = 18.5 + ((bmi - 18.5) / 6.5) * 25;
            } else if (bmi < 30) {
                percentage = 43.5 + ((bmi - 25) / 5) * 30;
            } else {
                percentage = 73.5 + ((bmi - 30) / 10) * 26.5;
            }
        }
        
        // Clamp between 2% and 98% for visual safety
        percentage = Math.max(2, Math.min(98, percentage));
        bmiPointer.style.left = `${percentage}%`;
    }

    // --- Persistence Logic ---
    function saveLastResult(bmi) {
        const data = {
            bmi: bmi,
            weight: weightInput.value,
            wUnit: weightUnitToggle.checked,
            hCm: heightCm.value,
            hFt: heightFt.value,
            hIn: heightIn.value,
            hUnit: heightUnitToggle.checked,
            age: ageInput.value,
            gender: document.querySelector('input[name="gender"]:checked').value
        };
        localStorage.setItem('lastBMI', JSON.stringify(data));
    }

    function loadLastResult() {
        const data = JSON.parse(localStorage.getItem('lastBMI'));
        if (!data) return;

        // Restore values
        weightInput.value = data.weight;
        weightUnitToggle.checked = data.wUnit;
        heightCm.value = data.hCm;
        heightFt.value = data.hFt;
        heightIn.value = data.hIn;
        heightUnitToggle.checked = data.hUnit;
        ageInput.value = data.age;
        
        const genderInput = document.querySelector(`input[name="gender"][value="${data.gender}"]`);
        if (genderInput) genderInput.checked = true;

        // Update UI state
        if (data.hUnit) {
            metricHeight.classList.add('d-none');
            imperialHeight.classList.remove('d-none');
        }
        weightUnitText.textContent = data.wUnit ? 'lbs' : 'kg';

        // Trigger calculation
        calculateBMI();
    }

    // --- Event Listeners ---
    [heightCm, heightFt, heightIn, weightInput, ageInput].forEach(el => {
        el.addEventListener('input', calculateBMI);
    });

    genderInputs.forEach(el => {
        el.addEventListener('change', calculateBMI);
    });

    resetBtn.addEventListener('click', () => {
        form.reset();
        weightUnitToggle.checked = false;
        heightUnitToggle.checked = false;
        metricHeight.classList.remove('d-none');
        imperialHeight.classList.add('d-none');
        weightUnitText.textContent = 'kg';
        hideResult();
        localStorage.removeItem('lastBMI');
    });

    // Initialize
    loadLastResult();
});
