import type { IDocument } from '../types/types'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const SharedSpreadsheetDocumentPage = () => {
    const [document, setDocument] = useState<IDocument | undefined>(undefined)
    const [error, setError] = useState<string>('')
    const [cells, setCells] = useState<string[][]>(
        Array.from({ length: 15 }, () => Array.from({ length: 15 }, () => ''))
    )
    const [activeCell, setActiveCell] = useState<{ row: number, col: number } | null>(null)

    const navigate = useNavigate()
    const { viewToken } = useParams()

    // Fetch shared spreadsheet document using viewToken when component mounts or token changes
    useEffect(() => {
        if (!viewToken) {
            return
        }

        const fetchDoc = async () => {
            try {
                const response: Response = await fetch(`http://localhost:9000/api/spreadsheetdocuments/${viewToken}/view`)
                
                const data = await response.json()
                if (!response.ok) {
                    throw new Error(data.error || 'Error fetching text document')
                }

                setDocument(data)
            } catch (err: any) {
                setError(err.message)
            }
        }

        fetchDoc()
    }, [viewToken])

    // Update cells state when document changes
    useEffect(() => {
        setCells(
            document?.cells
            ?? Array.from({ length: 15 }, () => Array.from({ length: 15 }, () => ''))
        )
    }, [document])

    // Convert column letters (e.g., "A", "AB") to numeric index
    const columnToIndex = (col: string): number => {
        let index: number = 0
        for (let i = 0; i < col.length; i++) {
            index = index * 26 + (col.charCodeAt(i) - 64)            
        }
        return index - 1
    }

    // Convert numeric index to column letters (e.g., 0 -> "A", 27 -> "AB")
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

    // Compute value of a cell, handling SUM formulas and cycle detection
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

    // Render error if fetching failed
    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>
    }

    // Render loading text while document is being fetched
    if (!document) {
        return <p>Loading...</p>
    }

    // Render spreadsheet table and active cell
    return (
        <div>
            <button onClick={() => navigate('/')}>
                Back to home
            </button>
            <div>
                <p>
                    {document.name}
                </p>
            </div>
            <div>
                <div
                    style={{
                        display: 'inline-flex',
                        minHeight: '35px',
                        minWidth: '60px',
                        padding: '4px',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {activeCell ? (cells[activeCell.row][activeCell.col] || '\u00A0') : '\u00A0'}
                </div>
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
                                        border: '1px solid #cccccc'
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
        </div>
    )
}

export default SharedSpreadsheetDocumentPage
