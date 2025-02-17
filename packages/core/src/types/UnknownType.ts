import { StringType } from './StringType';
import type { EntityProperty } from '../typings';
import type { Platform } from '../platforms/Platform';

export class UnknownType extends StringType {

  getColumnType(prop: EntityProperty, platform: Platform) {
    return prop.columnTypes?.[0] ?? platform.getVarcharTypeDeclarationSQL(prop);
  }

  compareAsType(): string {
    return 'unknown';
  }

}
