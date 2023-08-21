const { Op } = require("./Op");

const Sign = {
    [Op.and]: ' AND ',
    [Op.or]: ' OR ',
    [Op.gt]: '>',
    [Op.gte]: '>=',
    [Op.lt]: '<',
    [Op.lte]: '<=',
    [Op.is]: 'IS',
    [Op.not]: 'IS NOT',
    [Op.in]: 'IN',
    [Op.notIn]: 'NOT IN',
}

module.exports.Sign = Sign;