module.exports = function PromiseSeq(arr) {
    const out = [];
    const init = Promise.resolve();
    const reducer = (acc, cur) => acc.then((res) => {
        out.push(res);
        return cur();
    })

    return new Promise((resolve, reject) => {
        arr.reduce(reducer, init)
            .then(res => {
                out.push(res);
                return resolve(out.slice(1))
            })
            .catch(reject);
    });
}