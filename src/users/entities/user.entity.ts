import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Role } from "../../common/enums/role.enum";

@Entity('users')
export class UserEntity {

    @PrimaryGeneratedColumn({ type: 'int', unsigned: true, name: 'id_user' })
    idUser: number;

    @Column({ length: 60, nullable: false, name: 'nombre' })
    nombre: string;

    @Column({ length: 60, nullable: false, name: 'apellido' })
    apellido: string;

    /** ES UNICO Y NO PUEDE SER NULO */
    @Column({ unique: true, nullable: false, name: 'email' })
    email: string;
    /** el select: false, es para que el campo password no sea seleccionado en cualquier pedido */
    @Column({ nullable: false, select: false, name: 'password' })
    password: string;

    @Column({ type: 'uuid', unique: true, nullable: true, name: 'reset_password_token' })
    resetPasswordToken: string;

    @Column({ nullable: true, name: 'image_file' })
    imageFile: string;

    @Column({ type: 'enum', enum: Role, name: 'role' })
    role: Role;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

}