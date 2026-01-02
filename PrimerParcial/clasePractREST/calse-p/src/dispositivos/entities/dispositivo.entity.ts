import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Dispositivo {
    @PrimaryGeneratedColumn('uuid')
    id: number;
    @Column()
    nombre: string
    @Column()
    valor: number;
    @Column()
    tipo: string;

}
