module.exports = (from, to) => {
    const out = {};

    for (key in from) {
        if (from.hasOwnProperty(key)) {
            out[key] = from[key];
        }
    }

    for (key in to) {
        if (to.hasOwnProperty(key)) {
            out[key] = to[key];
        }
    }

    return out;
}