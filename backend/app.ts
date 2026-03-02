import dotenv from 'dotenv'
import express, { Express } from 'express'
import cors, { CorsOptions } from 'cors'
import connectDB from './src/config/db'
import userRouter from './src/routes/user'
import documetRouter from './src/routes/document'
import textDocumentRouter from './src/routes/textdocument'
import presentationDocumentRouter from './src/routes/presentationdocument'
import spreadsheetDocumentRouter from './src/routes/spreadsheetdocument'
import imageRouter from './src/routes/image'

dotenv.config()
connectDB()

const app: Express = express()
const port: number = 9000

const corsOptions: CorsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/api/users', userRouter)
app.use('/api/documents', documetRouter)
app.use('/api/textdocuments', textDocumentRouter)
app.use('/api/presentationdocuments', presentationDocumentRouter)
app.use('/api/spreadsheetdocuments', spreadsheetDocumentRouter)
app.use('/api/images', imageRouter)

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
