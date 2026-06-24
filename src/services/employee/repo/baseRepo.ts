import { EmployeeQueryDto } from '../validation/empQuery.js'

export default abstract class BaseRepository<
  TEntity,
  TCreateInput,
  TUpdateInput,
  TId = string
> {
  abstract create(data: TCreateInput): Promise<TEntity>

  abstract findById(id: TId): Promise<TEntity | null>

  abstract findAll(query: EmployeeQueryDto): Promise<TEntity[]>
  abstract update(id: TId, payload: TUpdateInput): Promise<TEntity>
  abstract delete(id: TId): Promise<TEntity>
}
