import { AsyncLocalStorage } from 'async_hooks';
import type { EntityManager } from '../EntityManager';

/**
 * Uses `AsyncLocalStorage` to create async context that holds current EM fork.
 */
export class RequestContext {

  private static storage = new AsyncLocalStorage<RequestContext>();
  private static counter = 1;
  readonly id = RequestContext.counter++;

  constructor(readonly map: Map<string, EntityManager>) { }

  /**
   * Returns default EntityManager.
   */
  get em(): EntityManager | undefined {
    return this.map.get('default');
  }

  /**
   * Creates new RequestContext instance and runs the code inside its domain.
   */
  static create(em: EntityManager | EntityManager[], next: (...args: any[]) => void): void {
    const ctx = this.createContext(em);
    this.storage.run(ctx, next);
  }

  /**
   * Creates new RequestContext instance and runs the code inside its domain.
   * Async variant, when the `next` handler needs to be awaited (like in Koa).
   */
  static async createAsync<T>(em: EntityManager | EntityManager[], next: (...args: any[]) => Promise<T>): Promise<T> {
    const ctx = this.createContext(em);
    return this.storage.run(ctx, next);
  }

  /**
   * Returns current RequestContext (if available).
   */
  static currentRequestContext(): RequestContext | undefined {
    return this.storage.getStore();
  }

  /**
   * Returns current EntityManager (if available).
   */
  static getEntityManager(name = 'default'): EntityManager | undefined {
    const context = RequestContext.currentRequestContext();
    return context ? context.map.get(name) : undefined;
  }

  private static createContext(em: EntityManager | EntityManager[]): RequestContext {
    const forks = new Map<string, EntityManager>();

    if (Array.isArray(em)) {
      em.forEach(em => forks.set(em.name, em.fork({ useContext: true })));
    } else {
      forks.set(em.name, em.fork({ useContext: true }));
    }

    return new RequestContext(forks);
  }

}
