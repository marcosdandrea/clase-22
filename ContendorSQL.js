const Knex = require("knex")
const deleteTables = false;

class ContendorSQL {
    constructor(options, tableConfiguration) {
        this.knex = Knex(options);
        this.tableConfiguration = tableConfiguration;

        if (deleteTables) {
            this.knex.schema.dropTable(this.tableConfiguration.tableName)
                .then(()=>console.log ("Table deleted"))
        } else {
            this.knex.schema.hasTable(this.tableConfiguration.tableName)
                .then(exist => {
                    console.log("Table", this.tableConfiguration.tableName, "existance =", exist)
                    if (!exist) this.createTable()
                })
        }

    }

    save(object) {
        return new Promise((resolve, reject) => {
            console.log (object)
            this.knex(this.tableConfiguration.tableName).insert(object)
                .then(() => resolve())
        })
    }

    getAll() {
        return new Promise((resolve, reject) => {
            this.knex.from(this.tableConfiguration.tableName).select("*")
                .then((rows) => {
                    resolve(rows)
                })
        })
    }

    createTable() {
        this.knex.schema.createTable(this.tableConfiguration.tableName, table => {
            const increments = this.tableConfiguration.tableColumns.filter(column => column.type == "increment")
            increments.forEach(newColumn => table.increments(newColumn.name))

            const strings = this.tableConfiguration.tableColumns.filter(column => column.type == "string")
            strings.forEach(newColumn => table.string(newColumn.name))

            const floats = this.tableConfiguration.tableColumns.filter(column => column.type == "float")
            floats.forEach(newColumn => table.string(newColumn.name))

            const integers = this.tableConfiguration.tableColumns.filter(column => column.type == "integer")
            integers.forEach(newColumn => table.string(newColumn.name))

        }).then(() => console.log("table", this.tableConfiguration.tableName, "created"))
    }
}

module.exports = ContendorSQL