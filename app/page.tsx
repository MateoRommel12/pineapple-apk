import Link from "next/link"
import { ArrowRight, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import PineappleUploader from "@/components/pineapple-uploader"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span className="text-yellow-500">🍍</span> Pineapple Sweetness Predictor
          </div>
          <nav className="flex items-center gap-4">
            <Link href="#how-it-works" className="text-sm font-medium hover:underline">
              How It Works
            </Link>
            <Link href="#about" className="text-sm font-medium hover:underline">
              About
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="container py-12 md:py-24 lg:py-32">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-8 text-center">
            <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
              Predict Pineapple Sweetness <br />
              <span className="text-yellow-500">Using AI</span>
            </h1>
            <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
              Our advanced machine learning algorithm analyzes pineapple images to predict sweetness levels. Simply
              upload a photo of your pineapple and get instant results.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-3xl">
            <PineappleUploader />
          </div>
        </section>
        <section id="how-it-works" className="container py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="text-muted-foreground">
                Our AI-powered system uses computer vision and machine learning to analyze visual characteristics of
                pineapples that correlate with sweetness.
              </p>
              <ul className="mt-4 grid gap-4">
                <li className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold">Image Processing</h3>
                    <p className="text-sm text-muted-foreground">
                      We analyze color patterns, texture, and external features of the pineapple.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold">Feature Extraction</h3>
                    <p className="text-sm text-muted-foreground">
                      Our algorithm extracts key visual indicators that correlate with sugar content.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold">Prediction Model</h3>
                    <p className="text-sm text-muted-foreground">
                      A trained neural network predicts sweetness based on thousands of analyzed samples.
                    </p>
                  </div>
                </li>
              </ul>
              <Button variant="outline" className="mt-4 w-fit">
                Learn more about our technology <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="rounded-lg border bg-background p-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold">Accuracy Information</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Our prediction model has been trained on over 10,000 pineapple samples with verified sweetness levels.
                  The current model achieves 85% accuracy in predicting sweetness categories.
                </p>
                <div className="mt-4 grid gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Very Sweet</span>
                    <div className="h-2 w-32 rounded-full bg-muted">
                      <div className="h-2 w-[90%] rounded-full bg-yellow-500"></div>
                    </div>
                    <span className="text-sm">90%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medium Sweet</span>
                    <div className="h-2 w-32 rounded-full bg-muted">
                      <div className="h-2 w-[85%] rounded-full bg-yellow-500"></div>
                    </div>
                    <span className="text-sm">85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Less Sweet</span>
                    <div className="h-2 w-32 rounded-full bg-muted">
                      <div className="h-2 w-[80%] rounded-full bg-yellow-500"></div>
                    </div>
                    <span className="text-sm">80%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="about" className="container py-12 md:py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">About The Project</h2>
            <p className="mt-4 text-muted-foreground">
              This project combines computer vision and machine learning to help consumers and farmers identify sweet
              pineapples without cutting them open. Our technology aims to reduce food waste and improve consumer
              satisfaction.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button>Contact Us</Button>
              <Button variant="outline">View Research Paper</Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">© 2025 Pineapple Sweetness Predictor. All rights reserved.</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

