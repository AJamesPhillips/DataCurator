/**
 * Run with  `node compiled_all/scripts/demo_sequelize.js`
 */

import {
    Sequelize,
    DataTypes,
    UUIDV4,
    Dialect,
    Model,
    ModelAttributeColumnOptions,
    ModelOptions,
    Options,
} from "sequelize"

const config: Options = {
    protocol: "postgres",

    database: "napthr_demo",
    username: "postgres",
    password: "",
    host: "127.0.0.1",
    port: 5432,
    dialect: "postgres" as Dialect,

    pool: {
        max: 10,
        min: 1,
        idle: 10000,
    },
    logging: console.log,
    dialectOptions: {
        ssl: false,
    },

    define: {
        timestamps: true
    },
}

const sequelize = new Sequelize(config)

const UserFields: { [field_name: string]: ModelAttributeColumnOptions } = {
    uuid: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
    },
    created_at: {
        type: DataTypes.DATE(6),
        allowNull: false,
    },
    modified_at: {
        type: DataTypes.DATE(6),
        allowNull: true,
    },
    deleted_at: {
        type: DataTypes.DATE(6),
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}

interface UserDbFields {
    uuid: string
    created_at: Date
    modified_at: Date | null
    deleted_at: Date | null
    email: string
}
type UserDbInstance = Model<UserDbFields>

const DEFINE_OPTIONS: ModelOptions<UserDbInstance> = {
    paranoid: true,
    freezeTableName: true,
    timestamps: true,
    underscored: true,
    // We specify these explicitly even though sequelize does a fine job of this
    createdAt: "created_at",
    deletedAt: "deleted_at",
    updatedAt: "modified_at",
}


const UserDb = sequelize.define<UserDbInstance, Partial<UserDbFields>>("demo_user", UserFields, DEFINE_OPTIONS)

function usersToJson (users: UserDbInstance[]) {
    const accum: UserDbFields[] = []
    users.forEach(user =>
    {
        accum.push(user.toJSON() as any)
    })
    return accum
}


UserDb.sync({force: true})
.then(() =>
{
    console.log("\nSync'd user table")
    return UserDb.create({
        email: "John",
    } as any)
})
.then(user =>
{
    const new_user = user.toJSON() as UserDbFields
    console.log("\ncreated user:", new_user)

    return UserDb.findOne({ where: { uuid: new_user.uuid } })
})
.then(found_user =>
{
    const user = found_user!.toJSON() as UserDbFields
    console.log("\nfound user:", user)
    return UserDb.findAll({ where: { } })
})
.then(users =>
{
    console.log("\nfound users (sequelize model):", users)
    console.log("\nfound users (POJO):", usersToJson(users))
    return UserDb.findAll({ where: { uuid: "abcdef01-2345-6789-abcd-ef0123456789" } })
})
.then(users =>
{
    if (users.length) throw new Error("Really?!  That was a 1 in 3.402823669 E38 chance.  Buy a lottery ticket.  Now!  )")
    console.log("\ncorrectly found no users:", usersToJson(users))
    return UserDb.update({ email: "new email" }, { where: {}, returning: true })
})
.then(result =>
{
    const num = result[0]
    const users = result[1]
    if (num === 0)  throw new Error("Should have updated one user")
    console.log("\nfound " + num + " users whilst updating them:", usersToJson(users))
})
