const initialsExtractor = require('../tdd/initials-extractor')

describe('initialsExtractor', () => {
    it('should return the initials of the name', () => {
        const actualOutput = initialsExtractor('Akin Karadag')
        const expectedOutput = 'AK'

        expect(actualOutput).toBe(expectedOutput)
    })

    it('should return the initials of a name with a middle name', () => {
        const actualOutput = initialsExtractor('John Doe Smith')
        const expectedOutput = 'JDS'

        expect(actualOutput).toBe(expectedOutput)
    })

    it('should return all the initials of a name with multiple middle names', () => {
        const actualOutput = initialsExtractor('Rodrigo Martinez de la Cruz')
        const expectedOutput = 'RMC'

        expect(actualOutput).toBe(expectedOutput)
    })

    it('should shorten zu to z', () => {
        const actualOutput = initialsExtractor('Andreas zu Guttenberg')
        const expectedOutput = 'AzG'

        expect(actualOutput).toBe(expectedOutput)
    })

    it('should not shorten za to z', () => {
        const actualOutput = initialsExtractor('Andreas za Guttenberg')
        const expectedOutput = 'AG'

        expect(actualOutput).toBe(expectedOutput)
    })
})