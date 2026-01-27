// Export all types from here
export * from './user';
export * from './product';


export type ID = string | number;

export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}
