"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Camera, FileUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function PineappleUploader() {
  const [image, setImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<{
    sweetness: number
    confidence: number
    category: string
  } | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
        setResult(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = () => {
    setIsAnalyzing(true)
    // Simulate API call to ML model
    setTimeout(() => {
      setResult({
        sweetness: 8.7,
        confidence: 92,
        category: "Very Sweet",
      })
      setIsAnalyzing(false)
    }, 2500)
  }

  const resetUploader = () => {
    setImage(null)
    setResult(null)
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        {!image ? (
          <div className="flex flex-col items-center">
            <div className="mb-8 flex flex-col items-center justify-center">
              <div className="mb-4 rounded-full bg-yellow-100 p-3">
                <Camera className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold">Upload Pineapple Image</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Take a clear photo of the whole pineapple for the best results
              </p>
            </div>
            <div className="grid w-full gap-4">
              <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
                <div className="flex flex-col items-center gap-2">
                  <FileUp className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Drag and drop or click to upload</p>
                  <p className="text-xs text-muted-foreground">Supports JPG, PNG, WEBP (max 10MB)</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute h-full w-full cursor-pointer opacity-0"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
              <div className="text-center text-xs text-muted-foreground">
                By uploading an image, you agree to our Terms of Service
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col items-center justify-center">
              <div className="relative aspect-square w-full max-w-[300px] overflow-hidden rounded-lg">
                <Image src={image || "/placeholder.svg"} alt="Uploaded pineapple" fill className="object-cover" />
              </div>
              <Button variant="outline" size="sm" className="mt-4" onClick={resetUploader}>
                Upload a different image
              </Button>
            </div>
            <div className="flex flex-col justify-center">
              {isAnalyzing ? (
                <div className="flex flex-col items-center gap-4 py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                  <div className="text-center">
                    <h3 className="font-semibold">Analyzing your pineapple...</h3>
                    <p className="text-sm text-muted-foreground">Our AI is examining visual characteristics</p>
                  </div>
                  <Progress value={65} className="w-full max-w-[250px]" />
                </div>
              ) : result ? (
                <div className="flex flex-col gap-6">
                  <div className="rounded-lg bg-yellow-50 p-6 text-center">
                    <h3 className="text-2xl font-bold text-yellow-700">{result.category}</h3>
                    <div className="mt-2 text-sm text-yellow-600">Sweetness score: {result.sweetness}/10</div>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Confidence:</span>
                      <div className="h-2 w-full rounded-full bg-yellow-200">
                        <div
                          className="h-2 rounded-full bg-yellow-500"
                          style={{ width: `${result.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{result.confidence}%</span>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium">Characteristics Detected:</h4>
                    <ul className="mt-2 grid gap-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span>Optimal yellow-to-green ratio</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span>Healthy frond appearance</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                        <span>Medium-sized "eyes"</span>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-8">
                  <h3 className="text-xl font-semibold">Ready to Analyze</h3>
                  <p className="text-center text-sm text-muted-foreground">
                    Click the button below to analyze your pineapple and predict its sweetness
                  </p>
                  <Button size="lg" className="mt-2 bg-yellow-500 hover:bg-yellow-600" onClick={analyzeImage}>
                    Analyze Pineapple
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

