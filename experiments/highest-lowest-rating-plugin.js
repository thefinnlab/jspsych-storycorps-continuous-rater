var jsPsychHighestLowestRating = (function (jspsych) {
  "use strict";

  const info = {
    name: 'display-rating-box',
    parameters: {
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
      rating_name: {
        type: jspsych.ParameterType.STR,
        pretty_name: 'Rating Type',
        default: '',
        description: 'The type of rating being measured.'
      },
      high_end: {
        type: jspsych.ParameterType.STR,
        pretty_name: 'Rating High End',
        default: '',
        description: 'The high end of the rating being measured.'
      },
      low_end : {
        type: jspsych.ParameterType.STR,
        pretty_name: 'Rating Low End',
        default: '',
        description: 'The low end of rating being measured.'
      },
      initial_rating: {
        type: jspsych.ParameterType.INT,
        pretty_name: 'Initial Rating',
        default: 50,
        description: 'The initial rating value (0-100).'
      },
      rating_history_length: {
        type: jspsych.ParameterType.INT,
        pretty_name: 'Rating History Length',
        default: 800,
        description: 'The number of points in the rating history to display.'
      },
      direction: {
        type: jspsych.ParameterType.STR,
        pretty_name: 'Indicator Directional Goal',
        default: '',
        description: 'Whether participant must move indicator all the way up or all the way down.'
      },
    }
  };

  class HighestLowestRatingPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      // Initialize variables
      let rating_num = trial.initial_rating;
      let ratings = [];
      let times = [];
      let stepSize = 2;
      const stepAccel = 1.15;
      let prevKeyCode;
      let numbers = new Array(trial.rating_width).fill(rating_num);

      // Create move up instructions
      const moveUp = document.createElement('div');
      moveUp.innerHTML = `
        <p style="font-size: 18px; text-align: center;">
          Please use the <b>up arrow</b> on your keyboard to move the rating indicator all the way to the top of the rating box, <b>indicating the highest level of ${trial.rating_name.toLowerCase()}.</b><br><br>
        </p>
      `;

      // Create move down instructions
      const moveDown = document.createElement('div');
      moveDown.innerHTML = `
        <p style="font-size: 18px; text-align: center;">
          Please use the <b>down arrow</b> on your keyboard to move the rating indicator all the way to the bottom of the rating box, <b>indicating the lowest level of ${trial.rating_name.toLowerCase()}.</b><br><br>

        </p>
      `;

      // Create rating box
      const ratingBox = document.createElement('div');
      ratingBox.innerHTML = `
        <div class="rating-box" style="width: ${trial.rating_width}px;">
          <div class="first-anchor">${trial.high_end}</div>
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
          <div class="last-anchor">${trial.low_end}</div>
        </div>
      `;

      // Add elements to display
      display_element.innerHTML = '';

      if (trial.direction === 'up') {
        display_element.appendChild(moveUp);
      } else if (trial.direction === 'down') {
        display_element.appendChild(moveDown);
      }

      display_element.appendChild(ratingBox);

      // Add styles
      const styles = document.createElement('style');
      styles.innerHTML = `
        .rating-box {
          border: 1px solid #aaa;
          background-color: rgba(192, 192, 192, 0.384);
          border-radius: 2px;
          box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
          padding-top: 1%;
          padding-bottom: 1%;
          width: ${trial.rating_width}px;
          margin: 0 auto; /* Center the box */
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
        ratings.push(rating_num);
        times.push(Date.now());
        updateIndicator();
      };

      // Function to update indicator position
      const updateIndicator = () => {
        const indicator = document.getElementById('rating-indicator');
        indicator.setAttribute('cy', `${(100 - rating_num) / 100 * trial.rating_height}`);
      };

      // Function to update numbers array
      const setNumbers = () => {
        for (let i = numbers.length - 1; i >= 1; i--) {
          numbers[i] = numbers[i - 1];
        }
        numbers[0] = 100 - rating_num;
      };

      // Function to update rating path
      const updateRatingPath = () => {
        const path = document.getElementById('rating-path');
        const d = numbers.map((y, i) => {
          const x = (i / trial.rating_history_length) * trial.rating_width; // scale x to fit width
          return `${i === 0 ? 'M' : 'L'} ${x} ${(y / 100) * trial.rating_height}`;
        }).join(' ');
        path.setAttribute('d', d);
      };      

      // Function to end trial
      const endTrial = () => {
        document.removeEventListener('keydown', handleKeyPress);
        document.removeEventListener('keyup', handleKeyUp);
        this.jsPsych.finishTrial({
          ratings: ratings,
          times: times
        });
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
            // End trial if rating reaches 100 and direction is 'up'
            if (trial.direction === 'up' && rating_num >= 100) {
              endTrial();
            }
          } else {
            updateRating(Math.max(rating_num - stepSize, 0));
            // End trial if rating reaches 0 and direction is 'down'
            if (trial.direction === 'down' && rating_num <= 0) {
              endTrial();
            }
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
        requestAnimationFrame(animate);
      };

      // Start animation
      requestAnimationFrame(animate);
    }
  }

  HighestLowestRatingPlugin.info = info;

  return HighestLowestRatingPlugin;
})(jsPsychModule);