import { redirect } from "next/navigation"

export default function AdminPage() {
  // Redirecionar para a página principal que agora mostra o dashboard por padrão
  redirect("/")
}
