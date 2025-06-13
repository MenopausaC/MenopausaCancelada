// app/test-estilo/page.tsx
export default function TesteEstiloPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-10">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-center text-2xl font-bold text-purple-700">Teste de Estilo</h1>
        <p className="mb-6 text-center text-gray-600">
          Se você está vendo esta caixa com fundo branco, bordas arredondadas, sombra e texto roxo, então o Tailwind CSS
          está funcionando corretamente.
        </p>
        <button className="w-full rounded-md bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700">
          Botão de Teste
        </button>
      </div>
    </div>
  )
}
