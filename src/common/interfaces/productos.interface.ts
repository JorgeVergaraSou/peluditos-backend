import { ProductoEntity } from "src/productos/entities/producto.entity";
import { promiseInterface } from "./promise.interface";

export interface ProductoSingleInterfacePromise extends promiseInterface{
    producto?: ProductoEntity
}

export interface ProductosMultiInterfacePromise extends promiseInterface{
    productos?: ProductoEntity[]
}