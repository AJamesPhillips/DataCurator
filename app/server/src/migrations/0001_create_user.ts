import { QueryInterface, Sequelize, DataTypes } from "sequelize"

import { BASE_FIELDS, TABLE_NAMES } from "../base/db"

export = {
    up: function(queryInterface: QueryInterface, Sequelize: Sequelize) {

        const USER_FIELDS = {
            ...BASE_FIELDS,
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
        }

        return queryInterface.createTable(TABLE_NAMES.USER, USER_FIELDS)
    },

    down: function(queryInterface: QueryInterface) {

        return queryInterface.dropTable(TABLE_NAMES.USER)
    }
}
