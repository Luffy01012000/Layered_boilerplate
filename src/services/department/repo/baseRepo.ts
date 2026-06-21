export default abstract class BaseRepository<
  TEntity,
  TCreateInput,
  TUpdateInput,
  TId = string
> {
  abstract create(data: TCreateInput): Promise<TEntity>

  abstract findById(id: TId): Promise<TEntity | null>

  abstract findAll(): Promise<TEntity[]>
  abstract update(id: TId, payload: TUpdateInput): Promise<TEntity>
  abstract delete(id: TId): Promise<TEntity>
}
