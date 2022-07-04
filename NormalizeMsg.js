const util = require("util")
const normalizr = require('normalizr')
const normalize = normalizr.normalize;
const denormalize = normalizr.denormalize;
const schema = normalizr.schema


const authorSchema = new schema.Entity("author")
const msgSchema = new schema.Entity("message", {author: authorSchema})

class NormalizeMsg{
    constructor (){}

    normalize(input){
        const normalized = normalize(input, [msgSchema])
        return normalized
        this.#print (normalized)
    }

    denormalize(input){
        const denormalized = denormalize(input, [msgSchema])
        return denormalized
    }

    #print(msg){
        console.log (util.inspect(msg, false, 12, true))
    }

}

module.exports = NormalizeMsg