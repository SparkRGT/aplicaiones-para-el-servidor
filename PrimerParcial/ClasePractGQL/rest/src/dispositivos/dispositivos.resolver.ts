import { Resolver, Query, Args } from '@nestjs/graphql';
import { DispositivosService } from './dispositivos.service';
import { DispositivoModel } from './dto/dispositivo.model';

@Resolver(() => DispositivoModel)
export class DispositivosResolver {
  constructor(private readonly service: DispositivosService) {}

  @Query(() => [DispositivoModel])
  dispositivos() {
    return this.service.findAll();
  }

  @Query(() => DispositivoModel, { nullable: true })
  dispositivo(@Args('id') id: string) {
    return this.service.findOne(id);
  }
}
