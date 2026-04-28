/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */

const mockCreate = jest.fn()

jest.mock('openai', () => {
    return jest.fn().mockImplementation(() => ({
        chat: { completions: { create: mockCreate } },
    }))
})

const generateOrder = require('../src/lib/order-generator')

describe('order-generator', () => {
    beforeEach(() => {
        mockCreate.mockReset()
    })

    it('returns parsed JSON on valid response', async () => {
        mockCreate.mockResolvedValue({
            choices: [{ message: { content: '{"origin":"A","destination":"B"}' } }],
        })
        const result = await generateOrder('move A to B')
        expect(result).toEqual({ origin: 'A', destination: 'B' })
    })

    it('throws DomainError 502 on empty response', async () => {
        mockCreate.mockResolvedValue({ choices: [{ message: { content: '' } }] })
        await expect(generateOrder('hi')).rejects.toMatchObject({
            status: 502,
            name: 'DomainError',
        })
    })

    it('throws DomainError 502 on malformed JSON', async () => {
        mockCreate.mockResolvedValue({ choices: [{ message: { content: 'not json' } }] })
        await expect(generateOrder('hi')).rejects.toMatchObject({
            status: 502,
            name: 'DomainError',
        })
    })
})
