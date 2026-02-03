import "dotenv/config";

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  isProd: process.env.NODE_ENV === "production",

  APP: {
    PORT: Number(process.env.PORT ?? 4000),
  },

  DB: {
    URL: process.env.DATABASE_URL,
  },

  AUTH: {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN ?? "7d") as
      | `${number}s`
      | `${number}m`
      | `${number}h`
      | `${number}d`,
  },
};
