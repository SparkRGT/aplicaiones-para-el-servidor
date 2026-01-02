import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ClienteModel {
  @Field(() => ID)
  id: string;

  @Field()
  nombre: string;

  @Field()
  correo: string;
}
