import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { ClientesService } from './clientes.service';
import { ClienteModel } from './dto/cliente.model';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
class CreateClienteInput {
  @Field()
  nombre: string;

  @Field()
  correo: string;
}

@InputType()
class UpdateClienteInput {
  @Field({ nullable: true })
  nombre?: string;

  @Field({ nullable: true })
  correo?: string;
}

@Resolver(() => ClienteModel)
export class ClientesResolver {
  constructor(private readonly service: ClientesService) {}

  @Query(() => [ClienteModel])
  clientes() {
    return this.service.findAll();
  }

  @Query(() => ClienteModel, { nullable: true })
  cliente(@Args('id') id: string) {
    return this.service.findOne(id);
  }

  @Mutation(() => ClienteModel)
  createCliente(@Args('input') input: CreateClienteInput) {
    return this.service.create(input as any);
  }

  @Mutation(() => ClienteModel, { nullable: true })
  updateCliente(@Args('id') id: string, @Args('input') input: UpdateClienteInput) {
    return this.service.update(id, input as any);
  }

  @Mutation(() => ClienteModel, { nullable: true })
  removeCliente(@Args('id') id: string) {
    return this.service.remove(id);
  }
}
