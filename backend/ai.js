const dotenv = require('dotenv')
const OpenAI = require('openai')

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

module.exports = async function main({ origin, destination, deliveryDate, cargos }) {
    const response = await openai.completions.create({
        model: 'gpt-3.5-turbo-instruct',
        prompt: `Create a description for a logistics order.
Origin: ${origin}
Destination: ${destination}
Delivery Date: ${deliveryDate}
Cargos: ${JSON.stringify(cargos)}
Description:`,
        temperature: 0.2,
        max_tokens: 1000,
    })

    const text = response.choices ? .[0] ? .text || ''
    return text
}

main({
        origin: 'Zurich',
        destination: 'Basel',
        deliveryDate: '2024-06-01',
        cargos: [{ name: 'Electronics', quantity: 10 }],
    })
    .then(console.log)
    .catch(console.error)