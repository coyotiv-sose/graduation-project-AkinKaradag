function createDimension({ width, length, height }) {
    return { width, length, height }
}

function volume(dimensions) {
    return dimensions.width * dimensions.length * dimensions.height
}

module.exports = { createDimension, volume }