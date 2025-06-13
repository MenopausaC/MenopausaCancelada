import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import ForceMetrics from "@/components/force-metrics"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Menopausa Cancelada",
  description: "Avaliação Nutricional para Menopausa",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <ForceMetrics />
      </body>
    </html>
  )
}
