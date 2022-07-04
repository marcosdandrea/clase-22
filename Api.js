const path = require("path")
const multer = require("multer");
const express = require("express")

const storage = multer.diskStorage({
    destination: "public/images",
    filename: (req, file, cb) => {
        const filename = file.originalname;
        cb(null, filename)
    }
})

const uploader = multer({ storage: storage })

module.exports = class Api {
    /**
     * 
     * @param {Express App} app 
     * @param {Contenedor} contenedor
     */
    constructor(app, contenedor, renderVariables) {

        this.app = app
        this.contenedor = contenedor;
        this.apiRouter = express.Router()

        //return all products
        this.apiRouter.get("/", (req, res) => {
            contenedor.getAll()
                .then((products) => {
                    if (products.length == 0)
                        res.status(404).sendFile(path.join(__dirname, 'public/noProducts.html'))
                    else
                        res.render("table", {products}) 
                })
                .catch((err) => {
                    console.log(err)
                    res.status(404).sendFile(path.join(__dirname, 'public/noProducts.html'))
                })
        })

        //return product by id
        this.apiRouter.get("/:id", (req, res) => {
            this.contenedor.getById(req.params.id)
                .then((products) => {
                    if (products.length == 0)
                        res.status(404).send(JSON.stringify({ error: 'producto no encontrado' }))
                    else
                        res.render("table", {products}) 
                })
                .catch((err) => {
                    console.log(err)
                    res.status(404).send(JSON.stringify({ error: 'producto no encontrado' }))
                })
        })

        
        //add new producto and return new id
        this.apiRouter.post("/", uploader.single("image"), (req, res) => {
            const { file } = req;

            const title = req.query.title || req.body.title
            const price = parseFloat(req.query.price) || parseFloat(req.body.price)
            const imgDir = "../images/"
            const image = imgDir + file.filename
            const newProduct = { title, price, image }

            if ((title == undefined) || (price == undefined) || (image == undefined) || (isNaN(price))) {
                console.log (newProduct)
                res.status(404).send(JSON.stringify({ error: "datos incorrectos" }))
                return
            }

            this.contenedor.save(newProduct)
                .then(id => {
                    this.contenedor.getAll()
                        .then((products) => {
                            res.render("table", {products})                            
                        })
                })
                .catch((err) => {
                    console.log(err)
                    res.status(501).send(JSON.stringify({ error: 'producto no agregado' }))
                })

        })

        //modify existing product
        this.apiRouter.put("/:id", (req, res) => {

            const title = req.query.title
            const price = req.query.price
            const image = req.query.image

            if ((title == undefined) && (price == undefined) && (image == undefined)) {
                res.status(404).send(JSON.stringify({ error: "datos incorrectos" }))
                return
            }

            const existingProduct = { title, price, image }

            contenedor.modifyEntry(req.params.id, existingProduct)
                .then(() => {
                    res.status(200).send(JSON.stringify({ success: 'producto modificado' }))
                })
                .catch((err) => {
                    console.log(err)
                    res.status(501).send(JSON.stringify({ error: 'producto no agregado' }))
                })

        })

        //delete product
        this.apiRouter.delete("/:id", (req, res) => {
            contenedor.deleteByID(req.params.id)
                .then(() => {
                    res.status(200).send(JSON.stringify({ success: 'producto eliminado' }))
                })
                .catch((err) => {
                    console.log(err)
                    res.status(400).send(JSON.stringify({ error: 'no se pudo eliminar' }))
                })
        })


        app.use("/api/productos", this.apiRouter)
        app.use("/", express.static(path.join(__dirname, 'public')))
    }

}
