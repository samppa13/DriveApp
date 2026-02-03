import { Request, Response, Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { IUser, User } from '../models/User'
import { verifyToken } from '../middleware/auth'

const router: Router = Router()

router.post('/register', async (request: Request, response: Response) => {
    try {
        const { username, password } = request.body
        if (!username || !password) {
            response.status(400).json({ error: 'Please fill in all fields' })
            return
        }

        const existingUser: IUser | null = await User.findOne({ username })
        if (existingUser) {
            response.status(400).json({ error: 'Username is already taken'})
            return
        }

        const salt: string = await bcrypt.genSalt(10)
        const hashedPassword: string = await bcrypt.hash(password, salt)

        await User.create({
            username: username,
            password: hashedPassword
        })

        response.status(200).json({ message: 'User registered successfully'})
    } catch (error: any) {
        response.status(500).json({ error: 'Error registering user' })
    }
})

router.post('/login', async (request: Request, response: Response) => {
    try {
        const { username, password } = request.body
        if (!username || !password) {
            response.status(400).json({ error: 'Please enter username and password' })
            return
        }

        const user: IUser | null = await User.findOne({ username })
        if (!user || !(await bcrypt.compare(password, user.password))) {
            response.status(400).json({ error: 'Incorrect username or password' })
            return
        }

        const jwtPayload: JwtPayload = {
            id: user._id,
            username: user.username
        }
        const token: string = jwt.sign(jwtPayload, process.env.SECRET as string, { expiresIn: '7d' })
        response.status(200).json({ token })
    } catch (error: any) {
        response.status(500).json({ error: 'Error logging in' })
    }
})

router.get('/', verifyToken, async (request: Request, response: Response) => {
    try {
        const users: IUser[] = await User.find().select('-password')
        return response.status(200).json(users)
    } catch (error: any) {
        response.status(500).json({ error: 'Error while fetching users' })
    }
})

export default router
