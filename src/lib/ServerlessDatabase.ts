import { SchemaVaultsPostgresNeonProxyAdapter } from "@schemavaults/dbh";
import type { MailDatabase } from "./mail-db";
import type { ISchemaVaultsPostgresNeonProxyAdapterConstructorOpts } from "@schemavaults/dbh/dist/schemavaults-postgres-neon-proxy-adapter";
import type { SchemaVaultsAppEnvironment } from "@schemavaults/auth-react-provider";
import { getAppEnvironment } from "@schemavaults/app-definitions";

export class ServerlessDatabase
  extends SchemaVaultsPostgresNeonProxyAdapter<MailDatabase>
  implements AsyncDisposable
{
  private constructor(
    opts: ISchemaVaultsPostgresNeonProxyAdapterConstructorOpts,
  ) {
    super(opts);
  }

  public async [Symbol.asyncDispose](): Promise<void> {
    return this.destroy();
  }

  public static getAsyncResource(
    environment: SchemaVaultsAppEnvironment = getAppEnvironment(),
  ): ServerlessDatabase {
    return new ServerlessDatabase({
      environment,
    });
  }
}
