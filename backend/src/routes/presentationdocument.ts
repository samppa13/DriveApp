import { Request, Response, Router } from 'express'
import { JwtPayload } from 'jsonwebtoken'
import { verifyToken } from '../middleware/auth'
import mongoose from 'mongoose'
import { IPresentationDocument, PresentationDocumentModel } from '../models/document/Presentation'

const router: Router = Router()

interface AuthRequest extends Request {
    user?: JwtPayload
}

router.post('/', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const { name, slides } = request.body
        const userId = request.user?.id

        if (!name) {
            response.status(400).json({error: 'Document must have a name'})
            return
        }

        const newPresentationDocument: IPresentationDocument = new PresentationDocumentModel({
            name,
            slides,
            user: userId
        })
        await newPresentationDocument.save()
        response.status(200).json(newPresentationDocument)
    } catch (error) {
        response.status(500).json({ error: 'Error creating presentation document' })
    }
})

router.get('/:id', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            response.status(404).json({ error: 'Presentation document not found' })
            return
        }

        const presentationDocument: IPresentationDocument | null = await PresentationDocumentModel.findOne({
            _id: id,
            $or: [
                { user: request.user?.id },
                { permissions: request.user?.id }
            ]
        })
        if (!presentationDocument) {
            response.status(404).json({ error: 'Presentation document not found' })
            return
        }

        response.json(presentationDocument)
    } catch (error) {
        response.status(500).json({ error: 'Error fetching presentation document'})
    }
})

router.put('/:id', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const { name, slides } = request.body
        if (!name) {
            response.status(400).json({error: 'Presentation document must have a name'})
            return
        }

        const updatedPresentationDocument: IPresentationDocument | null = await PresentationDocumentModel.findOneAndUpdate(
            {
                _id: request.params.id,
                $and: [
                    {
                        $or: [
                            { user: request.user?.id },
                            { permissions: request.user?.id }
                        ]
                    },
                    {
                        $or: [
                            { lock: null },
                            { 'lock.user': request.user?.id }
                        ]
                    }
                ]
            },
            { name, slides },
            { new: true }
        )
        if (!updatedPresentationDocument) {
            response.status(404).json({ error: 'Presentation document is locked by another user or does not found' })
            return
        }

        response.json(updatedPresentationDocument)
    } catch (error) {
        response.status(500).json({ error: 'Error updating presentation document' })
    }
})

router.delete('/:id', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const presentationDocument: IPresentationDocument | null = await PresentationDocumentModel.findOneAndDelete({
            _id: request.params.id,
            user: request.user?.id
        })
        if (!presentationDocument) {
            response.status(404).json({ error: 'Presentation document not found' })
            return
        }

        response.status(200).json({ message: 'Presentation document deleted successfully' })
    } catch (error) {
        response.status(500).json({ error: 'Error deleting presentation document' })
    }
})

router.get('/:uuid/view', async (request: Request, response: Response) => {
    try {
        const presentationDocument: IPresentationDocument | null = await PresentationDocumentModel.findOne({
            viewToken: request.params.uuid
        })
        if (!presentationDocument) {
            response.status(400).json({ error: 'Document not found' })
            return
        }

        response.status(200).json(presentationDocument)
    } catch (error) {
        response.status(500).json({ error: 'Error fetching presentation document' })
    }
})

export default router
