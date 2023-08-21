const dayjs = require("dayjs");
const { Op } = require("./Op");
const { Sign } = require("./Sign");

const scope = (content) => `(${content})`;
const escape = (value) => {
    if (value === null) {
        return 'NULL';
    } else if (typeof value == 'string') {
        return `"${value}"`;
    } else if (value instanceof Date) {
        return escape(dayjs(value).format('YYYY-MM-DD HH:mm:ss'));
    } else if (Array.isArray(value)) {
        return `(${value.map(v => escape(v)).join(', ')})`;
    }
    return value;
};

class QueryBuilder {

    database = null;
    table = null;

    constructor(database, table) {
        this.database = database;
        this.table = table;
    }

    static escape(value) {
        return escape(value);
    }

    static scope(content) {
        return scope(content);
    }

    col(column) {
        if (this.table) {
            return `\`${this.database}\`.\`${this.table}\`.\`${column}\``;
        } else if (this.table) {
            return `\`${this.table}\`.\`${column}\``;
        } else {
            return `\`${column}\``;
        }
    }

    where(parent_key, key, value) {

        if (key == null && value == null) {
            return '';
        }

        switch (key) {
            case Op.raw:
                return scope(value);
            case Op.and:
            case Op.or:
                const arr = value.map((v) => this.where(key, null, v));
                return scope(arr.join(` ${Sign[key]} `));
            case Op.gt:
            case Op.gte:
            case Op.lt:
            case Op.lte:
            case Op.in:
            case Op.notIn:
            case Op.is:
            case Op.not:
                return `${this.col(parent_key)} ${Sign[key]} ${escape(value)}`;

        }

        if (Array.isArray(value)) {
            return this.where(key, Op.in, value);
        } else if (typeof value == 'object') {
            const entries = Object.entries(value);
            const arr = entries.map(([k, v]) => this.where(key, k, v));
            return scope(arr.join(` ${Sign[Op.and]} `));
        } else {
            return `${this.col(key)} = ${escape(value)}`;
        }
    }

    attributes(attributes) {
        if (attributes) {
            const entries = Object.entries(value);
            return entries.map(([col, alias]) => `${this.col(col)} as \`${alias}\``).join(', ')
        }
        return '*';
    }

    static build({ database, table, attrs, where, groupBy, limit, offset, paranoid = true }) {
        const builder = new QueryBuilder(database, table);
        const attributes = builder.attributes(attrs);

        if (paranoid) {
            where = {
                ...(where || {}),
                deleted_at: { [Op.not]: null }
            }
        }

        const whereStr = builder.where(null, null, where);
        const sql = [
            `SELECT ${attributes} `,
            `FROM ${builder.table} `,
            (whereStr ? `WHERE ${whereStr} ` : null),
            (groupBy ? `GROUP BY ${groupBy.map(g => builder.col(g)).join(', ')} ` : null),
            (limit ? `LIMIT ${limit} ` : null),
            (limit && offset ? `OFFSET ${offset} ` : null)
        ].filter(f => !!f);
        return sql.join('').trim() + ';';
    }

    static update({ database, table, attrs, where, timestamps = false, paranoid = true }) {

        const builder = new QueryBuilder(database, table);

        if (timestamps) {
            attrs.push(['updated_at', new Date])
        }

        const attributes = attrs.map(([column, value]) => {
            return `${builder.col(column)} = ${escape(value)}`
        }).join(', ')

        if (paranoid) {
            where = { ...(where || {}), deleted_at: { [Op.not]: null } }
        }

        const whereStr = builder.where(null, null, where);
        const sql = [
            `UPDATE ${builder.table} `,
            `SET ${attributes} `,
            (whereStr ? `WHERE ${whereStr} ` : null)
        ].filter(f => !!f);
        return sql.join('').trim() + ';';
    }
}

module.exports.QueryBuilder = QueryBuilder;
