/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const { createAccount, clearDatabase, app, request } = require('./helper')

describe('Account', () => {
    beforeEach(async() => {
        await clearDatabase()
    })

    describe('POST /accounts (register)', () => {
        it('can register a new account', async() => {
            const account = await createAccount()
            expect(account.status).toBe(200)
            expect(account.body).toHaveProperty('email', 'test@example.com')
        })

        it('should not register without an email', async() => {
            const response = await request(app).post('/accounts').send({
                password: 'Password1234',
                role: 'customer',
            })
            expect(response.status).toBeGreaterThanOrEqual(400)
        })

        it('should not register without a password', async() => {
            const response = await request(app).post('/accounts').send({
                email: 'nopassword@example.com',
                role: 'customer',
            })
            expect(response.status).toBeGreaterThanOrEqual(400)
        })

        it('should store email in lowercase', async() => {
            const account = await createAccount({ email: 'UPPER@EXAMPLE.COM' })
            expect(account.body.email).toBe('upper@example.com')
        })
    })

    describe('POST /accounts/session (login)', () => {
        it('can login with valid credentials', async() => {
            await createAccount()
            const login = await request(app).post('/accounts/session').send({
                email: 'test@example.com',
                password: 'Password1234',
            })
            expect(login.status).toBe(200)
            expect(login.body).toHaveProperty('email', 'test@example.com')
        })

        it('should not login with wrong password', async() => {
            await createAccount()
            const login = await request(app).post('/accounts/session').send({
                email: 'test@example.com',
                password: 'wrongpassword',
            })
            expect(login.status).toBe(401)
        })

        it('should not login with non-existing email', async() => {
            const login = await request(app).post('/accounts/session').send({
                email: 'nobody@example.com',
                password: 'Password1234',
            })
            expect(login.status).toBe(401)
        })

        it('should not login without email', async() => {
            const login = await request(app).post('/accounts/session').send({
                password: 'Password1234',
            })
            expect(login.status).toBe(400)
        })

        it('should not login without password', async() => {
            const login = await request(app).post('/accounts/session').send({
                email: 'test@example.com',
            })
            expect(login.status).toBe(401)
        })
    })

    describe('GET /accounts/session', () => {
        it('should return the session', async() => {
            const response = await request(app).get('/accounts/session')
            expect(response.status).toBe(200)
        })
    })
})
