import { Request, Response, Router } from 'express'
import { JwtPayload } from 'jsonwebtoken'
import { verifyToken } from '../middleware/auth'
import { ITextDocument, TextDocumentModel } from '../models/document/Text'
import mongoose from 'mongoose'

const router: Router = Router()

interface AuthRequest extends Request {
    user?: JwtPayload
}

router.post('/', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const { name, text } = request.body
        const userId = request.user?.id

        if (!name) {
            response.status(400).json({error: 'Document must have a name'})
            return
        }

        const newTextDocument: ITextDocument = new TextDocumentModel({
            name,
            text,
            user: userId
        })
        await newTextDocument.save()
        response.status(200).json(newTextDocument)
    } catch (error) {
        response.status(500).json({ error: 'Error creating text document' })
    }
})

router.get('/:id', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            response.status(404).json({ error: 'Text document not found' })
            return
        }

        const textDocument: ITextDocument | null = await TextDocumentModel.findOne({
            _id: id,
            isDeleted: false,
            $or: [
                { user: request.user?.id },
                { permissions: request.user?.id }
            ]
        })
        if (!textDocument) {
            response.status(404).json({ error: 'Text document not found' })
            return
        }

        response.json(textDocument)
    } catch (error) {
        response.status(500).json({ error: 'Error fetching text document'})
    }
})

router.put('/:id', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const { name, text } = request.body
        if (!name) {
            response.status(400).json({error: 'Text document must have a name'})
            return
        }

        const updatedTextDocument: ITextDocument | null = await TextDocumentModel.findOneAndUpdate(
            {
                _id: request.params.id,
                isDeleted: false,
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
            { name, text },
            { new: true }
        )
        if (!updatedTextDocument) {
            response.status(404).json({ error: 'Text document is locked by another user or does not found' })
            return
        }

        response.json(updatedTextDocument)
    } catch (error) {
        response.status(500).json({ error: 'Error updating text document' })
    }
})

router.get('/:uuid/view', async (request: Request, response: Response) => {
    try {
        const textDocument: ITextDocument | null = await TextDocumentModel.findOne({
            viewToken: request.params.uuid,
            isDeleted: false
        })
        if (!textDocument) {
            response.status(400).json({ error: 'Document not found' })
            return
        }

        response.status(200).json(textDocument)
    } catch (error) {
        response.status(500).json({ error: 'Error fetching text document' })
    }
})

export default router
