/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const { createAccount, clearDatabase, app, request } = require('./helper')
const Account = require('../src/models/account')

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

        it('can register a customer account', async() => {
            const response = await request(app).post('/accounts').send({
                email: 'customer-register@example.com',
                password: 'SafePass1234',
                role: 'customer',
                customerName: 'Client One',
            })

            expect(response.status).toBe(200)
            expect(response.body.customerName).toBe('Client One')
        })

        it('can register an employee account', async() => {
            const response = await request(app).post('/accounts').send({
                email: 'employee-register@example.com',
                password: 'StaffSafe1234',
                role: 'employee',
                name: 'Dispatcher One',
            })

            expect(response.status).toBe(200)
            expect(response.body.name).toBe('Dispatcher One')
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

        it('resets expired lock counters before recording a new failed login', async() => {
            await createAccount()
            const account = await Account.findOne({ email: 'test@example.com' })
            account.failedLoginAttempts = 3
            account.lockUntil = new Date(Date.now() - 1000)
            await account.registerFailedLoginAttempt()

            expect(account.failedLoginAttempts).toBe(1)
            expect(account.lockUntil).toBeNull()
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

        it('returns the logged-in customer profile', async() => {
            const agent = request.agent(app)
            await agent.post('/accounts').send({
                email: 'session-customer@example.com',
                password: 'SafePass1234',
                role: 'customer',
                customerName: 'Session Customer',
            })
            await agent.post('/accounts/session').send({
                email: 'session-customer@example.com',
                password: 'SafePass1234',
            })

            const session = await agent.get('/accounts/session')

            expect(session.status).toBe(200)
            expect(session.body.role).toBe('customer')
            expect(session.body.profile.customerName).toBe('Session Customer')
        })

        it('returns the logged-in employee profile', async() => {
            const agent = request.agent(app)
            await agent.post('/accounts').send({
                email: 'session-employee@example.com',
                password: 'StaffSafe1234',
                role: 'employee',
                name: 'Session Employee',
            })
            await agent.post('/accounts/session').send({
                email: 'session-employee@example.com',
                password: 'StaffSafe1234',
            })

            const session = await agent.get('/accounts/session')

            expect(session.status).toBe(200)
            expect(session.body.role).toBe('employee')
            expect(session.body.profile.name).toBe('Session Employee')
        })

        it('returns null profile if a profile-backed account is missing its profile document', async() => {
            const agent = request.agent(app)
            await Account.register(
                new Account({
                    email: 'missing-profile@example.com',
                    role: 'customer',
                }),
                'SafePass1234'
            )
            await agent.post('/accounts/session').send({
                email: 'missing-profile@example.com',
                password: 'SafePass1234',
            })

            const session = await agent.get('/accounts/session')

            expect(session.status).toBe(200)
            expect(session.body.profile).toBeNull()
        })
    })

    describe('DELETE /accounts/session (logout)', () => {
        it('logs out the current session', async() => {
            const agent = request.agent(app)
            await agent.post('/accounts').send({
                email: 'logout@example.com',
                password: 'Password1234',
                role: 'admin',
            })
            await agent.post('/accounts/session').send({
                email: 'logout@example.com',
                password: 'Password1234',
            })

            const logout = await agent.delete('/accounts/session')
            const session = await agent.get('/accounts/session')

            expect(logout.status).toBe(200)
            expect(logout.body).toEqual({ message: 'Logged out' })
            expect(session.body).toEqual({})
        })
    })
})
