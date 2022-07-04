const express = require('express');
const path = require("path")
const ContendorFakerProductos = require('./ContendorFakerProductos');
const Contendor = require('./contenedor')
const NormalizeMsg = require('./NormalizeMsg')
var socketIOfileUpload = require("socketio-file-upload");
const { Server: HttpServer } = require("http")
const { Server: SocketServer } = require("socket.io");

const app = express();
const PORT = 8080;

const productsContainer = new ContendorFakerProductos()
const msgContainer = new Contendor("mensajes.json")
const normalizeMsg = new NormalizeMsg()

app.use(socketIOfileUpload.router)
app.use("/", express.static("public"))

const httpServer = new HttpServer(app)
const socketServer = new SocketServer(httpServer)

socketServer.on("connection", socket => {

    //new user initizalization routine
    const uploader = new socketIOfileUpload();
    uploader.dir = path.join(__dirname, "/public/images")
    uploader.listen(socket);
    console.log("A new user has connected")
    sendAllProducts(socket)
    sendAllMessages(socket)
    
    socket.on("newProduct", newProduct => {
        console.log("New product received")
        newProduct = JSON.parse(newProduct)
        productsContainer.save(newProduct)
            .then(() => sendAllProducts(socketServer.sockets))
    })

    socket.on("newMessage", message => {
        msgContainer.save(message)
            .then(() => sendAllMessages(socketServer.sockets))

    })
})

const sendAllMessages = (socket) => {
    return new Promise((resolve, reject) => {
        msgContainer.getAll()
            .then((messages) => {
                if (messages.length == 0){
                    socket.emit("newMessages", JSON.stringify({}))
                    resolve()
                }
                else{
                    const normalizedMsgs = normalizeMsg.normalize(messages)
                    socket.emit("newMessages", JSON.stringify(normalizedMsgs))
                    resolve()
                }
            })
            .catch((err) => {
                console.log(err)
                socket.emit("error", JSON.stringify({}))
                resolve()
            })
    })
}

const sendAllProducts = (socket) => {
    return new Promise((resolve, reject) => {

    productsContainer.getAll()
        .then((products) => {
            if (products.length == 0){
                socket.emit("productList", JSON.stringify({}))
                resolve()}
            else
               { socket.emit("productList", JSON.stringify(products))
                resolve()}
        })
        .catch((err) => {
            console.log(err)
            socket.emit("error", JSON.stringify({}))
            resolve()
        })
    })
}

httpServer.listen(PORT, () => {
    console.log("Server listening on port " + PORT)
});


