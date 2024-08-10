import color from "picocolors";

export class Logger {
  private static instance: Logger;

  private constructor(private readonly verbose: boolean) {}

  public static init(verbose: boolean) {
    Logger.instance = new Logger(verbose);
  }

  public static debug(text: string) {
    if (Logger.instance.verbose) {
      console.log(color.gray(`  [DEBUG] ${text}`));
    }
  }

  public static info(text: string) {
    console.log(color.blue(text));
  }

  public static error(err: string | Error) {
    console.error(`❌ ${color.red(err instanceof Error ? err.message : err)}`);
  }

  public static success(text: string) {
    console.log(`✔ ${color.green(text)}`);
  }
}
