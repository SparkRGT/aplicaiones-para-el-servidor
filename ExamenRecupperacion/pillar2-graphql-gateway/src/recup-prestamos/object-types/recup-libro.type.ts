import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType({ description: 'Entidad Maestra - Libro' })
export class RecupLibro {
  @Field(() => Int, { description: 'PK, autoincrement' })
  libroId: number;

  @Field({ description: 'ISBN único del libro' })
  recup_isbn: string;

  @Field({ description: 'Título del libro' })
  recup_titulo: string;

  @Field({ description: 'Autor del libro' })
  recup_autor: string;

  @Field({ description: 'Categoría temática' })
  recup_categoria: string;

  @Field({ description: 'Estado de disponibilidad' })
  recup_disponible: boolean;
}
