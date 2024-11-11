var jsPsychPracticeNegationRating = (function (jspsych) {
  "use strict";

  const info = {
    name: 'practice-negation-rating',
    parameters: {
      timer: {
        type: jspsych.ParameterType.INT,
        pretty_name: 'timer',
        default: 20,
        description: 'Amount of time (s) on timer'
      },
      practice_negation_timeout: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: 'practice negation timeout',
        default: false,
        description: 'Whether negation timed out on previous trial'
      },
    }
  };

  class PracticeNegationRatingPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, parameters) {

      let timer = parameters.timer;

      // Define CSS styling.
      const html = `
      <style>
        body {
          height: 100vh;
          max-height: 100vh;
          overflow: hidden;
          position: fixed;
        }
        .timer {
          font-size: 24px;
          position: fixed;
          top: 10px;
          right: 10px; /* Position it 10px from the right of the screen */
          padding: 10px;
          background-color: rgba(0, 0, 0, 0.7); /* Semi-transparent background */
          color: white; /* White text */
          border-radius: 5px; /* Rounded corners */
          z-index: 9999; /* Ensure it appears above other elements */
        }
        .likert-box {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: auto;
          height: auto;
          background: #ffffff;
          border: 2px solid black;
          border-radius: 12px;
          font-size: 16px;
          line-height: 1.5em;
          padding: 20px;
        }
        .likert-scale {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .scale-container {
          display: flex; /* Ensure that scale items are in a row */
          flex-direction: row; /* Change to row */
          justify-content: space-around; /* Space items evenly */
          flex-grow: 1; /* Allow the container to grow */
        }
        .scale-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .first-anchor, .last-anchor {
          display: inline;
          white-space: nowrap;
        }
        input[type='radio'] {
          position: relative;
          appearance: none;
          border: 2px solid #000;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          margin: 2.5px;
        }
        input[type='radio']:checked {
          background-color: #000;
        }
        input[type='submit'] {
          display: block;
          margin: 20px auto;
          padding: 10px 20px;
        }
      </style>
      `;

      // Prepare HTML structure
      display_element.innerHTML = html;
      const likertBox = document.createElement('div');
      likertBox.className = 'likert-box';
      display_element.appendChild(likertBox);

      // Top text
      likertBox.innerHTML += '<h4>Imagine that <b>you are the male speaker</b> in this conversation. How fully do you believe:</h4>';

      // Wrap the statements and scales in a container
      const statementContainer = document.createElement('div');
      statementContainer.style.display = 'flex';
      statementContainer.style.justifyContent = 'space-between';
      statementContainer.style.alignItems = 'center';
      statementContainer.style.marginBottom = '20px';

      // Add the first statement and scale
      const midLeftDiv = document.createElement('div');
      midLeftDiv.style.marginRight = '150px'; 
      midLeftDiv.innerHTML = '<h4>he understood his partner</h4>';
      midLeftDiv.appendChild(this.createLikertScale('midLeft'));

      // Add the second statement and scale
      const midRightDiv = document.createElement('div');
      midRightDiv.innerHTML = '<h4>his partner understood him</h4>';
      midRightDiv.appendChild(this.createLikertScale('midRight'));

      // Append both to the container
      statementContainer.appendChild(midLeftDiv);
      statementContainer.appendChild(midRightDiv);

      // Add the statement container to the likert box
      likertBox.appendChild(statementContainer);

      // Bottom text
      likertBox.innerHTML += '<div class="jspsych-survey-multi-choice-postamble"><h4>in this moment?</h4></div>';

      // Submit button
      const submitButton = document.createElement('input');
      submitButton.type = 'submit';
      submitButton.value = 'Continue';
      submitButton.disabled = true; // Disable the button initially
      likertBox.appendChild(submitButton);

      // Set up event listeners for radio buttons
      this.selectedRatings = { midLeft: null, midRight: null };
      this.setupListeners();

      // Handle form submission
      submitButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default form submission
        this.handleSubmit();
      });

      // start timer
      this.startTimer(display_element, timer);
    }

    createLikertScale(scaleName) {
      const scaleContainer = document.createElement('div');
      scaleContainer.className = 'likert-scale';
      scaleContainer.innerHTML = `
        <div class="first-anchor">not at all</div>
        <div class="scale-container">
          ${[...Array(11).keys()].map(i => `
            <div class="scale-item">
              <label for="${scaleName}-scale${i}" style="position: relative;">
                <input type="radio" name="${scaleName}-scale" value="${i}" id="${scaleName}-scale${i}">
                <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); ">${i}</span>
              </label>
            </div>
          `).join('')}
        </div>
        <div class="last-anchor">completely</div>
      `;
      return scaleContainer;
    }
    

    setupListeners() {
      const midLeftButtons = document.querySelectorAll('input[name="midLeft-scale"]');
      const midRightButtons = document.querySelectorAll('input[name="midRight-scale"]');

      midLeftButtons.forEach(button => {
        button.addEventListener('change', () => {
          this.selectedRatings.midLeft = parseInt(button.value);
          this.checkRatings();
        });
      });

      midRightButtons.forEach(button => {
        button.addEventListener('change', () => {
          this.selectedRatings.midRight = parseInt(button.value);
          this.checkRatings();
        });
      });
    }

    checkRatings() {
      // Enable the submit button only if both ratings are selected
      const submitButton = document.querySelector('input[type="submit"]');
      if (this.selectedRatings.midLeft !== null && this.selectedRatings.midRight !== null) {
        submitButton.disabled = false;
      } else {
        submitButton.disabled = true;
      }
    }

    handleSubmit() {
      if (this.selectedRatings.midLeft !== null && this.selectedRatings.midRight !== null) {
        this.trialSubmitted = true;
        this.jsPsych.finishTrial({
          practice_response_left: this.selectedRatings.midLeft,
          practice_response_right: this.selectedRatings.midRight,
        });
        saveData();
      } else {
        alert('Please select ratings for both statements before continuing.');
      }
    }

    startTimer(display_element, timer) {
      const timerElement = document.createElement('div');
      timerElement.className = 'timer';
      timerElement.innerHTML = `<p>Time Remaining: <span id="timer">${timer}</span> seconds</p>`;
      display_element.appendChild(timerElement);
    
      const timerSpan = document.getElementById('timer');
    
      // Timer logic
      const interval = setInterval(() => {
        if (timer <= 0) {
          clearInterval(interval);
          this.handleAutoSubmit();
        } else {
          timer--;
          timerSpan.innerText = timer;
        }
      }, 1000);
    }

    handleAutoSubmit() {
      if (this.trialSubmitted) {
        return;
      }
    
      if (this.selectedRatings.midLeft !== null && this.selectedRatings.midRight !== null) {
        this.jsPsych.finishTrial({
          practice_response_left: this.selectedRatings.midLeft,
          practice_response_right: this.selectedRatings.midRight,
          practice_negation_timeout: false
        });
      } else {
        this.jsPsych.finishTrial({
          practice_response_left: null,
          practice_response_right: null,
          practice_negation_timeout: true
        });
      }
    }
  }

  PracticeNegationRatingPlugin.info = info;

  return PracticeNegationRatingPlugin;
})(jsPsychModule);