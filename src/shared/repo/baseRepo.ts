export default abstract class BaseRepository<
  TEntity,
  TCreateInput,
  TId = string
> {
  abstract create(data: TCreateInput): Promise<TEntity>

  abstract findById(id: TId): Promise<TEntity | null>

  abstract findAll(): Promise<TEntity[]>
  abstract update(id: TId, payload: object): Promise<TEntity>
  abstract delete(id: TId): Promise<TEntity>
}
