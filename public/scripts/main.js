let socket
let uploader
let productTemplates
let messagesTemplates

fetch("http://localhost:8080/template/products.hbs")
    .then(res => res.text())
    .then(baseTemplate => {
        productTemplates = Handlebars.compile(baseTemplate)
        fetch("http://localhost:8080/template/messages.hbs")
            .then(res => res.text())
            .then(baseTemplate => {
                messagesTemplates = Handlebars.compile(baseTemplate)
                initizalizeComponents()
                startListeners()
            })
    })
    .catch((err) => {
        console.log(err)
    })

function initizalizeComponents() {
    socket = io()
    uploader = new SocketIOFileUpload(socket);
}

function startListeners() {

    socket.on("productList", products => {
        const context = JSON.parse(products);
        const html = productTemplates({ products: context });
        document.getElementById("hbsProducts").innerHTML = html;
    })

    socket.on("newMessages", messages => {
        const context = JSON.parse(messages);       

        const html = messagesTemplates({ messages: denormalizeMsg(context) });
        const hbsMessages = document.getElementById("hbsMessages")
        hbsMessages.innerHTML = html
        hbsMessages.scroll(0, hbsMessages.childElementCount * 20);
    })

    uploader.addEventListener("complete", enviarProducto)
    uploader.listenOnSubmit(document.getElementById("btnSubmit"), document.getElementById("fileImage"));
    document.getElementById("btnSendMessage").addEventListener("click", sendMessage)
}

const sendMessage = () => {
    const id = document.querySelector("#inputEmail").value
    const nombre = document.querySelector("#inputName").value
    const apellido = document.querySelector("#inputSurname").value
    const edad = document.querySelector("#inputAge").value
    const alias = document.querySelector("#inputAlias").value
    const avatar = document.querySelector("#inputAvatarURL").value
    const content = document.querySelector("#inputContent").value
    //const time = new Date().toLocaleString()
    const check = [id, nombre, apellido, edad, alias, avatar, content]
    if (check.some(e => e == "")) {
        alert("Debe ingresar todos los datos para enviar")
        return;
    }
    console.log(check)

    socket.emit("newMessage",
        {
            author: {
                id, nombre, apellido, edad, alias, avatar
            },
            text: content
        }
    )
    document.querySelector("#inputContent").value = "";
}

const enviarProducto = () => {
    console.log("producto cargado")
    const productName = document.querySelector("#title").value
    const productPrice = document.querySelector("#price").value
    let productImage = document.querySelector("#fileImage").value
    productImage = "../images/" + productImage.split("\\").at(-1)

    const newProduct = { productName, productPrice, productImage }

    socket.emit("newProduct", JSON.stringify(newProduct))
    console.log("new product sended")
    return false
}

const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

function denormalizeMsg(input) {
    const normalize = normalizr.normalize;
    const denormalize = normalizr.denormalize;
    const schema = normalizr.schema

    const authorSchema = new schema.Entity("author")
    const msgSchema = new schema.Entity("message", { author: authorSchema })
    const denormalized = denormalize(input.result, [msgSchema], input.entities)
    const inputLength = JSON.stringify(input).length
    const denormalizedLength = JSON.stringify(denormalized).length
    const compressRatio =  (denormalizedLength * 100) / inputLength
    document.querySelector("#compressionRatio").innerText = "Compression Ratio:" + compressRatio.toFixed(2) +  "%"
    return (denormalized)
    
}
