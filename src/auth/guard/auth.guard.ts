import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
/** se llama al metodo AuthGuard si todo esta bien deja pasar a la sigueinte solicitud desde donde lo llaman */
export class AuthGuard implements CanActivate {

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest();

    /** llamamos a lla funcion que extrae el token para chequear si esta vacio */
    const token = this.extractTokenFromHeader(request);

    /** si el token esta vacio enviamos un error y no se continua ejecutando 
     * el codigo
     */
    if (!token) {
      throw new UnauthorizedException();
    }
    /** si existe TOKEN */

    try { /** esto verifica que el token sea el mismo de la palabra secreta si no es igual pasa al CATCH */
      const secretWord = this.configService.get<string>('SECRET_WORD');
      const payload = await this.jwtService.verifyAsync(
        token, {
        secret: secretWord
      }
      );
      /** si el token es valido le agfregamos el usuario */
      request.user = payload; /** al request se le puede agregar informacion, va  atener una propiedad nueva
llamada user */

    } catch {
      throw new UnauthorizedException();
    }
    /** no es necesario hacer return false, porque los 2 throw new se encargan de detener la ejecucion */
    return true;
  }
  /** Esta es una función privada llamada extractTokenFromHeader que toma un objeto Request como argumento 
   * y devuelve una cadena (string) o undefined. */
  private extractTokenFromHeader(request: Request): string | undefined {

    /** Aquí, se desestructura la cabecera Authorization de la solicitud HTTP. Se asume que la cabecera de 
     * autorización está en el formato "Bearer token", donde "Bearer" es el tipo de token y 
     * "token" es el token real.
Se utiliza el operador de encadenamiento opcional (?.) para manejar el caso en que la cabecera de 
autorización no esté presente en la solicitud. Si la cabecera de autorización no está presente, 
la expresión se evalúa como undefined.
La función split(' ') divide la cadena de la cabecera de autorización en dos partes:
 el tipo de token y el token real.
Si la cabecera de autorización no está presente o no tiene un formato válido, 
se establece type y token en un arreglo vacío. */
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    /** Finalmente, se verifica si type es igual a "Bearer". Si es así, se devuelve token, 
     * que contiene el token real. De lo contrario, se devuelve undefined, 
     * lo que indica que no se encontró un token válido en la cabecera de autorización. */
    return type === 'Bearer' ? token : undefined;
  }
}
/** canActive#
El método canActivate es uno de los métodos principales que un guard puede implementar. 
Este método se ejecuta antes de que se procese una solicitud hacia una ruta o endpoint específico. 
La función canActivate devuelve un valor booleano o una promesa que resuelve a un valor booleano. 
Dependiendo del resultado de esta función, se permitirá o se denegará el acceso al endpoint protegido.
Si el método canActivate devuelve true, 
la solicitud se permite y continúa el flujo normal hacia el controlador asociado con la ruta.
Si el método canActivate devuelve false, se niega el acceso a la ruta protegida y la solicitud se detiene. 
En este caso, el guard puede tomar acciones como redirigir a una página de inicio de sesión o 
enviar una respuesta de error, según el caso.  */