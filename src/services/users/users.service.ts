import { usersRepo } from '@infra/db/models/user/user.repo.js'

export interface ListUsersInput {
  page: number
  limit: number
  search?: string
}

export interface ListUsersResult {
  rows: unknown[]
  count: number
  page: number
  limit: number
}

export const usersService = {
  async list({
    page,
    limit,
    search
  }: ListUsersInput): Promise<ListUsersResult> {
    const offset = (page - 1) * limit
    const { rows, count } = await usersRepo.findAllPaginated({
      offset,
      limit,
      search
    })
    return { rows, count, page, limit }
  }
}
