const { faker } = require('@faker-js/faker');
const deleteTables = false;

class ContendorSQL {
    constructor(options, tableConfiguration) {

    }

    save(object) {

    }

    getAll() {
        return new Promise((resolve, reject) => {
            /*
                {
                id: 1,
                productName: 'Coca Loca',
                productImage: '../images/istockphoto-499208007-612x612.jpg',
                productPrice: '150'
                }
            */
            let products = []
            for (let index = 0; index < 5; index++) {
                let product = {}
                product.id = index;
                product.productName = faker.commerce.productName();
                product.productPrice = faker.commerce.price(100, 400);
                product.productImage = faker.image.business(640, 480, true)
                products.push (product)
            }
            resolve (products)
        })
    }

}

module.exports = ContendorSQL