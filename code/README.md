# Continuous Rater Experiment

## Overview

In this directory you can find the following:
- ```code```: contains a notebook for creating parameter files used in a continuous-rater experiment
- ```experiments```: HTML/Javascript code for running a continuous rater experiment
- ```presentation-orders```: information about presentation order for each participant
- ```rating-orders```: information about rating type on each trial for each participant
- ```ratings```: information about rating type/scale used in the experiment
- ```stimuli```: example set of stimuli to source for experiment development


### Experiment Design
- this will be a two-part experiment, separated by 'Negation' and 'Pink Noise' trials
- both parts of the experiment are identical
- whether the first set of trials will be 'Negation' or 'Pink Noise' will be randomized - but participants will always do both



### Shared Instructions
# experiment starts with task instructions
- add shared instructions

### Specific Instructions
- Update instructions to define rating types
    - Negation: feeling of understanding the other’s mind, or vice versa
        - understood/understanding of the other’s mind they feel at each timepoint
        - did not understand at all — understood perfectly
    - Pink noise: enjoyment, flow, interactivity
        - for pink noise we care more about interactivity/enjoyment/flow
        - awkward and unenjoyable — we were groovin    

### Practice trial
# participants will then practice on a common stimulus used as a way to standardize ratings
[X] accepts multiple audio clips
- find practice stim
- split into 10s chunks
- add to timeline
- rating-practice-plugin
    - add rating history graph


### Trial Structure (part 1)
# participants will listen to short audio clips using the audio-rating-plugin
- audio-rating-plugin
    [X] after clip plays, they will be able to provide ratings on a likert scale (0-10) - (important, this likert scale is always visible, but only clickable after the audio plays in full)
    [X] clicking number autoplays next clip
    [X] buttons have numbers directly on them
    [X] once button is pressed, fills in black then slight delay before moving to next audio clip
    [X] for real trials, the following is always on screen:
        [X] for Negation: “Think back to how the conversation felt at this moment. If you were talking, how well do you think your partner understood you and your thoughts at this moment? If you were listening, how well do you think you understood your partner and their thoughts”
        [X] for Pink Noise: “Think back to how the conversation felt at this moment. How much were you enjoying the conversation? Was it flowing smoothly?”
    - rating history graph
        - Update so listener can always see the trajectory they’ve made so far
        - updates from right to left

### Trial Structure (part 2)
# same trial structure as part 1, just using the other rating scale
- jspsychinstructions page with information about the rating scale for other rating type
- add in part 2 once part 1 is sound (should be copy-paste situation and swap out p1 with p2)


####
- preload stim?
- comprehension check?
- double check audio is spliting appropriately
- data saving?
- clean up code!



