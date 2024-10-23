var jsPsychPracticePinknoiseRating = (function (jspsych) {
  "use strict";

  const info = {
    name: 'practice-pinknoise-rating',
    parameters: {
      sources: {
        type: jspsych.ParameterType.AUDIO,
        pretty_name: 'Audio',
        default: undefined,
        description: 'The audio file(s) to play.'
      },
      rating_width: {
        type: jspsych.ParameterType.INT,
        pretty_name: 'Rating Width',
        default: 800,
        description: 'The width of the rating box in pixels.'
      },
      rating_height: {
        type: jspsych.ParameterType.INT,
        pretty_name: 'Rating Height',
        default: 200,
        description: 'The height of the rating box in pixels.'
      },
      practice_initial_rating: {
        type: jspsych.ParameterType.INT,
        pretty_name: 'Initial Rating',
        default: 50,
        description: 'The initial rating value (0-100).'
      },
      practice_rating_history_length: {
        type: jspsych.ParameterType.INT,
        pretty_name: 'Rating History Length',
        default: 1500, // default history length
        description: 'The number of points in the rating history to display.'
      },
      practice_rating_history: {
        type: jspsych.ParameterType.ARRAY,
        pretty_name: 'Rating History',
        default: [],
        description: 'Previous ratings.'
      },
    }
  };

  class PracticePinknoiseRatingPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      let practice_numbers = trial.practice_rating_history;
      let rating_num = trial.practice_initial_rating;

      // Initialize variables
      let practice_ratings = [];
      let practice_times = [];
      let stepSize = 2;
      const stepAccel = 1.15;
      let prevKeyCode;

      // Create audio element
      const audio = document.createElement('audio');
      audio.id = 'jspsych-audio-player';
      audio.src = trial.sources[0];
      audio.autoplay = true;

      // Create rating box
      const ratingBox = document.createElement('div');
      ratingBox.innerHTML = `
        <div class="rating-box" style="width: ${trial.rating_width}px;">
          <div class="first-anchor">most enjoyment</div>
          <svg id="rating-svg" viewBox="0 0 ${trial.rating_width} ${trial.rating_height}">
            <line class="reference"
              x1="0"
              y1="${trial.rating_height / 2}"
              x2="${trial.rating_width}"
              y2="${trial.rating_height / 2}"
            />
            <path id="rating-path" d="" fill="none" stroke="gray" stroke-width="2"/>
            <circle id="rating-indicator" cx="0" cy="${(100 - rating_num) / 100 * trial.rating_height}" r="5" fill="black"/>
          </svg> 
          <div class="last-anchor">least enjoyment</div>
        </div>
      `;

      // add instructions text
      const instructionsText = document.createElement('p');
      instructionsText.style.textAlign = 'center';  // Center the text
      instructionsText.style.fontSize = '18px';     // Adjust the font size
      instructionsText.style.marginBottom = '75px'; // Add cushion (adjust value as needed)

      instructionsText.textContent = "How much were the speakers enjoying the conversation? Was it flowing smoothly?";
  
      // Add elements to display
      display_element.innerHTML = '';
      display_element.appendChild(audio);
      display_element.appendChild(instructionsText);
      display_element.appendChild(ratingBox);

      // Add styles
      const styles = document.createElement('style');
      styles.innerHTML = `
        .rating-box {
          border: 1px solid #aaa;
          background-color: rgba(192, 192, 192, 0.384);
          border-radius: 2px;
          box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
          padding-top: 1%;
          padding-bottom: 1%;
          margin: 0 auto; /* Centers the box horizontally */
        }
        .reference {
          stroke: rgba(192, 192, 192, 1.0);
          stroke-width: 2px;
          stroke-dasharray: 5;
          z-index: -1;
        }
        svg {
          border-top: 1px solid #aaa;
          border-bottom: 1px solid #aaa;
          background-color: white;
        }
      `;
      display_element.appendChild(styles);

      // Function to update rating
      const updateRating = (newRating) => {
        rating_num = newRating;
        practice_ratings.push(rating_num);
        practice_times.push(audio.currentTime);
        updateIndicator();
      };

      // Function to update indicator position
      const updateIndicator = () => {
        const indicator = document.getElementById('rating-indicator');
        indicator.setAttribute('cy', `${(100 - rating_num) / 100 * trial.rating_height}`);
      };

      // Function to update numbers array
      const setNumbers = () => {
        for (let i = practice_numbers.length - 1; i >= 1; i--) {
          practice_numbers[i] = practice_numbers[i - 1];
        }
        practice_numbers[0] = rating_num;
      };

      // Function to update rating path
      const updateRatingPath = () => {
        const path = document.getElementById('rating-path');
        const d = practice_numbers.map((y, i) => {
          const x = (i / trial.practice_rating_history_length) * trial.rating_width; // scale x to fit width
          return `${i === 0 ? 'M' : 'L'} ${x} ${(1 - (y / 100)) * trial.rating_height}`;
        }).join(' ');
        path.setAttribute('d', d);
      };      

      // Event listener for key presses
      const handleKeyPress = (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          if (e.key !== prevKeyCode) {
            stepSize = 2;
          }
          prevKeyCode = e.key;

          if (e.key === 'ArrowUp') {
            updateRating(Math.min(rating_num + stepSize, 100));
          } else {
            updateRating(Math.max(rating_num - stepSize, 0));
          }

          stepSize *= stepAccel;
        }
      };

      // Event listener for key up
      const handleKeyUp = (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          stepSize = 2;
        }
      };

      // Add event listeners
      document.addEventListener('keydown', handleKeyPress);
      document.addEventListener('keyup', handleKeyUp);

      // Animation function
      const animate = () => {
        setNumbers();
        updateRatingPath();
        if (!audio.ended) {
          requestAnimationFrame(animate);
        }
      };

      // Start animation
      requestAnimationFrame(animate);

      // End trial when audio ends
      audio.addEventListener('ended', () => {
        document.removeEventListener('keydown', handleKeyPress);
        document.removeEventListener('keyup', handleKeyUp);

        // store global values
        practice_initial_rating = practice_numbers[0];
        practice_rating_history = practice_numbers;

        this.jsPsych.finishTrial({
          practice_ratings: practice_ratings,
          practice_times: practice_times,
        });
      });
    }
  }

  PracticePinknoiseRatingPlugin.info = info;

  return PracticePinknoiseRatingPlugin;
})(jsPsychModule);