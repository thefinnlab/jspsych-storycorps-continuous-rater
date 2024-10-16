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
- Pink noise: enjoyment, flow, interactivity
- Negation: feeling of understanding the other’s mind, or vice versa



### Welcome page
[X] 

### Pink Noise (continuous-rater) instructions
[X] add shared instructions
    - you'll be listening to conversation all the way through and provide a continuous rating of how much you enjoyed the conversation
    - definition page (similar to reminders): most enjoyable moment to least
    - last page of instructions is the same as tommy's w/an image of the arrow keys

### Practice with arrow keys
[X] same as with tommy's (arrow key all the way up, great job, all the way down.)
[X] no multiple choice quiz

### Negation instructions
[X] at various intervals, you'll be interrupted and asked how well you were understood by your partner and how well your partner was understood by you

### Practice negation rating practice
- need to make a plugin for this
    - side-by-side: 'you understood partner with likert beneath' next to 'partner understood you' with likert beneath
    - must provide answer to both

### Practice trial
# participants will then practice loop on a common stimulus used as a way to standardize ratings
[X] accepts multiple audio clips
[X] make practice stim with katie
- split into 15s chunks
- add to timeline
- slightly different plugins from actual experiment (actual experiment has wording specific to participant, practice is general)

### great job page
# (once practice trial completed)
[X]

### Trial Loop Structure
# for each trial, participants will continuously rate audio clips (negation) and then rate pink noise (understand/understood) using the audio-rating-plugin
- pinknoise-rating-plugin
    - continuous-rater rating box (scale = most enjoyment - least enjoyment)
        - modify so it shows the last 15s of ratings (even on next trial (so on first clip, the bar will be flat line, next trial the participant will see same history as end of previous trial))
- after audio clip plays, move on to negation rating
    - negation-rating-plugin
        - side-by-side: 'you understood partner with likert beneath' next to 'partner understood you' with 0-10 likert beneath
        - must provide answer to both
- attention check if the pinknoise-rating indicator has not been updated in one minute (appears after negation rating)
- repeats pinknoise-rating and negation-rating for each clip until end of convo



### audio-splitter code
- waiting on katie to send me an example .wav file
- how audio will be split is still up in the air


####
- preload stim?
- instructions to Katie's satisfaction
- double check audio is spliting appropriately
- data saving?
- clean up code!



