import { Request, Response, Router } from 'express'
import { JwtPayload } from 'jsonwebtoken'
import fs from 'fs'
import { verifyToken } from '../middleware/auth'
import { IImage, ImageModel } from '../models/document/Image'
import upload from '../middleware/multer-config'
import path from 'path'

const router: Router = Router()

interface AuthRequest extends Request {
    user?: JwtPayload
}

router.get('/:id', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const image: IImage | null = await ImageModel.findOne({
            _id: request.params.id,
            isDeleted: false,
            $or: [
                { user: request.user?.id },
                { permissions: request.user?.id }
            ]
        })
        if (!image) {
            response.status(404).json({ error: 'Image not found' })
            return
        }

        response.status(200).json(image)
    } catch (error) {
        response.status(500).json({ error: 'Error fetching image' })
    }
})

router.get('/:filename/file', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const { filename } = request.params
        const userId = request.user?.id

        if (!filename || Array.isArray(filename)) {
            response.status(400).json({ message: 'Invalid filename' })
            return
        }

        const image = await ImageModel.findOne({ name: filename, isDeleted: false })
        if (!image) {
            response.status(404).json({ error: 'Image not found' })
            return
        }
        
        const isOwner = image.user.toString() === userId
        const isSharedWithUser = image.permissions.some(
            (id) => id.toString() === userId
        )
        if (!isOwner && !isSharedWithUser) {
            response.status(403).json({ error: 'Not allowed' })
            return
        }
        if (filename.includes('..') || filename.includes('/')) {
            response.status(400).json({ error: 'Invalid filename' })
            return
        }

        const imagesDir = path.resolve(__dirname, `../../../public/images/${image.user}`)
        const filePath = path.resolve(imagesDir, filename)
        if (!filePath.startsWith(imagesDir)) {
            response.status(400).json({ error: 'Invalid path' })
            return
        }

        if (!fs.existsSync(filePath)) {
            response.status(404).json({ error: 'File missing on server' })
            return
        }

        response.sendFile(filePath)
    } catch (error) {
        response.status(500).json({ error: 'Error feching image' })
    }
})



router.post('/upload', verifyToken, upload.single('image'), async (request: AuthRequest, response: Response) => {
    try {
        if (!request.file) {
            response.status(400).json({ error: 'No file uploaded' })
            return
        }

        const imgPath: string = request.file.path.replace('public', '')

        const image: IImage = new ImageModel({
            name: request.file.filename,
            path: imgPath,
            user: request.user?.id,
            originalName: request.file.originalname
        })
        await image.save()

        response.status(201).json({ message: 'File uploaded and saved in the database' })
    } catch (error) {
        response.status(500).json({ error: 'Error uploading image' })
    }
})

export default router
