import { Request, Response, Router } from 'express'
import { JwtPayload } from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { verifyToken } from '../middleware/auth'
import { ITextDocument, TextDocument } from '../models/TextDocument'
import { IUser, User } from '../models/User'

const router: Router = Router()

interface AuthRequest extends Request {
    user?: JwtPayload
}

router.get('/', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const ownedTextDocs: ITextDocument[] = await TextDocument.find({
            user: request.user?.id
        })
        const sharedTextDocs: ITextDocument[] = await TextDocument.find({
            permissions: request.user?.id
        }).populate('user', 'id username')

        response.status(200).json({
            ownedTextDocs,
            sharedTextDocs
        })
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
            {
                _id: request.params.id,
                $or: [
                    { user: request.user?.id },
                    { permissions: request.user?.id }
                ]
            },
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

        const textDocument: ITextDocument | null = await TextDocument.findOne({
            _id: request.params.id,
            user: request.user?.id
        })
        if (!textDocument) {
            response.status(404).json({ error: 'Text document not found'})
            return
        }
        if (textDocument.permissions.includes(request.body.userId)) {
            response.status(400).json({ error: 'This user already has permission to edit the text document' })
            return
        }

        textDocument.permissions.push(request.body.userId)
        await textDocument.save()
        response.status(200).json({ message: 'User has been granted edit permission successfully' })
    } catch (error) {
        response.status(500).json({ error: 'Error updating permissions'})
    }
})

router.put('/:id/permissions/view', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const updatedTextDocument: ITextDocument | null = await TextDocument.findOne({
            _id: request.params.id,
            user: request.user?.id
        })
        if (!updatedTextDocument) {
            response.status(404).json({ error: 'Text document not found' })
            return
        }
        if (updatedTextDocument.viewToken) {
            response.status(400).json({ error: 'This text document already has a view link' })
            return
        }

        const viewToken: string = uuidv4()
        updatedTextDocument.viewToken = viewToken
        await updatedTextDocument.save()

        response.status(200).json(viewToken)
    } catch (error) {
        response.status(500).json({ error: 'Error creating share view link' })
    }
})

router.get('/:uuid/view', async (request: Request, response: Response) => {
    try {
        const textDocument: ITextDocument | null = await TextDocument.findOne({
            viewToken: request.params.uuid
        })
        if (!textDocument) {
            response.status(400).json({ error: 'Text document not found' })
            return
        }

        response.status(200).json(textDocument)
    } catch (error) {
        response.status(500).json({ error: 'Error fetching text document' })
    }
})

export default router
