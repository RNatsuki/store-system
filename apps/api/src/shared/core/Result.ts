

/*

    @description: Esta clase Result es una implementación genérica de un patrón de resultado que se utiliza para manejar operaciones que pueden tener éxito o fallar. Permite encapsular tanto el valor de éxito como el error en un solo objeto, lo que facilita la gestión de errores y la composición de operaciones encadenadas sin necesidad de lanzar excepciones.

    @typeParam T - El tipo del valor de éxito.
    @typeParam E - El tipo del error.

    @remarks
    - La clase incluye métodos para crear resultados exitosos y fallidos, así como para mapear y encadenar operaciones.
    - Se utiliza en los servicios para devolver resultados que pueden ser manejados de manera uniforme en los controladores, evitando la necesidad de manejar excepciones directamente.
*/
export class Result<T, E> {
  public isSuccess: boolean;
  private value?: T;
  private error?: E;

  private constructor(isSuccess: boolean, value?: T, error?: E) {
    this.isSuccess = isSuccess;
    this.value = value;
    this.error = error;
  }

  public static ok<T, E>(value: T): Result<T, E> {
    return new Result<T, E>(true, value);
  }

  public static fail<T, E>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  public get isFailure(): boolean {
    return !this.isSuccess;
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error("Cannot get the value of an error result.");
    }
    return this.value as T;
  }

  public getError(): E {
    if (this.isSuccess) {
      throw new Error("Cannot get the error of a successful result.");
    }
    return this.error as E;
  }

  public map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isSuccess) {
      return Result.ok<U, E>(fn(this.value as T));
    } else {
      return Result.fail<U, E>(this.error as E);
    }
  }

  public mapError<F>(fn: (error: E) => F): Result<T, F> {
    if (this.isSuccess) {
      return Result.ok<T, F>(this.value as T);
    } else {
      return Result.fail<T, F>(fn(this.error as E));
    }
  }

  public flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isSuccess) {
      return fn(this.value as T);
    } else {
      return Result.fail<U, E>(this.error as E);
    }
  }

  public fold<U>(onSuccess: (value: T) => U, onFailure: (error: E) => U): U {
    if (this.isSuccess) {
      return onSuccess(this.value as T);
    } else {
      return onFailure(this.error as E);
    }
  }
}

/*
    Esto debería ir en un archivo aparte, pero lo pongo aquí para no crear más archivos (al chile... Me da hueva).
    Es una clase de error personalizada que incluye un código de estado HTTP para facilitar la gestión de errores en los controladores y servicios.
*/
export class AppError extends Error {
  public code: number;

  constructor(message: string, code: number) {
    super(message);
    this.code = code;
    // Esto es necesario para que instanceof funcione correctamente con clases personalizadas en TypeScript en versiones anteriores a ES2015.
    //Creo que no hace falta en las versiones modernas, pero lo dejo por compatibilidad. :)
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
