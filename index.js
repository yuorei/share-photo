
//const express = require('express')
const { ApolloServer } = require(`apollo-server`)

const typeDefs = `
    type Query {
        totalPhotos : Int!
    }
    type Mutation {
        postPhoto(name: String! description: String): Boolean!
    }
`
// 写真を格納するため
var phots = []
const resolvers = {
    Query: {
        totalPhotos: () => phots.length
    },

    Mutation: {
        postPhoto(parent, args) {
            phots.push(args)
            return true
        }
    }
}
const server = new ApolloServer({
    typeDefs,
    resolvers
})

server
    .listen()
    .then(({url})=> console.log(`GraphQL Sevice running on ${url}`))