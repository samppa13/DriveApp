import { Request, Response, Router } from 'express'
import { JwtPayload } from 'jsonwebtoken'
import { verifyToken } from '../middleware/auth'
import { ITextDocument, TextDocument } from '../models/TextDocument'

const router: Router = Router()

interface AuthRequest extends Request {
    user?: JwtPayload
}

router.get('/', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const textDocuments = await TextDocument.find({ user: request.user?.id })
        response.status(200).json(textDocuments)
    } catch (error) {
        response.status(500).json({ error: 'Error fetching text documents'})
    }
})

router.post('/', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const { name, text } = request.body
        const userId = request.user?.id

        if (!name) {
            response.status(400).json({error: 'Document must have a name'})
        }

        const newTextDocument: ITextDocument = new TextDocument({
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

router.put('/:id', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const { name, text } = request.body
        if (!name) {
            response.status(400).json({error: 'Document must have a name'})
        }

        const updatedTextDocument: ITextDocument | null = await TextDocument.findOneAndUpdate(
            { _id: request.params.id, user: request.user?.id },
            { name: name, text: text },
            { new: true }
        )
        if (!updatedTextDocument) {
            response.status(404).json({ error: 'Text document not found' })
            return
        }

        response.json(updatedTextDocument)
    } catch (error) {
        response.status(500).json({ error: 'Error updating text document' })
    }
})

router.delete('/:id', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const textDocument: ITextDocument | null = await TextDocument.findOneAndDelete({
            _id: request.params.id,
            user: request.user?.id
        })
        if (!textDocument) {
            response.status(404).json({ error: 'Text document not found' })
            return
        }

        response.status(200).json({ message: 'Text document deleted successfully' })
    } catch (error) {
        response.status(500).json({ error: 'Error deleting text document' })
    }
})

export default router
