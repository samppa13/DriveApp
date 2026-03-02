import { Request, Response, Router } from 'express'
import { JwtPayload } from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import { verifyToken } from '../middleware/auth'
import { IUser, User } from '../models/User'
import { DocumentModel, IDocument } from '../models/document/Document'
import path from 'path'
import { IImage, ImageModel } from '../models/document/Image'

const router: Router = Router()

interface AuthRequest extends Request {
    user?: JwtPayload
}

const LOCK_TIMEOUT = 2 * 60 * 1000


// Get all documents owned by the logged-in user
router.get('/', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const ownedDocs: IDocument[] = await DocumentModel.find({
            user: request.user?.id,
            isDeleted: false
        })

        response.status(200).json(ownedDocs)
    } catch (error) {
        response.status(500).json({ error: 'Error fetching documents'})
    }
})


// Get all documents shared by the logged-in user
router.get('/shared', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const sharedDocs: IDocument[] = await DocumentModel.find({
            permissions: request.user?.id,
            isDeleted: false
        }).populate('user', 'id username')

        response.status(200).json(sharedDocs)
    } catch (error) {
        response.status(500).json({ error: 'Error fetching shared documents' })
    }
})

// Get all documents in the user's trash
router.get('/trash', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const documents: IDocument[] = await DocumentModel.find({
            user: request.user?.id,
            isDeleted: true
        })

        response.status(200).json(documents)
    } catch (error) {
        response.status(500).json({ error: 'Error fetching trash' })
    }
})

// Restore all documents from trash for the logged-in user
router.post('/trash/restore', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        await DocumentModel.updateMany(
            {
                user: request.user?.id,
                isDeleted: true
            },
            { isDeleted: false }
        )

        response.status(200).json({ message: 'Documents restored successfully' })
    } catch (error) {
        response.status(500).json({ error: 'Error restoring documents'})
    }
})


// Permanently delete all trashed documents and images
router.delete('/trash/empty', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const images: IImage[] = await ImageModel.find({
            user: request.user?.id,
            isDeleted: true
        })

        for (const image of images) {
            const imgPath = path.join('./public', image.path)
            if (fs.existsSync(imgPath)) {
                try {
                    await fs.promises.unlink(imgPath)
                } catch (error) {
                    console.log(`Failed delete file ${imgPath}`)
                }
            }
        }

        await DocumentModel.deleteMany({
            user: request.user?.id,
            isDeleted: true
        })

        response.status(200).json({ message: 'Trash emptied successfully' })
    } catch (error) {
        response.status(500).json({ error: 'Error emptying trash' })
    }
})

// Move a document to trash
router.delete('/:id', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const updatedDocument: IDocument | null = await DocumentModel.findOneAndUpdate(
            {
                _id: request.params.id,
                user: request.user?.id,
                isDeleted: false
            },
            { isDeleted: true },
            { new: true }
        )
        if (!updatedDocument) {
            response.status(404).json({ error: 'Document not found' })
            return
        }

        response.status(200).json({ message: 'Document moved to trash successfully' })
    } catch (error) {
        response.status(500).json({ error: 'Error deleting document' })
    }
})

// Permanently delete a single trashed document
router.delete('/:id/permanent', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const document: IDocument | null = await DocumentModel.findOne({
            _id: request.params.id,
            user: request.user?.id,
            isDeleted: true
        })
        if (!document) {
            response.status(404).json({ error: 'Document not found' })
            return
        }
        if (document.type === 'Image') {
            const image: IImage | null = await ImageModel.findById(request.params.id)
            if (!image) {
                response.status(404).json({ error: 'Document not found' })
                return
            }

            const imgPath = path.join('./public', image.path)
            if (fs.existsSync(imgPath)) {
                await fs.promises.unlink(imgPath)
            }
        }

        await DocumentModel.findByIdAndDelete(document._id)

        response.status(200).json({ message: 'Document deleted successfully' })
    } catch (error) {
        response.status(500).json({ error: 'Error deleting document' })
    }
})

// Restore a single document from trash
router.post('/:id/restore', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const updatedDocument: IDocument | null = await DocumentModel.findOneAndUpdate(
            {
                _id: request.params.id,
                user: request.user?.id,
                isDeleted: true
            },
            { isDeleted: false },
            { new: true }
        )
        if (!updatedDocument) {
            response.status(404).json({ error: 'Document not found' })
            return
        }

        response.status(200).json(updatedDocument)
    } catch (error) {
        response.status(500).json({ error: 'Error restoring document' })
    }
})


