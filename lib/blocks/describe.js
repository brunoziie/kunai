module.exports = {
    verb: ['DESCRIBE'],

    compiler: (block) => {
        const [signature, verb, description] = block.signature.match(/([A-Z]+)\s?'(.*)'/);

        if (!description) {
            throw new Error(`Invalid signature for block "${block.signature}"`);
        }

        return `description: '${description}'`;
    }
}