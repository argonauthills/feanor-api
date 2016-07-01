# Feanor API

## Install

    npm install

## Run

    npm start

## Try it out

    curl http://localhost:4000/ships

    curl http://localhost:4000/ships/info

    curl http://localhost:4000/ships/actions/info

    curl -H "Content-Type: application/json" -X POST http://localhost:4000/ships/actions -d '{"type": "ADD_SHIP", "payload" : {"id":"odyssey", "description":"small and awesome"}}'

    curl http://localhost:4000/ships

