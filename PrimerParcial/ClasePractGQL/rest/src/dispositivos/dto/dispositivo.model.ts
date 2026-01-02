import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DispositivoModel {
  @Field(() => ID)
  id: string;

  @Field()
  nombre: string;

  @Field()
  tipo: string;
}
