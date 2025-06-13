import DebugWebhook from "@/components/debug-webhook"

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Debug do Sistema</h1>
        <DebugWebhook />
      </div>
    </div>
  )
}
