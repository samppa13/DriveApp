import { Request, Response, Router } from 'express'
import { JwtPayload } from 'jsonwebtoken'
import { verifyToken } from '../middleware/auth'
import mongoose from 'mongoose'
import { ISpreadsheetDocument, SpreadsheetDocumentModel } from '../models/document/Spreadsheet'

const router: Router = Router()

interface AuthRequest extends Request {
    user?: JwtPayload
}

// Create a new spreadsheet document
router.post('/', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const { name, cells } = request.body
        const userId = request.user?.id

        if (!name) {
            response.status(400).json({error: 'Document must have a name'})
            return
        }

        const newSpreadsheetDocument: ISpreadsheetDocument = new SpreadsheetDocumentModel({
            name,
            cells,
            user: userId
        })
        await newSpreadsheetDocument.save()
        response.status(200).json(newSpreadsheetDocument)
    } catch (error) {
        response.status(500).json({ error: 'Error creating spreadsheet document' })
    }
})

// Get a spreadsheet document by ID
router.get('/:id', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            response.status(404).json({ error: 'Spreadsheet document not found' })
            return
        }

        const spreadsheetDocument: ISpreadsheetDocument | null = await SpreadsheetDocumentModel.findOne({
            _id: id,
            isDeleted: false,
            $or: [
                { user: request.user?.id },
                { permissions: request.user?.id }
            ]
        })
        if (!spreadsheetDocument) {
            response.status(404).json({ error: 'Spreadsheet document not found' })
            return
        }

        response.json(spreadsheetDocument)
    } catch (error) {
        response.status(500).json({ error: 'Error fetching spreadsheet document'})
    }
})

// Update a spreadsheet document by ID
router.put('/:id', verifyToken, async (request: AuthRequest, response: Response) => {
    try {
        const { name, cells } = request.body
        if (!name) {
            response.status(400).json({error: 'Spreadsheet document must have a name'})
            return
        }

        const updatedSpreadsheetDocument: ISpreadsheetDocument | null = await SpreadsheetDocumentModel.findOneAndUpdate(
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
            { name, cells },
            { new: true }
        )
        if (!updatedSpreadsheetDocument) {
            response.status(404).json({ error: 'Spreadsheet document is locked by another user or does not found' })
            return
        }

        response.json(updatedSpreadsheetDocument)
    } catch (error) {
        response.status(500).json({ error: 'Error updating spreadsheet document' })
    }
})

// Get a spreadsheet document by view token (public view)
router.get('/:uuid/view', async (request: Request, response: Response) => {
    try {
        const spreadsheetDocument: ISpreadsheetDocument | null = await SpreadsheetDocumentModel.findOne({
            viewToken: request.params.uuid,
            isDeleted: false
        })
        if (!spreadsheetDocument) {
            response.status(400).json({ error: 'Document not found' })
            return
        }

        response.status(200).json(spreadsheetDocument)
    } catch (error) {
        response.status(500).json({ error: 'Error fetching spreadsheet document' })
    }
})

export default router
