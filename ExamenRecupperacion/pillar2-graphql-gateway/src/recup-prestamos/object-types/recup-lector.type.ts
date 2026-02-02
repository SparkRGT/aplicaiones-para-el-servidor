import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType({ description: 'Entidad Maestra - Lector' })
export class RecupLector {
  @Field(() => Int, { description: 'PK, autoincrement' })
  lectorId: number;

  @Field({ description: 'Número de carnet único' })
  recup_carnet: string;

  @Field({ description: 'Nombre completo' })
  recup_nombreCompleto: string;

  @Field({ description: 'Tipo (ESTUDIANTE, DOCENTE, EXTERNO)' })
  recup_tipoLector: string;

  @Field({ description: 'Teléfono de contacto' })
  recup_telefono: string;

  @Field({ description: 'Correo electrónico' })
  recup_email: string;
}
