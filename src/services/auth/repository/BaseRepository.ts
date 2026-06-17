export default abstract class BaseRepository<
  TEntity,
  TCreateInput,
  TId = number
> {
  abstract create(data: TCreateInput): Promise<TEntity>

  abstract findById(id: TId): Promise<TEntity | null>

  abstract findAll(): Promise<TEntity[]>
}
