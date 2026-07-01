import {
  Op,
  type Model,
  type ModelStatic,
  type Order,
  type WhereOptions
} from 'sequelize'
import { NotFoundError } from '@shared/errors/NotFoundError.js'
import BaseRepository from '@shared/repo/baseRepo.js'

export interface FindAllOpts<TEntity> {
  offset?: number
  limit?: number
  search?: string
  where?: WhereOptions<TEntity>
  order?: Order
}

export interface SequelizeRepositoryOpts {
  searchFields?: ReadonlyArray<string>
  defaultLimit?: number
  maxLimit?: number
}

export default class SequelizeRepository<
  TEntity extends Model,
  TCreateInput,
  TId = string
> extends BaseRepository<TEntity, TCreateInput, TId> {
  constructor(
    private readonly model: ModelStatic<TEntity>,
    private readonly opts: SequelizeRepositoryOpts = {}
  ) {
    super()
  }

  async create(input: TCreateInput): Promise<TEntity> {
    return (await this.model.create(input as any)) as TEntity
  }

  async findById(id: TId): Promise<TEntity | null> {
    return (await this.model.findByPk(id as any)) as TEntity | null
  }

  async findAll(): Promise<TEntity[]> {
    throw new Error('findAll(): use findAllPaginated() on SequelizeRepository')
  }

  async findAllPaginated(
    opts: FindAllOpts<TEntity> = {}
  ): Promise<{ rows: TEntity[]; count: number }> {
    const { offset, limit, search, where = {}, order } = opts
    const searchWhere =
      search && this.opts.searchFields && this.opts.searchFields.length > 0
        ? {
            [Op.or]: this.opts.searchFields.map((f) => ({
              [f]: { [Op.iLike]: `%${search}%` }
            }))
          }
        : {}

    return this.model.findAndCountAll({
      where: { ...searchWhere, ...(where as object) } as any,
      offset,
      limit,
      order
    }) as Promise<{ rows: TEntity[]; count: number }>
  }

  async update(id: TId, payload: object): Promise<TEntity> {
    const row = await this.findById(id)
    if (!row) throw new NotFoundError()
    return (await row.update(payload as any)) as TEntity
  }

  async delete(id: TId): Promise<TEntity> {
    const row = await this.findById(id)
    if (!row) throw new NotFoundError()
    await row.destroy()
    return row
  }
}
