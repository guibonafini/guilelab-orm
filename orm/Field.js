
class STRING {
    length = null;

    constructor(length) {
        this.length = length || 255;
    }

    toSql() {
        return `VARCHAR(${this.length})`;
    }

    toString() {
        return this.toSql();
    }
}

class CHAR extends STRING {

    constructor(length) {
        super(length);
    }

    toSql() {
        return `CHAR(${this.length})`;
    }

}

class TEXT extends STRING {

    constructor(length) {
        super(length);
    }

    toSql() {
        switch (this.length.toLowerCase()) {
            case "tiny":
                return "TINYTEXT";
            case "medium":
                return "MEDIUMTEXT";
            case "long":
                return "LONGTEXT";
            default:
                return 'TEXT';
        }
    }
}

class NUMBER {

    length = null;
    zerofill = null;
    decimals = null;
    precision = null;
    scale = null;
    unsigned = null;

    constructor(options = {}) {
        if (typeof options === "number") {
            options = { length: options };
        }

        this.length = options.length;
        this.zerofill = options.zerofill;
        this.decimals = options.decimals;
        this.precision = options.precision;
        this.scale = options.scale;
        this.unsigned = options.unsigned;
    }

    toSql() {
        let result = this.prop;
        if (this.length) {
            result += `(${this._length}`;
            if (typeof this.decimals === "number") {
                result += `,${this.decimals}`;
            }
            result += ")";
        }
        if (this.unsigned) {
            result += " UNSIGNED";
        }
        if (this.zerofill) {
            result += " ZEROFILL";
        }
        return result;
    }
}

class INTEGER extends NUMBER {
    constructor(options = {}) {
        super(options);
        this.key = this.constructor.name;
    }
}

class BIGINT extends NUMBER {
    constructor(options = {}) {
        super(options);
        this.key = this.constructor.name;
    }
}

class FLOAT extends NUMBER {
    constructor(options = {}) {
        super(options);
        this.key = this.constructor.name;
    }
}

class DOUBLE extends NUMBER {
    constructor(options = {}) {
        super(options);
        this.key = this.constructor.name;
    }
}

class ENUM {
    values = []
    constructor(...args) {
        const value = args[0];
        const options = typeof value === "object" && !Array.isArray(value) && value || {
            values: args.reduce((result, element) => {
                return result.concat(Array.isArray(element) ? element : [element]);
            }, [])
        };
        this.values = options.values;
        this.key = this.constructor.name;
    }

    toSql() {
        return this.key;
    }

    toString() {
        return this.toSql();
    }
}

module.exports.Fields = {
    STRING,
    CHAR,
    TEXT,
    INTEGER,
    BIGINT,
    FLOAT,
    DOUBLE,
    ENUM
}