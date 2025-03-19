export abstract class Mapper<A, B> {
  abstract map(a: A): B;

  mapList(a: A[]): B[] {
    return a.map((a) => this.map(a));
  }
}
