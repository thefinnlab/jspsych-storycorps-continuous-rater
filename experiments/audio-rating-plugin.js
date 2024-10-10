var jsPsychAudioRating = (function (jspsych) {
  "use strict";

  const info = {
    name: 'audio-rating',
    parameters: {
      sources: {
        type: jspsych.ParameterType.AUDIO,
        pretty_name: 'Audio',
        default: undefined,
        description: 'The audio file(s) to play.'
      },
      rating_type: {
        type: jspsych.ParameterType.JSON,
        pretty_name: 'Rating Type',
        default: [],
        description: 'The type of rating being measured.'
      },
    }
  };

  class AudioRatingPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      // Initialize trial-specific variables
      let ratings = []; // Store all ratings across trials
      let trialCount = 0; // Track trial number
      trialCount++; // Increment trial count
      let lowEnd, highEnd, ratingName;
      let selectedRating; // To store selected rating

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

      // use jquery to load the json file
      $.ajax({
        url: trial_rating_fn,
        dataType: 'json',
        type: 'get',
        cache: true,
        async: false,
        success: function (trial_rating_data) {
          const ratingInfo = trial_rating_data[0];

          // Extract variables
          ratingName = ratingInfo.ratingType;
          lowEnd = ratingInfo.lowEnd;
          highEnd = ratingInfo.highEnd;

          // Log variables
          console.log('Rating Type:', ratingName);
          console.log('Low End:', lowEnd);
          console.log('High End:', highEnd);
        }
      });

      ////////////////////////////
      // ADD CONDITIONAL TEXT
      ////////////////////////////
      const conditionalText = document.createElement('p');
      conditionalText.style.textAlign = 'center';  // Center the text
      conditionalText.style.fontSize = '18px';     // Adjust the font size
      conditionalText.style.marginBottom = '20px'; // Add cushion (adjust value as needed)

      // Conditional logic for setting the text
      if (ratingName === 'Negation') {
        conditionalText.textContent = "Think back to how the conversation felt at this moment. If you were talking, how well do you think your partner understood you and your thoughts at this moment? If you were listening, how well do you think you understood your partner and their thoughts.";
      } else if (ratingName === 'Pink Noise') {
        conditionalText.textContent = "Think back to how the conversation felt at this moment. How much were you enjoying the conversation? Was it flowing smoothly?";
      }

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

      // Add styles using CSS to control the size
      const chart_styles = document.createElement('style');
      chart_styles.innerHTML = `
        #ratingChart {
          width: 800px;       /* Default width */
          height: 400px;      /* Default height */
          min-width: 800px;   /* Minimum width */
          min-height: 400px;  /* Minimum height */
          margin: 50px auto 0 auto;  /* Add 100px margin on top to push it down */
        }
      `;
      display_element.appendChild(chart_styles);

      // Initialize Chart.js chart
      const ctx = canvas.getContext('2d');
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [], // Will be updated with trial numbers
          datasets: [{
            data: [], // Will be updated with rating values
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: false
          }]
        },
        options: {
          plugins: {
            legend: {
              display: false // Disable the legend
            },
            title: {
              display: true,  // Make sure the title is displayed
              text: 'Rating History', // Your desired title text
              font: {
                size: 18 // Adjust the font size if necessary
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'x label'
              }
            },
            y: {
              min: 0,
              max: 10,
              title: {
                display: true,
                text: 'y label'
              }
            }
          }
        }
      });

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

      // Function to save rating
      const saveRating = (selectedRating) => {
        ratings.push(selectedRating); // Save the rating
      };

      // Function to update the chart
      const updateChart = (selectedRating) => {
        chart.data.labels.push(trialCount); // Update trial count
        chart.data.datasets[0].data.push(selectedRating); // Update rating data
        chart.update();
      };


      // Enable radio buttons when audio ends
      audio.addEventListener('ended', () => {
        const radioButtons = likertScale.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
          radio.disabled = false; // Enable radio buttons
          radio.addEventListener('change', () => {
            // When a radio button is selected, end the trial
            const selectedRating = parseInt(radio.value);
            radio.style.backgroundColor = '#000'; // Button fills in black

            // Call the functions to save rating and update the chart
            saveRating(selectedRating);
            updateChart(selectedRating);
            
            setTimeout(() => {
              this.jsPsych.finishTrial({
                ratings: ratings // Save the selected rating
              });
            }, 250); // update delay time here
          });
        });
      });
    }
  }

  AudioRatingPlugin.info = info;

  return AudioRatingPlugin;
})(jsPsychModule);