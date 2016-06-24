const express = require('express');
const api = express()
const PORT = 4000

const main = require('./main')

const data = {
    ships: {
        voyager: {
            id: "voyager",
            description: "the ship"
        }
    },
    otherThings: {
        1: {
            id: 1,
            description: "a thing"
        }
    }
}

new main.API(api, data)
.registerAction({
    route: '/ships',
    actionName: 'ADD_SHIP',
    actionFunction: (state, data, ...rest) => {
        console.log('calling action function', state, data, rest)
        const toMerge = {}
        toMerge[data.id] = data
        const newShips = Object.assign({}, state.ships, toMerge)
        return Object.assign({}, state, {
            ships: newShips
        })
    },
    dataSchema: {
        id: 'STRING',
        description: "STRING"
    }
})
.registerGetRoutes()

api.listen(PORT, ()=>{
    console.log('yee-aahh! running on port', PORT)
})