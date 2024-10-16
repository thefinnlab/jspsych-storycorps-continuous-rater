var jsPsychPinknoiseRating = (function (jspsych) {
  "use strict";

  const info = {
    name: 'pinknoise-rating',
    parameters: {
      sources: {
        type: jspsych.ParameterType.AUDIO,
        pretty_name: 'Audio',
        default: undefined,
        description: 'The audio file(s) to play.'
      },
    }
  };

  class PinknoiseRatingPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      // Initialize variables
      let ratings = [];
      let ratingData = {};
      let lowEnd, highEnd, ratingName;

      // Create audio element
      const audio = document.createElement('audio');
      audio.id = 'jspsych-audio-player';
      audio.src = trial.sources[0];
      audio.autoplay = true;

      /////////////////////////
      // GET TRIAL RATING DATA
      /////////////////////////
      let ratingType = trial.rating_type[0]; // example ratingType = /dartfs/rc/lab/F/FinnLab/dallas/continuous-rater/ratings/rating-type07.json

      var ratingType_file = ratingType.substring(ratingType.lastIndexOf('/') + 1); // ex: should be something like 'rating-type07.json'

      let trial_rating_fn = [
        'https://rcweb.dartmouth.edu/FinnLab/dallas/projects/storycorps-continuous-rater/ratings/',
        ratingType_file].join('')

      console.log(trial_rating_fn);


      ////////////////////////////
      // ADD CONDITIONAL TEXT
      ////////////////////////////
      const instructionsText = document.createElement('p');
      instructionsText.style.textAlign = 'center';  // Center the text
      instructionsText.style.fontSize = '18px';     // Adjust the font size
      instructionsText.style.marginBottom = '20px'; // Add cushion (adjust value as needed)

      instructionsText.textContent = "Think back to how the conversation felt at this moment. How much were you enjoying the conversation? Was it flowing smoothly?";
    

      // Create the Likert scale container
      const likertScale = document.createElement('div');
      likertScale.innerHTML = `
        <div class="likert-scale">
          <div class="first-anchor">${lowEnd}</div>
          <div class="scale-container">
            ${[...Array(11).keys()].map(i => `
              <div class="scale-item">
                <label class="scale-label" for="scale${i}">
                  <input type="radio" name="scale" value="${i}" id="scale${i}" disabled>
                  <span>${i}</span> <!-- Span to hold the number inside -->
                </label>
              </div>
            `).join('')}
          </div>
          <div class="last-anchor">${highEnd}</div>
        </div>
      `;

      // Add elements to display
      display_element.innerHTML = '';
      display_element.appendChild(audio);
      display_element.appendChild(conditionalText);
      display_element.appendChild(likertScale);

      // Create a canvas for the chart
      const canvas = document.createElement('canvas');
      canvas.id = 'ratingChart';
      display_element.appendChild(canvas);

      // Add styles
      const styles = document.createElement('style');
      styles.innerHTML = `
        .likert-scale {
          display: flex;
          align-items: center; /* Center items vertically */
        }

        .scale-container {
          display: flex; /* Use flexbox for horizontal layout */
          justify-content: space-between; /* Distribute space evenly */
          margin: 20px; /* Add some margin for spacing */
        }

        .scale-item {
          display: flex;
          flex-direction: column; /* Stack label and input vertically */
          align-items: center; /* Center items horizontally */
        }

        .scale-item input[type="radio"] {
          position: relative; /* Allow number to be placed inside */
          width: 40px;
          height: 40px;
          margin: 20px;
          appearance: none; /* Hide default radio button */
          border: 2px solid #000; /* Custom styling */
          border-radius: 50%; /* Make the radio a circle */
        }

        .scale-item input[type="radio"]:checked {
          background-color: #000; /* Change background when selected */
        }

        .scale-label {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .scale-label span {
          position: absolute;
          top: 50%; /* Vertically center */
          left: 50%; /* Horizontally center */
          transform: translate(-50%, -50%); /* Correct centering */
          font-size: 14px;
          pointer-events: none; /* Make the number non-clickable */
        }
      `;
      display_element.appendChild(styles);


      // Enable radio buttons when audio ends
      audio.addEventListener('ended', () => {
        const radioButtons = likertScale.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
          radio.disabled = false; // Enable radio buttons
          radio.addEventListener('change', () => {
            // When a radio button is selected, end the trial
            const selectedRating = parseInt(radio.value);
            radio.style.backgroundColor = '#000'; // Button fills in black
            setTimeout(() => {
              this.jsPsych.finishTrial({
                ratings: [selectedRating] // Save the selected rating
              });
            }, 250); // update delay time here
          });
        });
      });
    }
  }

  PinknoiseRatingPlugin.info = info;

  return PinknoiseRatingPlugin;
})(jsPsychModule);