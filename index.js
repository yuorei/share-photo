
//const express = require('express')
const { ApolloServer } = require(`apollo-server`)

// ここでスキーマの定義
const typeDefs = `
    type Photo {
        id: ID!
        url: String!
        name: String!
        description: String
    }
    type Query {
        totalPhotos: Int!
        allPhotos: [Photo!]!
    }
    type Mutation {
        postPhoto(name: String! description: String):Photo!
    }
`
var _id = 0
// 写真を格納するための配列
var phots = []

// リゾルバは特定のフィールドのデータを返す関数
const resolvers = {
    Query: {
        totalPhotos: () => phots.length,
        allPhotos: () => phots
    },

    Mutation: {
        // 第1引数のparentはオブジェクトへの参照 ここでは,Mutation
        // 第2引数のargsはGraphQL引数 ここではPhoto
        postPhoto(parent, args) {
            // 新しい写真を作成し、idを生成する
            var newPhoto = {
                id: _id++,
                ...args
            }
            phots.push(newPhoto) //本来はここでDBに入れる

            // 新しい写真を返す
            return newPhoto
        }
    },
    Photo: {
        // urlの生成
        url: parent => `http://自分のサイト/img/${parent.id}.jpg`
    }
}
const server = new ApolloServer({
    typeDefs,
    resolvers
})

server
    .listen()
    .then(({ url }) => console.log(`GraphQL Sevice running on ${url}`))