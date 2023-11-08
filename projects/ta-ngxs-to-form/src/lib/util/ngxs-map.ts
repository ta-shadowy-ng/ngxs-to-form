export class NgxsMap<T> {
  private data: { [key: string]: T } = {};

  add(key: string, value: T) {
    this.data[key] = value;
  }

  get(key: string): T {
    return this.data[key];
  }
}
