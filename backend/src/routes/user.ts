import { Request, Response, Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { IUser, User } from '../models/User'
import { verifyToken } from '../middleware/auth'
import upload from '../middleware/multer-config'
import path from 'path'
import fs from 'fs'

const router: Router = Router()

interface AuthRequest extends Request {
    user?: JwtPayload
}

// Register a new user
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

// Login a user and return a JWT token
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

// Get all users (without passwords)
router.get('/', verifyToken, async (request: Request, response: Response) => {
    try {
        const users: IUser[] = await User.find().select('-password')
        return response.status(200).json(users)
    } catch (error: any) {
        response.status(500).json({ error: 'Error while fetching users' })
    }
})

// Get logged-in user's profile image file
router.get('/profile/image/file', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const user: IUser | null = await User.findById(request.user?.id)
        if (!user) {
            response.status(404).json({ error: 'User not found' })
            return
        }
        if (!user.profileImage) {
            response.status(403).json({ error: 'Profile image not found' })
            return
        }

        const imagesDir = path.resolve(__dirname, `../../../public/images/${user._id}`)
        const imgPath = path.resolve(imagesDir, user.profileImage)
        if (!imgPath.startsWith(imagesDir)) {
            response.status(400).json({ error: 'Invalid path' })
            return
        }
        try {
            await fs.promises.access(imgPath)
        } catch (error) {
            response.status(404).json({ error: 'File missing on server' })
            return
        }

        response.sendFile(imgPath)
    } catch (error) {
        response.status(500).json({ error: 'Error feching image' })
    }
})

// Upload a new profile image for logged-in user
router.post('/profile/image/upload', verifyToken, upload.single('image'), async (request: AuthRequest, response: Response) => {
    try {
        if (!request.file) {
            response.status(400).json({ error: 'No image uploaded' })
            return
        }

        const user: IUser | null = await User.findById(request.user?.id)
        if (!user) {
            response.status(404).json({ error: 'User not found' })
            return
        }
        if (user.profileImage) {
            const oldPath = path.join(__dirname, `../../../public/images/${user._id}/${user.profileImage}`)

            try {
                await fs.promises.unlink(oldPath)
            } catch {}
        }

        user.profileImage = request.file.filename
        await user.save()

        response.status(200).json({ message: 'Profile image updated successfully', filename: request.file.filename })
    } catch (error) {
        response.status(500).json({ error: 'Error uploading image' })
    }
})

// Delete logged-in user's profile image
router.delete('/profile/image', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const user: IUser | null = await User.findById(request.user?.id)
        if (!user) {
            response.status(404).json({ error: 'User not found' })
            return
        }
        if (!user.profileImage) {
            response.status(400).json({ error: 'Profile image not found' })
            return
        }

        const imgPath = path.join(__dirname, `../../../public/images/${user._id}/${user.profileImage}`)

        try {
            await fs.promises.unlink(imgPath)
        } catch {}

        user.profileImage = null
        await user.save()

        response.status(200).json({ message: 'Profile image deleted successfully' })
    } catch (error) {
        response.status(500).json({ error: 'Error deleting profile image' })
    }
})

// Get logged-in user's profile information
router.get('/profile', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const user = await User.findById(request.user?.id).select('-password')

        if (!user) {
            response.status(404).json({ error: 'User not found' })
            return
        }

        response.status(200).json(user)
    } catch (error) {
        response.status(500).json({ error: 'Error fetching profile' })
    }
})

// Update logged-in user's profile information
router.put('/profile', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const { username } = request.body
        if (!username) {
            response.status(400).json({ error: 'Please enter username' })
            return
        }

        const existingUser: IUser | null = await User.findOne({ username })
        if (existingUser && existingUser._id !== request.user?.id) {
            response.status(400).json({ error: 'Username is already taken'})
            return
        }

        const user: IUser | null = await User.findByIdAndUpdate(
            request.user?.id,
            { username },
            { new: true } 
        )
        if (!user) {
            response.status(404).json({ error: 'User not found' })
            return
        }

        response.status(200).json({ message: 'Profile updated successfully', username: user.username })
    } catch (error) {
        response.status(500).json({ error: 'Error updating profile' })
    }
})

export default router
