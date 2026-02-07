/**
 * Represents the result of an operation that can either succeed or fail.
 *
 * The `Result` type is used to model **expected failures** explicitly,
 * avoiding exceptions for normal control flow and making error handling
 * predictable and type-safe.
 *
 * A `Result` instance is always in one of two states:
 * - **Success**: contains a value of type `T`
 * - **Failure**: contains an error of type `E`
 *
 * @typeParam T - Type of the value returned on success.
 * @typeParam E - Type of the error returned on failure.
 *
 * @remarks
 * ### Creation
 * - Use {@link Result.ok} to create a successful result.
 * - Use {@link Result.fail} to create a failed result.
 *
 * ### Working with Result
 * - {@link map} to transform the success value.
 * - {@link mapError} to transform the error.
 * - {@link flatMap} to chain operations that also return a `Result`.
 * - {@link fold} to handle both success and failure and produce a final value.
 *
 * ### When to use
 * - Business rules and domain logic
 * - Validation flows
 * - Application services
 *
 * Avoid using `Result` for truly exceptional situations
 * (e.g. system crashes, programming errors).
 *
 * @example
 * ```ts
 * const result = Result.ok<number, string>(42);
 *
 * result.fold(
 *   value => console.log("Success:", value),
 *   error => console.error("Error:", error)
 * );
 * ```
 *
 * @example
 * ```ts
 * const result = Result.fail<number, string>("Invalid input");
 *
 * const message = result.fold(
 *   value => `Value is ${value}`,
 *   error => `Failed with error: ${error}`
 * );
 *
 * console.log(message);
 * ```
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

  /**
 * Creates a successful `Result` containing the given value.
 *
 * @param value - The success value.
 * @returns A `Result` in the success state.
 *
 * @example
 * ```ts
 * const result = Result.ok<number, string>(10);
 * ```
 */
  public static ok<T, E>(value: T): Result<T, E> {
    return new Result<T, E>(true, value);
  }

  /**
 * Creates a failed `Result` containing the given error.
 *
 * @param error - The error value.
 * @returns A `Result` in the failure state.
 *
 * @example
 * ```ts
 * const result = Result.fail<number, string>("Something went wrong");
 * ```
 */
  public static fail<T, E>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  /**
   * Indicates whether the result is a failure.
   *
   * @returns `true` if the result is a failure, otherwise `false`.
   */
  public get isFailure(): boolean {
    return !this.isSuccess;
  }

  /**
   * Gets the success value if the result is successful.
   *
   * @returns The success value.
   * @throws If the result is a failure.
   */
  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error("Cannot get the value of an error result.");
    }
    return this.value as T;
  }
  /**
   * Gets the error value if the result is a failure.
   *
   * @returns The error value.
   * @throws If the result is a success.
   */
  public getError(): E {
    if (this.isSuccess) {
      throw new Error("Cannot get the error of a successful result.");
    }
    return this.error as E;
  }


  /**
 * Transforms the success value using the provided function.
 *
 * If the `Result` is a failure, the error is returned unchanged.
 *
 * @typeParam U - The type of the transformed value.
 * @param fn - Function to apply to the success value.
 * @returns A new `Result` with the transformed value or the original error.
 *
 * @example
 * ```ts
 * Result.ok(5).map(x => x * 2); // Ok(10)
 * ```
 */
  public map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isSuccess) {
      return Result.ok<U, E>(fn(this.value as T));
    } else {
      return Result.fail<U, E>(this.error as E);
    }
  }
  /**
 * Transforms the error value using the provided function.
 *
 * If the `Result` is a success, the value is returned unchanged.
 *
 * @typeParam F - The type of the transformed error.
 * @param fn - Function to apply to the error value.
 * @returns A new `Result` with the transformed error or the original value.
 *
 * @example
 * ```ts
 * Result.fail<number, string>("Error").mapError(err => `Mapped: ${err}`); // Fail("Mapped: Error")
 * ```
 */
  public mapError<F>(fn: (error: E) => F): Result<T, F> {
    if (this.isSuccess) {
      return Result.ok<T, F>(this.value as T);
    } else {
      return Result.fail<T, F>(fn(this.error as E));
    }
  }

  /**
 * Chains another operation that returns a `Result`.
 *
 * This is useful for composing multiple operations that may fail
 * without nesting `Result` instances.
 *
 * @typeParam U - The type of the next success value.
 * @param fn - Function that returns a new `Result`.
 * @returns The result of the chained operation.
 *
 * @example
 * ```ts
 * Result.ok("10")
 *   .flatMap(parseNumber)
 *   .flatMap(double);
 * ```
 */
  public flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isSuccess) {
      return fn(this.value as T);
    } else {
      return Result.fail<U, E>(this.error as E);
    }
  }

  /**
 * Resolves the `Result` by handling both success and failure cases.
 *
 * `fold` is typically used at the boundaries of the application
 * (e.g. controllers, UI, CLI) to convert a `Result` into a final value.
 *
 * @typeParam U - The return type of both handlers.
 * @param onSuccess - Function executed if the result is successful.
 * @param onFailure - Function executed if the result is a failure.
 * @returns A value of type `U`.
 *
 * @example
 * ```ts
 * const response = result.fold(
 *   value => ({ status: 200, body: value }),
 *   error => ({ status: 400, body: error })
 * );
 * ```
 */
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
