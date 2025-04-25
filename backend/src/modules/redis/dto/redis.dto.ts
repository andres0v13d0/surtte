export class SetRedisDto {
  key: string;
  value: any;
  ttl?: number;
}

export class GetRedisDto {
  key: string;
}

export class DelRedisDto {
  key: string;
}

export class LPushRedisDto {
  key: string;
  value: any;
}

export class LRangeRedisDto {
  key: string;
  start: number;
  end: number;
}