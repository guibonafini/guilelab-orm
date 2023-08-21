const { QueryBuilder } = require("./QueryBuilder")

class Model {
    
    static table = null;
    static connection = null;
    static attributes = {};
    static paranoid = false;
    static database = null;
    static timestamps = null;

    static init(attributes, options) {
        Model.attributes = attributes;
        Model.connection = options?.connection;
        Model.table = options?.table;
        Model.paranoid = options?.paranoid;
        Model.database = options?.database;
        Model.timestamps = options?.timestamps;
    }

    /**
     * 
     * @param {Object} options 
     * @param {Object} connection
     * @param {string|null} where
     * @param {string|null} table
     * @param {boolean|null} paranoid
     * @returns {Promise<Array<Model>|String>}
     */
    static async findAll(options) {
        const sql  = QueryBuilder.build({
            ...options,
            database: options?.database || Model.database,
            table: options?.table || Model.table,
            paranoid: options?.paranoid == undefined ? Model.paranoid : !!options?.paranoid,
        });

        if(options.export === true) {
            return sql;
        }

        const connection = options.connection || Model.connection;
        return await connection.query(sql);
    }

    /**
     * 
     * @param {Object} options 
     * @param {Object} connection
     * @param {string|null} where
     * @param {string|null} table
     * @param {boolean|null} paranoid
     */
    static async findOne(options) {
        options.limit = 1;
        return await Model.findAll(options);
    }

    /**
     * 
     * @param {Object} options 
     * @param {Object} connection
     * @param {string|null} where
     * @param {string|null} table
     * @param {boolean|null} paranoid
     */
    static async findByPk(key) {
        options.where = {
            ...(options.where || {}),
            id: key
        };
        options.limit = 1;

        return await Model.findAll(options);
    }

    async save(options) {
        const entries = Object.entries(this.attributes);
        const processed = [];
        for(const [column, options] of entries) {
            if(this[column]) {
                processed.push([column, this[column]])
            } else if(options.defaultValue) {
                processed.push([column, options.defaultValue])
            } else if(!allowNull) {
                throw new Error(`Campo ${Model.table}.${column} não permite valor nulo!`);
            } else {
                processed.push([column, null])
            }
        }
        
        // update
        if(this.id) {
            const sql = QueryBuilder.update({
                database: Model.database,
                table: Model.table,
                attrs: processed,
                where: { id: this.id },
                timestamps: Model.timestamps
            });
        }
    }
}

module.exports.Model = Model