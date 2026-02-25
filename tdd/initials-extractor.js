module.exports = function(name) {
    const names = name.split(' ')
    return names
        .filter(n => n[0].toUpperCase() == n[0] || n == 'zu')
        .map(n => n[0])
        .join('')
}