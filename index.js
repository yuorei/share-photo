const express = require('express')
const expressPlayground = require(`graphql-playground-middleware-express`).default
const { ApolloServer } = require(`apollo-server-express`)
const { GraphQLScalarType } = require(`graphql`)

// ここでスキーマの定義
const typeDefs = `
    scalar DateTime

    enum PhotoCategory {
        SELFIE
        PORTRAIT
        ACION
        LANDSCAPE
        CRAPHIC
    }

    type User {
        githubLogin: ID!
        name: String!
        avatar: String
        postedPhotos: [Photo!]!
        inPhotos: [Photo!]!
    }

    type Photo {
        id: ID!
        url: String!
        name: String!
        description: String
        category: PhotoCategory!
        postedBy: User!
        taggedUsers: [User!]!
        created: DateTime!
    }

    input PostPhotoInput {
        name: String!
        category: PhotoCategory=PORTRAIT
        description: String
    }

    type Query {
        totalPhotos: Int!
        allPhotos(after: DateTime): [Photo!]!
    }

    type Mutation {
        postPhoto(input: PostPhotoInput!):Photo!
    }
`
var _id = 0
var users = [
    { "githubLogin": "yuorei", "name": "ユオレイ" },
    { "githubLogin": "sSchmidt", "name": "スミスさん" }
]
// 写真を格納するための配列
var photos = [
    {
        "id": "1",
        "name": "すごい車",
        "description": "はやい",
        "category": "ACTION",
        "githubUser": "yuorei",
        "created": "3-28-1977"
    },
    {
        "id": "2",
        "name": "すごい家",
        "category": "SELFIE",
        "githubUser": "sSchmidt",
        "created": "2-19-2023"
    },
    {
        "id": "3",
        "name": "すごい子",
        "description": "えらい",
        "category": "LANDSCAPE",
        "githubUser": "yuorei",
        "created": "2024-09-23T17:09:44.308Z"
    },
]

var tags = [
    { "photoID": "1", "userID": "yuorei" },
    { "photoID": "2", "userID": "yuorei" },
    { "photoID": "2", "userID": "sSchmidt" }
]

// リゾルバは特定のフィールドのデータを返す関数
const resolvers = {
    Query: {
        totalPhotos: () => photos.length,
        allPhotos: (parent, args) => {
            args.after // javaScriptのDateオブジェクト
            return photos
        }
    },

    Mutation: {
        // 第1引数のparentはオブジェクトへの参照 ここでは,Mutation
        // 第2引数のargsはGraphQL引数 ここではPhoto
        postPhoto(parent, args) {
            // 新しい写真を作成し、idを生成する
            var newPhoto = {
                id: _id++,
                ...args.input,
                created: new Date()
            }
            photos.push(newPhoto) //本来はここでDBに入れる

            // 新しい写真を返す
            return newPhoto
        }
    },
    Photo: {
        // urlの生成
        url: parent => `http://自分のサイト/img/${parent.id}.jpg`,
        postedBy: parent => {
            return users.find(u => u.githubLogin === parent.githubUser)
        },
        taggedUsers: parent => tags

            // 対象の写真が関係しているタグの配列を返す
            .filter(tags => tags.photoID === parent.id)

            // タグの配列をユーザーIDの配列の変換する
            .map(tag => tag.userID)

            // ユーザーIDの配列をユーザーオブジェクトの配列に変換する
            .map(userID => users.find(u => u.githubLogin === userID))
    },
    User: {
        postedPhotos: parent => {
            return photos.filter(p => p.githubUser === parent.githubLogin)
        },
        inPhotos: parent => tags

            // 対象のユーザーが関係しているタグの配列を返す
            .filter(tags => tags.userID === parent.id)

            // タグの配列を写真IDの配列の変換する
            .map(tag => tag.photoID)

            // 写真IDの配列を写真オブジェクトの配列に変換する
            .map(photoID => photos.find(p => p.id === photoID))
    },

    DateTime: new GraphQLScalarType({
        name: `DateTime`,
        description: `A valid date time value.`,
        parseValue: value => new Date(value),
        serialize: value => new Date(value).toISOString(),
        parseLiteral: ast => ast.value
    })
}

async function startServer() {
    // express()を呼び出し Express アプリケーションを作成する
    var app = express()
    const server = new ApolloServer({
        typeDefs,
        resolvers
    })
    await server.start();
    // applyMiddleware()を呼び出しExpressにミドルウェアを追加する
    server.applyMiddleware({ app });
    // ホームルートを作成
    app.get(`/`, (req, res) => res.end(`Welcome to the PhotoShare API`))

    app.get(`/playground`, expressPlayground({ endpoint: `/graphql` }))
    app.listen({ port: 4000 }, () =>
        console.log(`GraphQL Server running at http://localhost:4000${server.graphqlPath}`)
    )
}
startServer();