// Grant edit permission to another user
router.put('/:id/permissions', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        if (!request.body.userId) {
            response.status(400).json({ error: 'User id is required to grant edit permission' })
            return
        }
        if (request.body.userId === request.user?.id) {
            response.status(400).json({ error: 'You cannot grant edit permission to yourself' })
            return
        }

        const userExists: IUser | null = await User.findById(request.body.userId)
        if (!userExists) {
            response.status(404).json({ error: 'User not found' })
            return
        }

        const document: IDocument | null = await DocumentModel.findOne({
            _id: request.params.id,
            user: request.user?.id,
            isDeleted: false
        })
        if (!document) {
            response.status(404).json({ error: 'Document not found'})
            return
        }
        if (document.permissions.includes(request.body.userId)) {
            response.status(400).json({ error: 'This user already has permission to edit the document' })
            return
        }

        document.permissions.push(request.body.userId)
        await document.save()
        response.status(200).json({ message: 'User has been granted edit permission successfully' })
    } catch (error) {
        response.status(500).json({ error: 'Error updating permissions'})
    }
})


// Create a shareable view link for a document
router.put('/:id/permissions/view', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const updatedDocument: IDocument | null = await DocumentModel.findOne({
            _id: request.params.id,
            user: request.user?.id,
            isDeleted: false
        })
        if (!updatedDocument) {
            response.status(404).json({ error: 'Document not found' })
            return
        }
        if (updatedDocument.viewToken) {
            response.status(400).json({ error: 'This document already has a view link' })
            return
        }

        const viewToken: string = uuidv4()
        updatedDocument.viewToken = viewToken
        await updatedDocument.save()

        response.status(200).json(viewToken)
    } catch (error) {
        response.status(500).json({ error: 'Error creating share view link' })
    }
})



// Lock a document for editing
router.put('/:id/lock', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const document: IDocument | null = await DocumentModel.findOne({
            _id: request.params.id,
            isDeleted: false,
            $or: [
                { user: request.user?.id },
                { permissions: request.user?.id }
            ]
        })
        if (!document) {
            response.status(404).json({ error: 'Document not found' })
            return
        }
        if (document.lock) {
            const expired: boolean = Date.now() - document.lock.lockTime.getTime() > LOCK_TIMEOUT

            if (!expired && document.lock.user.toString() !== request.user?.id) {
                response.status(409).json({ error: 'Document is currently locked by another user' })
                return
            }
        }

        document.lock = {
            user: request.user?.id,
            lockTime: new Date(Date.now())
        }
        await document.save()
        response.status(200).json(document)
    } catch (error) {
        response.status(500).json({ error: 'Error adding lock'})
    }
})

// Release the lock on a document
router.delete('/:id/lock', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const document: IDocument | null = await DocumentModel.findOne({
            _id: request.params.id,
            isDeleted: false,
            $or: [
                { user: request.user?.id },
                { permissions: request.user?.id }
            ]
        })
        if (!document) {
            response.status(404).json({ error: 'Document not found' })
            return
        }
        if (!document.lock) {
            response.status(400).json({ error: 'Document is not locked' })
            return
        }
        if (document.lock.user.toString() !== request.user?.id) {
            response.status(403).json({ error: 'You do not own the document lock' })
            return
        }

        document.lock = null
        await document.save()
        response.status(200).json({ message: 'Document lock released successfully'})
    } catch (error) {
        response.status(500).json({ error: 'Error releasing document lock' })
    }
})



// Clone a document
router.post('/:id/clone', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const originalDoc = await DocumentModel.findById(request.params.id)
        if (!originalDoc) {
            response.status(404).json({ error: 'Document not found' })
            return
        }

        const newDoc = new DocumentModel({
            ...originalDoc.toObject(),
            _id: undefined,
            name: originalDoc.name + ' (Copy)',
            createdAt: new Date(),
            updatedAt: new Date(),
        })

        await newDoc.save()
        response.json(newDoc)
    } catch (err) {
        response.status(500).json({ error: 'Error cloning document' })
    }
})

export default router
