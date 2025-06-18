# api/authentication.py
from rest_framework import authentication, exceptions
from django.conf import settings
from jose import jwt
import requests

class Auth0Authentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = authentication.get_authorization_header(request).split()

        if not auth_header or auth_header[0].lower() != b'bearer':
            return None

        if len(auth_header) == 1:
            raise exceptions.AuthenticationFailed('Invalid token header. No credentials provided.')
        elif len(auth_header) > 2:
            raise exceptions.AuthenticationFailed('Invalid token header. Token string should not contain spaces.')

        token = auth_header[1]
        try:
            payload = self.validate_token(token)
        except jwt.JWTError as e:
            raise exceptions.AuthenticationFailed(str(e))

        # Aquí puedes agregar la lógica para obtener o crear tu usuario local
        # basado en el `sub` del payload. Por ahora, devolvemos un usuario anónimo.
        return (None, payload)

    def validate_token(self, token):
        domain = settings.AUTH0_DOMAIN
        audience = settings.AUTH0_API_IDENTIFIER

        jwks_url = f'https://{domain}/.well-known/jwks.json'
        jwks = requests.get(jwks_url).json()

        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        for key in jwks['keys']:
            if key['kid'] == unverified_header['kid']:
                rsa_key = {
                    'kty': key['kty'],
                    'kid': key['kid'],
                    'use': key['use'],
                    'n': key['n'],
                    'e': key['e']
                }
        if rsa_key:
            try:
                payload = jwt.decode(
                    token,
                    rsa_key,
                    algorithms=['RS256'],
                    audience=audience,
                    issuer=f'https://{domain}/'
                )
                return payload
            except jwt.ExpiredSignatureError:
                raise exceptions.AuthenticationFailed('Token has expired.')
            except jwt.JWTClaimsError:
                raise exceptions.AuthenticationFailed('Incorrect claims, please check the audience and issuer.')
            except Exception:
                raise exceptions.AuthenticationFailed('Unable to parse authentication token.')

        raise exceptions.AuthenticationFailed('Unable to find appropriate key.')