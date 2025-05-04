import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, User, Monitor } from "lucide-react"

interface UserDetailsProps {
  user: any
}

export function UserDetails({ user }: UserDetailsProps) {
  // Formatear fecha desde timestamp
  const formatDate = (seconds: number) => {
    const date = new Date(seconds * 1000)
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="p-6 bg-muted/30">
      <Tabs defaultValue="info">
        <TabsList className="mb-4">
          <TabsTrigger value="info">Información Personal</TabsTrigger>
          <TabsTrigger value="shipping">Datos de Envío</TabsTrigger>
          <TabsTrigger value="technical">Datos Técnicos</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
              <CardDescription>Datos personales del usuario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Nombre Completo</h3>
                  <p className="text-base">
                    {user.name} {user.apellido}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                  <p className="text-base">{user.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Teléfono</h3>
                  <p className="text-base">{user.telefono}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">DNI</h3>
                  <p className="text-base">{user.dni}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Rol</h3>
                  <p className="text-base capitalize">{user.roll}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Fecha de Registro</h3>
                  <p className="text-base">{formatDate(user.fechaInicio._seconds)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Datos de Envío
              </CardTitle>
              <CardDescription>Información de envío y dirección</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Calle</h3>
                  <p className="text-base">{user.datosEnvio.calle}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Número</h3>
                  <p className="text-base">{user.datosEnvio.numero}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Piso/Dpto</h3>
                  <p className="text-base">{user.datosEnvio.pisoDpto || "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Código Postal</h3>
                  <p className="text-base">{user.datosEnvio.codigoPostal || "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Barrio</h3>
                  <p className="text-base">{user.datosEnvio.barrio || "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Ciudad</h3>
                  <p className="text-base">{user.datosEnvio.ciudad}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Estado/Provincia</h3>
                  <p className="text-base">{user.datosEnvio.estado}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Email de Contacto</h3>
                  <p className="text-base">{user.datosEnvio.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Teléfono de Contacto</h3>
                  <p className="text-base">{user.datosEnvio.telefono}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Datos Técnicos
              </CardTitle>
              <CardDescription>Información técnica del usuario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">ID de Usuario</h3>
                  <p className="text-base font-mono text-xs bg-muted p-2 rounded">{user.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">User Agent</h3>
                  <p className="text-base font-mono text-xs bg-muted p-2 rounded break-words">{user.userAgent}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Timestamp</h3>
                  <p className="text-base font-mono text-xs bg-muted p-2 rounded">
                    {user.fechaInicio._seconds} segundos, {user.fechaInicio._nanoseconds} nanosegundos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
