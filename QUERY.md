Complex Query #1

Get department stats.

GET /departments/stats

Response:

{
"department":"Engineering",
"employeeCount":150,
"averageSalary":75000
}

SQL knowledge gets tested here.

Complex Query #2

Top Paid Employees

GET /employees/top-paid

Response:

[
{
"name":"John",
"salary":120000
}
]
Complex Query #3

Employees With Department And Role

Prisma

include:{
department:true,
role:true
}

TypeORM

relations:[
"department",
"role"
]

Sequelize

include:[
Department,
Role
]

Drizzle

leftJoin(...)

This teaches ORM differences.

Soft Delete

Another interview favorite.

Instead of:

DELETE

Use:

deletedAt
employee.deletedAt =
new Date()

Query

where:{
deletedAt:null
}
RBAC

Add:

Admin
Manager
Employee

Permissions

Admin
Create User
Delete User

Manager
View Team

Employee
View Self

Interviewers ask this constantly.
