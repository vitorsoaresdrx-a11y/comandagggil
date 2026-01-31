export default function EnvTest() {
  return (
    <div>
      <p>URL: {import.meta.env.VITE_SUPABASE_URL}</p>
      <p>KEY: {import.meta.env.VITE_SUPABASE_KEY ? "OK" : "VAZIA"}</p>
    </div>
  )
}
