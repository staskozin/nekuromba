declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TELEGRAM_API_KEY: string
      PGDATABASE: string
      PGUSER: string
      PGPASSWORD: string
      PGHOST: string
      PGPORT: string
    }
  }
}

export { }
