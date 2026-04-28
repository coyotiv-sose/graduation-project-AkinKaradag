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

        it('should not expose hash or salt in register response', async() => {
            const account = await createAccount()
            expect(account.status).toBe(200)
            expect(account.body).not.toHaveProperty('hash')
            expect(account.body).not.toHaveProperty('salt')
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
            expect(login.status).toBe(400)
        })

        it('should not expose hash or salt in login response', async() => {
            await createAccount()
            const login = await request(app).post('/accounts/session').send({
                email: 'test@example.com',
                password: 'Password1234',
            })
            expect(login.status).toBe(200)
            expect(login.body).not.toHaveProperty('hash')
            expect(login.body).not.toHaveProperty('salt')
        })

        it('returns identical 401 body for unknown email and wrong password', async() => {
            await createAccount()
            const wrongPassword = await request(app).post('/accounts/session').send({
                email: 'test@example.com',
                password: 'wrongPassword12',
            })
            const unknownEmail = await request(app).post('/accounts/session').send({
                email: 'nobody@example.com',
                password: 'Password1234',
            })
            expect(wrongPassword.status).toBe(401)
            expect(unknownEmail.status).toBe(401)
            expect(wrongPassword.body).toEqual({ error: 'Invalid email or password' })
            expect(unknownEmail.body).toEqual({ error: 'Invalid email or password' })
        })

        it('returns 401 (not 429) for locked accounts even with the correct password', async() => {
            await createAccount()
            for (let attempt = 0; attempt < 3; attempt += 1) {
                // eslint-disable-next-line no-await-in-loop
                await request(app).post('/accounts/session').send({
                    email: 'test@example.com',
                    password: 'wrongPassword12',
                })
            }
            const correctAfterLock = await request(app).post('/accounts/session').send({
                email: 'test@example.com',
                password: 'Password1234',
            })
            expect(correctAfterLock.status).toBe(401)
            expect(correctAfterLock.body).toEqual({ error: 'Invalid email or password' })
        })
    })

    describe('GET /accounts/session', () => {
        it('should return the session', async() => {
            const response = await request(app).get('/accounts/session')
            expect(response.status).toBe(200)
        })

        it('should not expose hash or salt in authenticated session response', async() => {
            const agent = request.agent(app)
            await agent.post('/accounts').send({
                email: 'session@example.com',
                password: 'Password1234',
                role: 'admin',
            })
            await agent.post('/accounts/session').send({
                email: 'session@example.com',
                password: 'Password1234',
            })
            const session = await agent.get('/accounts/session')
            expect(session.status).toBe(200)
            expect(session.body).not.toHaveProperty('hash')
            expect(session.body).not.toHaveProperty('salt')
        })
    })
})
