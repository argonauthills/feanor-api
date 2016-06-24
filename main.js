import { head, tail, last, initial, hasIn, get, keys } from 'lodash'
import { json, urlencoded } from 'body-parser'

//TODO: throw error if state (at least initial state) includes "info" or "actions" as keys
//TODO: require all action registration to occur before get registration.


export class API {
    constructor(expressApi, initialData) {
        this.api = expressApi
        this.api.use(json())
        this.api.use(urlencoded({ extended: false }))

        this.state = initialData || {}

        this.updateState = this.updateState.bind(this)
        this.registerAction = this.registerAction.bind(this)
        this.registerGetRoutes = this.registerGetRoutes.bind(this)
    }

    updateState(newState) {
        this.state = newState
        return this
    }

    registerAction({route, actionName, actionFunction, dataSchema}) {
        const pathKeys = splitRoute(route)
        const actionPostRoute = joinRoute([...pathKeys, 'actions'])
        const actionInfoRoute = joinRoute([...pathKeys, 'actions', 'info'])

        const isValid = getValidator(dataSchema)


        this.api.post(actionPostRoute, (req, res) => {
            const data = req.body
            if (!isValid(data)) {
                return res.status(400).send('Invalid request body')
            }

            try {
                const newState = actionFunction(this.state, data, req.params)
                this.updateState(newState)
                return res.send("success")  //TODO: consider sending something better
            }
            catch (e) {
                //TODO: ability to register different error types to different status codes.
                console.log("error", e)
                return res.status(500).send(e)
            }

        })

        //Middleware to add this action to the list of routes in /action/info
        this.api.get(actionInfoRoute, (req, res, next) => {
            if (!req.feanorActions) req.feanorActions = {}
            const toMerge = {}
            toMerge[actionName] = dataSchema
            req.feanorActions = Object.assign({}, req.feanorActions, toMerge)
            next()
        })

        return this
    }

    registerGetRoutes() {
        this.api.get('*', (req, res) => {
            const pathKeys = splitRoute(req.path)
            const pathKeysButLast = initial(pathKeys)
            const pathKeysButTwoLast = initial(pathKeysButLast)

            // TODO: with the current ordering, we allow "actions" and "info" to be keys in state; should we?
            if (hasIn(this.state, pathKeys)) {
                const item = get(this.state, pathKeys)
                return res.send(get(this.state, pathKeys))
            }

            else if (last(pathKeys) === 'info' && hasIn(this.state, pathKeysButLast)) {
                const item = get(this.state, pathKeysButLast)
                return res.send(normalInfo(item))
            }

            else if (last(pathKeys) === 'info' && penultimate(pathKeys) === 'actions' && hasIn(this.state, pathKeysButTwoLast)) {
                const item = get(this.state, pathKeysButTwoLast)
                return res.send(actionInfo(item, req.feanorActions))
            }

            else {
                return res.status(404).send("We cannot find your item.")
            }

        })

        return this
    }
}

function getValidator(schema) {
    return () => true  //TODO: actually use a validator (such as jsonschema)
}

function splitRoute(path) {
    return path
    .replace(/\/$/, '')  //last char might be '/'; get rid of it.
    .replace(/^\//, '')  //first char might be '/'; get rid of it.
    .split('/')
}

function joinRoute(pathKeys) {
    return '/' + pathKeys.join('/')
}

function penultimate(arr) {
    return last(initial(arr))
}

function normalInfo(item) {
    return {
        keys: keys(item)
    }
}

function actionInfo(item, actions) {
    return {
        actions: actions || []
    }
}
