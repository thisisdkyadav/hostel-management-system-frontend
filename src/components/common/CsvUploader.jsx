import React, { useRef, useState } from "react"
import { FaFileUpload, FaTimes, FaFileDownload } from "react-icons/fa"
import Papa from "papaparse"

const CsvUploader = ({ onDataParsed, requiredFields, templateFileName, templateHeaders, maxRecords = 500, instructionText }) => {
  const [csvFile, setCsvFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== "text/csv") {
        setError("Please upload a valid CSV file")
        return
      }
      setCsvFile(file)
      parseCSV(file)
    }
  }

  const generateCsvTemplate = () => {
    const csvContent = templateHeaders.join(",")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", templateFileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      if (file.type !== "text/csv") {
        setError("Please upload a valid CSV file")
        return
      }
      setCsvFile(file)
      parseCSV(file)
    }
  }

  const parseCSV = (file) => {
    setIsLoading(true)
    setError("")

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (results.data.length > maxRecords) {
            setError(`Limited to ${maxRecords} records. Please reduce your data.`)
            setIsLoading(false)
            return
          }

          const headers = results.meta.fields
          const missingFields = requiredFields.filter((field) => !headers.includes(field))

          if (missingFields.length > 0) {
            setError(`Missing required fields: ${missingFields.join(", ")}`)
            setIsLoading(false)
            return
          }

          onDataParsed(results.data)
          setIsLoading(false)
        } catch (err) {
          setError("Failed to process CSV data. Please check the format.")
          setIsLoading(false)
        }
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`)
        setIsLoading(false)
      },
    })
  }

  const resetFile = () => {
    setCsvFile(null)
    setError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors" onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => fileInputRef.current.click()}>
        <FaFileUpload className="mx-auto h-10 w-10 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">Drag and drop a CSV file here, or click to select a file</p>
        <p className="mt-2 text-xs text-gray-500">
          <strong>Required fields:</strong> {requiredFields.join(", ")}
        </p>
        <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />
      </div>

      <div className="flex flex-col items-center">
        <button onClick={generateCsvTemplate} className="flex items-center text-sm text-blue-600 hover:text-blue-800">
          <FaFileDownload className="mr-1" />
          Download CSV Template
        </button>

        {instructionText && <div className="text-xs text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg w-full">{instructionText}</div>}
      </div>

      {csvFile && (
        <div className="py-2 px-4 bg-blue-50 rounded-lg flex items-center justify-between">
          <span className="text-sm text-blue-700">
            Selected file: <span className="font-medium">{csvFile.name}</span>
          </span>
          <button onClick={(e) => {
              e.stopPropagation()
              resetFile()
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {error && <div className="py-2 px-4 bg-red-50 text-red-600 rounded-lg border-l-4 border-red-500">{error}</div>}

      {isLoading && (
        <div className="flex items-center justify-center py-3">
          <div className="w-5 h-5 border-2 border-t-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="ml-2 text-sm text-gray-600">Processing file...</span>
        </div>
      )}
    </div>
  )
}

export default CsvUploader
