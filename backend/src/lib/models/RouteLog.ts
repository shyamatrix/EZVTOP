import { Model, DataTypes } from "sequelize";
import { sequelize } from "../clients/sequalize";

export class RouteLog extends Model {
  method!: string;
  route!: string;
}

RouteLog.init(
  {
    method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    route: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "api_route_logs",
    timestamps: true,
  }
);
