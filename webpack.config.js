var path = require('path');

module.exports = {
    entry: {
        index: path.join(__dirname, 'server.js')
    },
    target: 'node',
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'backend.js'
    }
}