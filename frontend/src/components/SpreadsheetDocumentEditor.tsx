import type React from 'react'
import type { IDocument, INewDocument } from '../types/types'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface SpreadsheetDocumentEditorProps {
    document?: IDocument
    message: string
    errorMessage: string
    handleSave: (spreadsheetDocument: INewDocument) => void
    handleDelete?: (id: string) => void
}

const SpreadsheetDocumentEditor: React.FC<SpreadsheetDocumentEditorProps> = ({ document, message, errorMessage, handleSave, handleDelete }) => {
    const [name, setName] = useState<string>(document?.name ?? '')
    const [cells, setCells] = useState<string[][]>(
        document?.cells
        ?? Array.from({ length: 15 }, () => Array.from({ length: 15 }, () => ''))
    )
    const [activeCell, setActiveCell] = useState<{ row: number, col: number } | null>(null)

    const navigate = useNavigate()

    useEffect(() => {
        setName(document?.name ?? '')
        setCells(
            document?.cells
            ?? Array.from({ length: 15 }, () => Array.from({ length: 15 }, () => ''))
        )
    }, [document])

    const id = document?._id
    const docType = 'SpreadsheetDocument'

    const handleAddRow = () => {
        setCells((prevCells) => [
            ...prevCells,
            Array(prevCells[0]?.length || 15).fill('')
        ])
    }

    const handleAddColumn = () => {
        setCells((prevCells) =>
            prevCells.map((row) => [...row, ''])
        )
    }

    const handleFormulaChange = (value: string) => {
        if (!activeCell) {
            return
        }

        const newCells = cells.map((row) => [...row])
        newCells[activeCell.row][activeCell.col] = value
        setCells(newCells)
    }

    const columnToIndex = (col: string): number => {
        let index: number = 0
        for (let i = 0; i < col.length; i++) {
            index = index * 26 + (col.charCodeAt(i) - 64)            
        }
        return index - 1
    }

    const indexToColumn = (index: number): string => {
        let col: string = ''
        let i: number = index + 1

        while (i > 0) {
            const remainder = (i - 1) % 26
            col = `${String.fromCharCode(65 + remainder)}${col}`
            i = Math.floor((i - 1) / 26)
        }

        return col
    }

    const computeValue = (row: number, col: number, visited = new Set<string>()): string => {
        const key: string = `${row}-${col}`
        if (visited.has(key)) {
            return '#CYCLE!'
        }
        visited.add(key)

        const value = cells[row][col]
        if (!value.startsWith('=SUM(') || !value.endsWith(')')) {
            return value
        }

        const inside: string = value.slice(5, -1)
        const parts: string[] = inside.split(',')
        let sum: number = 0

        for (const partRaw of parts) {
            const part: string = partRaw.trim()

            if (part.includes(':')) {
                const [start, end] = part.split(':')

                const startMatch = start.match(/^([A-Z]+)(\d+)$/)
                const endMatch = end.match(/^([A-Z]+)(\d+)$/)

                if (!startMatch || !endMatch) {
                    continue
                }

                const startCol: number = columnToIndex(startMatch[1])
                const startRow: number = parseInt(startMatch[2]) - 1
                const endCol: number = columnToIndex(endMatch[1])
                const endRow: number = parseInt(endMatch[2]) - 1

                for (let row = startRow; row <= endRow; row++) {
                    for (let col = startCol; col <= endCol; col++) {
                        const evaluated: string = computeValue(row, col, new Set(visited))
                        if (evaluated === '#CYCLE!') {
                            return '#CYCLE!'
                        }

                        const num: number = parseFloat(evaluated || '0')
                        if (!isNaN(num)) {
                            sum += num
                        }
                    }
                }
            }
            else {
                if (/^-?\d+(\.\d+)?$/.test(part)) {
                    sum += parseFloat(part)
                    continue
                }

                const match = part.match(/^([A-Z]+)(\d+)$/)
                if (!match) {
                    continue
                }

                const colIndex: number = columnToIndex(match[1])
                const rowIndex: number = parseInt(match[2]) - 1

                const evaluated: string = computeValue(rowIndex, colIndex, new Set(visited))
                if (evaluated === '#CYCLE!') {
                    return '#CYCLE!'
                }

                const num: number = parseFloat(evaluated || '0')
                if (!isNaN(num)) {
                    sum += num
                }
            }
        }

        return sum.toString()
    }

    const handleSaveClick = () => {
        handleSave({
            ...document,
            name,
            cells,
            type: docType
        })
    }

    return (
        <div>
            <input
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
            />
            {
                id
                && handleDelete
                && <button onClick={() => handleDelete(id)}>
                    Delete
                </button>
            }
            <button onClick={() => navigate('/')}>
                Back to home
            </button>
            <button onClick={handleSaveClick}>
                Save
            </button>
            {
                message
                && <p style={{ color: 'green' }}>
                    {message}
                </p>
            }
            {
                errorMessage
                && <p style={{ color: 'red' }}>
                    {errorMessage}
                </p>
            }
            <div>
                <input
                    value={activeCell
                        ? cells[activeCell.row][activeCell.col]
                        : ''
                    }
                    onChange={(event) => handleFormulaChange(event.target.value)}
                />
            </div>
            <table
                style={{
                    borderCollapse: 'collapse'
                }}
            >
                <thead>
                    <tr>
                        <th></th>
                        {cells[0]?.map((_, colIndex) => (
                            <th key={colIndex}>
                                {indexToColumn(colIndex)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {cells.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <th>
                                {rowIndex + 1}
                            </th>
                            {row.map((_, colIndex) => (
                                <td
                                    key={colIndex}
                                    style={{
                                        border: '1px solid #ccc'
                                    }}
                                >
                                    <div
                                        onClick={() => setActiveCell({ row: rowIndex, col: colIndex })}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            minHeight: '35px',
                                            minWidth: '60px',
                                            boxSizing: 'border-box',
                                            padding: '4px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            outline:
                                                activeCell?.row === rowIndex &&
                                                activeCell?.col === colIndex
                                                    ? '2px solid blue'
                                                    : 'none'
                                        }}
                                    >
                                        {computeValue(rowIndex, colIndex)}
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={handleAddRow}>
                Add row
            </button>
            <button onClick={handleAddColumn}>
                Add column
            </button>
        </div>
    )
}

export default SpreadsheetDocumentEditor
