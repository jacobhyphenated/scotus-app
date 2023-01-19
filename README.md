# SCOTUS Tracker Application
The SCOTUS tracking app is something I put together to help track court cases argued before The Supreme Court of the United States. The actual application can be found [here](https://scotus.jacobhyphenated.com/).

This project holds the front-end app. The [back-end](https://github.com/jacobhyphenated/scotus-server) is a separate application.

This is a work in progress and will change over time.

## What does it do?
Tracks court cases in front of the US Supreme court and keeps a record of older cases.

All data here is manually entered and maintained by me. Links to the actual opinions can be found at the [Supreme Court Website](https://www.supremecourt.gov/opinions/slipopinion). I record a quick summary and paraphrase of the opinions for my own reference.

Why does this even exist? I read Supreme Court opinions for fun. I used to keep track of important cases I was following with a spreadsheet, but writing my own app turned out to be both fun and useful for organizing everything.

## Tech Stack

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

* **React** - I've used this project to play around with class based and functional components, sort of a learning playground for me.
* **Material UI** - Not much customization to the basic material styles and components
* **TypeScript** - In `strict` mode
* **Mobx** - Used for global state management and injection. I wanted to try to use mobx in a non-trivial application.

## Running Locally
Create a local environment property file `.env.local`. You must add a single variable called `REACT_APP_API_SERVER=` and set it to the running url of your [backend environment](https://github.com/jacobhyphenated/scotus-server)

Then run `yarn && yarn start`

## License
Copyright 2023 Jacob Kanipe-Illig

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
