
//const express = require('express')
const { ApolloServer } = require(`apollo-server`)

// ここでスキーマの定義
const typeDefs = `
    type Query {
        totalPhotos : Int!
    }
    type Mutation {
        postPhoto(name: String! description: String): Boolean!
    }
`
// 写真を格納するための配列
var phots = []

// リゾルバは特定のフィールドのデータを返す関数
const resolvers = {
    Query: {
        totalPhotos: () => phots.length
    },

    Mutation: {
        // 第1引数のparentはオブジェクトへの参照 ここでは,Mutation
        // 第2引数のargsはGraphQL引数 ここではname,description
        postPhoto(parent, args) {
            phots.push(args) //本来はここでDBに入れる
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