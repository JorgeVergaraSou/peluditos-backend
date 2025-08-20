// src/productos/entities/producto.entity.ts
import { CategoriasEnum } from 'src/common/enums/categorias.enum';
import { EdadEnum } from 'src/common/enums/edad.enum';
import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('productos')
export class ProductoEntity {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, name: 'id_producto' })
  idProducto: number;

  @Column({ type: 'varchar', length: 300, unique: true, nullable: false, name: 'nombre' })
  nombre: string;

  @Column({ type: 'mediumtext', nullable: true, name: 'descripcion' })
  descripcion: string;

  @Column({ type: 'int', nullable: false, name: 'precio' })
  precio: number;

  @Column({ type: 'varchar', nullable: true, name: 'imagen' })
  imagen: string;

  /*@Column('int', { default: 0 })
  stock: number;*/

  @Column({ type: 'enum', enum: CategoriasEnum, nullable: false, name: 'categoria' })
  categoria: CategoriasEnum;

  @Column({ type: 'enum', enum: EdadEnum, nullable: false, name: 'edad' })
  edad: EdadEnum;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
