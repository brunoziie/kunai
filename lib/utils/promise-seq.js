module.exports = function PromiseSeq(arr, progress) {
    const out = [];
    const init = Promise.resolve();

    const size = arr.filter(p => p.isRequest).length;
    let done = 0;

    if (progress) {
        progress(done, size);
    }
    
    const reducer = (acc, cur) => acc.then((res) => {
        out.push(res);

        return cur().then((res) => {
            if (cur.isRequest) {
                done += 1;

                if (progress) {
                    progress(done, size);
                }
            }

            return res;
        });
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