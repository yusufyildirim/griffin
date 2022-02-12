import { Command, Flags } from '@oclif/core'
import { runMetro } from '@griffin/metro'
import { runGriffinServer } from '@griffin/server'
export default class Start extends Command {
  static description = 'describe the command here'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    // flag with a value (-n, --name=VALUE)
    name: Flags.string({ char: 'n', description: 'name to print' }),
    // flag with no value (-f, --force)
    force: Flags.boolean({ char: 'f' }),
  }

  static args = [{ name: 'file' }]

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Start)

    const [_metroHttpServer, hmrService] = await runMetro()
    const _griffinServer = await runGriffinServer(hmrService)
  }
}
