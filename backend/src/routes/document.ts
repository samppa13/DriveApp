import { Request, Response, Router } from 'express'
import { JwtPayload } from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { verifyToken } from '../middleware/auth'
import { IUser, User } from '../models/User'
import { DocumentModel, IDocument } from '../models/document/Document'

const router: Router = Router()

interface AuthRequest extends Request {
    user?: JwtPayload
}

const LOCK_TIMEOUT = 2 * 60 * 1000

router.get('/', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const ownedDocs: IDocument[] = await DocumentModel.find({
            user: request.user?.id
        })
        const sharedDocs: IDocument[] = await DocumentModel.find({
            permissions: request.user?.id
        }).populate('user', 'id username')

        response.status(200).json({
            ownedDocs,
            sharedDocs
        })
    } catch (error) {
        response.status(500).json({ error: 'Error fetching documents'})
    }
})

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
            user: request.user?.id
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

router.put('/:id/permissions/view', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const updatedDocument: IDocument | null = await DocumentModel.findOne({
            _id: request.params.id,
            user: request.user?.id
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

router.put('/:id/lock', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const document: IDocument | null = await DocumentModel.findOne({
            _id: request.params.id,
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

router.delete('/:id/lock', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const document: IDocument | null = await DocumentModel.findOne({
            _id: request.params.id,
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

export default router
