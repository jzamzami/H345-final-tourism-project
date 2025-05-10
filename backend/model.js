import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "database.sqlite",
});

const user = sequelize.define("user", {
    userID: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },

    userAge: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    userBudget: {
        type: DataTypes.REAL,
        allowNull: false,
    },

    travelDuration: {
        type: DataTypes.REAL,
        allowNull: false,
    },

    currentView: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    travelHistory: {
        type: DataTypes.JSON,
        allowNull: true,
    },

    locationsOfInterest: {
        type: DataTypes.JSON,
        allowNull: true,
    },

    userPriorities: {
        type: DataTypes.JSON,
        allowNull: true,
    },
});

export class _SQLiteTaskModel {
    constructor() {
        this.model = user;
    }

    async init(fresh = false) {
        await sequelize.authenticate();
        await sequelize.sync({ force: true });

        if (fresh) {
            await this.delete();
            await this.create({
                userID: "jzam04",
                userAge: 20,
                userBudget: 2000,
                travelDuration: 10,
                currentView: "frontPage",
                travelHistory: defaulTravelHistory,
                locationsOfInterest: defaultLocationsOfInterest,
                userPriorities: defaulUserPriorities
            });
        }
    }
}