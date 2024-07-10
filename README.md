# Sonnetate

Submission for Anthropic's [Build with Claude Hackathon](https://docs.anthropic.com/en/build-with-claude-contest/overview)

POC demo of applying PKM-inspired graph concepts to categorize, explore, and draw relations between AI responses.

UI was almost entirely AI generated, logic heavily aided through Sonnet 3.5.

## Install

1. Clone this repo
1. `npm run dev`
1. In Google Chrome, navigate to chrome://extensions or select Menu > More Tools > Extensions.
1. Toggle on the "Developer mode" switch in the top right corner of the Extensions page.
1. Click "Load unpacked" and select the `/dist` from the project folder

## !WARNING!

This version of the app stores your api key in [InstantDB](https://www.instantdb.com/), and while I am not nefarious (and will not be looking at / using any keys but my own) and Instant should be secure, it might be best to generate a key for this app specifically and revoke after using.

I plan to continue development (see: [sonnetate website](https://sonnetate.vercel.app/) - also built as part of this submission) and will soon update to store keys locally.

I'll also be updating the blog section of that site with a debrief on how Anthropic equipped me to accomplish in 4 days dev time (hackathon ran longer than that) what would normally take significantly longer.
