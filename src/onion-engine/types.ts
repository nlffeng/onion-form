import { Schema, ElementId } from '../common-types'

export type Plugins = Array<[
  string,
  (apis: Apis) => void,
]>

export interface Apis {
  injectSchemaMiddleware: (callback: MiddlewareCallback) => void;
  injectElementCallback: (
    elementId: ElementId,
    name: string,
    callback: (...args: any[]) => void
  ) => void;
  updateSchema: (schema: Schema) => void
  getSchema: () => Promise<Schema | undefined>
}

export type MiddlewareCallback = (
  prevSchema: Schema,
  next?: (nextSchema: Schema) => Promise<Schema>
) => Promise<Schema>

export interface Update {
  action: any,
  next: null | Update,
}
