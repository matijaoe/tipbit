import { readFileSync } from 'fs'

export const checkExistingEnvKey = (key: string): boolean => {
  try {
    // Check runtime env first
    const runtimeValue = process.env[key]
    if (runtimeValue && runtimeValue.trim()) {
      console.log('\x1b[33m%s\x1b[0m', `Warning: ${key} is already defined in environment`)
      return true
    }

    // Check .env file
    const envFile = readFileSync('.env', 'utf8')
    const hasKey = envFile.split('\n').some((line) => {
      const [envKey, envValue] = line.trim().split('=')
      return envKey === key && envValue && envValue.trim()
    })

    if (hasKey) {
      console.log('\x1b[33m%s\x1b[0m', `Warning: ${key} is already defined in .env file`)
      return true
    }

    return false
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error checking existing env key: ${error.message}`)
    } else {
      console.error(`Error checking existing env key: ${error}`)
    }
    // .env file doesn't exist, that's fine
    return false
  }
}
