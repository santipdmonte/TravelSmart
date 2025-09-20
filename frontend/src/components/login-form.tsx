"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
 
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail } from "lucide-react"
import { requestMagicLink } from "@/lib/authApi"
import { ROOT_BASE_URL } from "@/lib/config"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)
  const [sentToEmail, setSentToEmail] = useState<string>("")
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [cardMinHeight, setCardMinHeight] = useState<number | null>(null)

  useEffect(() => {
    if (!successOpen && cardRef.current) {
      setCardMinHeight(cardRef.current.offsetHeight)
    }
  }, [successOpen, isGoogleLoading, isLoading, error, email])

  useEffect(() => {
    function handleResize() {
      if (!successOpen && cardRef.current) {
        setCardMinHeight(cardRef.current.offsetHeight)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [successOpen])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await requestMagicLink(email)
      if (res.error) {
        setError(res.error)
      } else {
        setSentToEmail(res.data?.email || email)
        setSuccessOpen(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card ref={cardRef} style={cardMinHeight ? { minHeight: cardMinHeight } : undefined}>
        {!successOpen && (
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Bienvenido de nuevo</CardTitle>
            <CardDescription>
              Inicia sesión con Google o con tu email
            </CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="min-h-[280px]">
            {successOpen ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <h3 className="text-xl font-semibold mb-4">Revisa tu correo</h3>
                <div className="mb-8">
                  <div className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                    <Mail className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Te enviamos un enlace de acceso a <span className="font-medium text-foreground">{sentToEmail}</span>.
                    Abre tu correo y sigue el enlace para iniciar sesión.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setSuccessOpen(false)}>Volver a Iniciar sesión</Button>
              </div>
            ) : (
              <>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-6">
                    <div className="flex flex-col gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={isGoogleLoading}
                        onClick={() => {
                          setIsGoogleLoading(true)
                          window.location.href = `${ROOT_BASE_URL}/auth/google/login`
                        }}
                      >
                        {isGoogleLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2">
                          <path
                            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                            fill="currentColor"
                          />
                        </svg>
                        )}
                        Continuar con Google
                      </Button>
                    </div>
                    <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                      <span className="bg-card text-muted-foreground relative z-10 px-2">
                        O continuar con
                      </span>
                    </div>
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="tu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          "Enviar enlace a mi email"
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Al continuar, aceptas nuestros <a href="#">Términos de servicio</a>{" "}
        y nuestra <a href="#">Política de privacidad</a>.
      </div>
    </div>
  )
}
